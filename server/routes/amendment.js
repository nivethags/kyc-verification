const express = require('express');
const router = express.Router();
const { AmendmentRepository, PartyRepository, VerificationItemRepository, GateReopenSignalRepository, EditRequestRepository, QuestionnaireRepository } = require('../repositories/repository');
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

// Manual amendment creation (for data recovery)
router.post('/manual-create', (req, res) => {
  try {
    const { editRequestId } = req.body;

    const editRequest = EditRequestRepository.findById(editRequestId);
    if (!editRequest) {
      return res.status(404).json({ success: false, error: { code: 'EDIT_REQUEST_NOT_FOUND', message: 'Edit request not found' } });
    }

    if (editRequest.status !== 'APPROVED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Edit request must be APPROVED' } });
    }

    // Check if amendment already exists
    const existingAmendments = AmendmentRepository.findAll({ editRequestId });
    if (existingAmendments.length > 0) {
      return res.status(400).json({ success: false, error: { code: 'AMENDMENT_EXISTS', message: 'Amendment already exists for this edit request' } });
    }

    const questionnaire = QuestionnaireRepository.findById(editRequest.questionnaireId);
    
    // Determine target gate based on question
    const gateMapping = {
      'q_001': { gate: 'REGISTRATION', number: 1 },
      'q_002': { gate: 'BUSINESS', number: 4 },
      'q_003': { gate: 'BUSINESS', number: 4 },
      'q_004': { gate: 'REGISTRATION', number: 1 },
      'q_005': { gate: 'REGISTRATION', number: 1 },
      'q_006': { gate: 'REGISTRATION', number: 1 }
    };

    const targetGate = gateMapping[editRequest.questionId] || { gate: 'BUSINESS', number: 4 };

    // Find actual verification items to invalidate
    const verificationItems = VerificationItemRepository.findByPartyId(editRequest.partyId);
    const invalidatedItems = [];
    
    if (targetGate.gate === 'REGISTRATION') {
      const regItems = verificationItems.filter(v => v.gate === 'REGISTRATION');
      regItems.forEach(item => {
        invalidatedItems.push({
          id: item.id,
          type: item.type,
          name: item.name,
          previousStatus: item.status,
          status: 'STALE',
          invalidatedReason: 'Registration data changed',
          invalidatedAt: new Date().toISOString()
        });
      });
    }

    const amendment = AmendmentRepository.create({
      partyId: editRequest.partyId,
      questionnaireId: editRequest.questionnaireId,
      editRequestId: editRequest.id,
      questionnaireVersion: questionnaire ? questionnaire.version : 1,
      questionId: editRequest.questionId,
      questionText: editRequest.questionText,
      beforeValue: editRequest.currentValue,
      afterValue: editRequest.requestedValue,
      reason: editRequest.reason,
      targetGate: targetGate.gate,
      targetGateNumber: targetGate.number,
      listingImpact: targetGate.gate === 'REGISTRATION',
      invalidatedItems,
      status: 'PENDING'
    });

    AuditService.log({
      entityType: 'AMENDMENT',
      entityId: amendment.id,
      action: 'AMENDMENT_MANUAL_CREATE',
      actorId: req.body.createdBy || 'system',
      oldValue: null,
      newValue: JSON.stringify(amendment)
    });

    res.json(amendment);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
