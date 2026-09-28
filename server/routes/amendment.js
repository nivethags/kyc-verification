const express = require('express');
const router = express.Router();
const { AmendmentRepository, PartyRepository, VerificationItemRepository, GateReopenSignalRepository } = require('../repositories/repository');
const AuditService = require('../services/auditService');

// Get all amendments with filters
router.get('/', (req, res) => {
  try {
    const { gate, listingImpact, questionnaireVersion, status, partyId } = req.query;
    
    const filters = {};
    if (gate) filters.gate = gate;
    if (listingImpact !== undefined) filters.listingImpact = listingImpact === 'true';
    if (questionnaireVersion) filters.questionnaireVersion = parseInt(questionnaireVersion);
    if (status) filters.status = status;
    if (partyId) filters.partyId = partyId;

    let amendments = AmendmentRepository.findAll(filters);

    // Enrich with party names
    const enriched = amendments.map(a => {
      const party = PartyRepository.findById(a.partyId);
      return {
        ...a,
        partyName: party ? party.legalName : 'Unknown'
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get amendment by ID
router.get('/:id', (req, res) => {
  try {
    const amendment = AmendmentRepository.findById(req.params.id);
    if (!amendment) {
      return res.status(404).json({ success: false, error: { code: 'AMENDMENT_NOT_FOUND', message: 'Amendment not found' } });
    }

    const party = PartyRepository.findById(amendment.partyId);
    res.json({
      ...amendment,
      partyName: party ? party.legalName : 'Unknown'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Make amendment decision
router.post('/:id/decision', (req, res) => {
  try {
    const { decision, note, decidedBy } = req.body;

    const amendment = AmendmentRepository.findById(req.params.id);
    if (!amendment) {
      return res.status(404).json({ success: false, error: { code: 'AMENDMENT_NOT_FOUND', message: 'Amendment not found' } });
    }

    // Check if already decided
    if (amendment.status !== 'PENDING') {
      return res.status(409).json({ 
        success: false, 
        error: { 
          code: 'AMENDMENT_ALREADY_DECIDED', 
          message: 'This amendment has already been decided.' 
        } 
      });
    }

    // Validate decision
    const validDecisions = ['ACCEPT_REOPEN', 'ACCEPT_NO_REVERIFICATION', 'REFUSE'];
    if (!validDecisions.includes(decision)) {
      return res.status(422).json({ 
        success: false, 
        error: { 
          code: 'INVALID_DECISION', 
          message: 'Invalid decision type' 
        } 
      });
    }

    let updatedAmendment;
    let reopenSignal = null;

    if (decision === 'ACCEPT_REOPEN') {
      // Validate target gate
      if (!amendment.targetGate) {
        return res.status(422).json({ 
          success: false, 
          error: { 
            code: 'TARGET_GATE_REQUIRED', 
            message: 'Target gate is required for reopen decision' 
          } 
        });
      }

      // Mark invalidated items as stale
      if (amendment.invalidatedItems && Array.isArray(amendment.invalidatedItems)) {
        amendment.invalidatedItems.forEach(item => {
          if (item.id) {
            VerificationItemRepository.updateStatus(item.id, 'STALE');
          }
        });
      }

      // Create reopen signal
      const signal = GateReopenSignalRepository.create({
        amendmentId: amendment.id,
        partyId: amendment.partyId,
        gate: amendment.targetGate,
        gateNumber: amendment.targetGateNumber,
        reason: `Amendment accepted: ${amendment.reason}`,
        invalidatedItemIds: amendment.invalidatedItems.map(i => i.id).filter(Boolean),
        status: 'SENT',
        queueEntryId: `queue_${Date.now()}`
      });

      // Update party status to re-verification
      PartyRepository.update(amendment.partyId, {
        status: 'REVERIFICATION'
      });

      reopenSignal = {
        gate: amendment.targetGate,
        queueEntryId: signal.queueEntryId
      };

      updatedAmendment = AmendmentRepository.update(req.params.id, {
        status: 'ACCEPTED_REOPENED',
        decision,
        decisionNote: note,
        decidedBy: decidedBy || 'qc_admin',
        decidedAt: new Date().toISOString()
      });

      AuditService.log({
        entityType: 'AMENDMENT',
        entityId: amendment.id,
        action: 'AMENDMENT_ACCEPTED_REOPENED',
        actorId: decidedBy || 'qc_admin',
        oldValue: JSON.stringify(amendment),
        newValue: JSON.stringify(updatedAmendment)
      });

    } else if (decision === 'ACCEPT_NO_REVERIFICATION') {
      // No invalidation, no reopen
      updatedAmendment = AmendmentRepository.update(req.params.id, {
        status: 'ACCEPTED_NO_REVERIFY',
        decision,
        decisionNote: note,
        decidedBy: decidedBy || 'qc_admin',
        decidedAt: new Date().toISOString()
      });

      AuditService.log({
        entityType: 'AMENDMENT',
        entityId: amendment.id,
        action: 'AMENDMENT_ACCEPTED_NO_REVERIFICATION',
        actorId: decidedBy || 'qc_admin',
        oldValue: JSON.stringify(amendment),
        newValue: JSON.stringify(updatedAmendment)
      });

    } else if (decision === 'REFUSE') {
      // Original answer remains, no changes
      updatedAmendment = AmendmentRepository.update(req.params.id, {
        status: 'REFUSED',
        decision,
        decisionNote: note,
        decidedBy: decidedBy || 'qc_admin',
        decidedAt: new Date().toISOString()
      });

      AuditService.log({
        entityType: 'AMENDMENT',
        entityId: amendment.id,
        action: 'AMENDMENT_REFUSED',
        actorId: decidedBy || 'qc_admin',
        oldValue: JSON.stringify(amendment),
        newValue: JSON.stringify(updatedAmendment)
      });
    }

    res.json({
      amendmentId: updatedAmendment.id,
      status: updatedAmendment.status,
      decision: updatedAmendment.decision,
      decidedBy: updatedAmendment.decidedBy,
      decidedAt: updatedAmendment.decidedAt,
      reopenSignal
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
