const express = require('express');
const router = express.Router();
const { QuestionnaireRepository, PartyRepository, VerificationItemRepository, GateReopenSignalRepository } = require('../repositories/repository');
const AuditService = require('../services/auditService');

// Get verification queue (submitted questionnaires)
router.get('/queue', (req, res) => {
  try {
    const questionnaires = QuestionnaireRepository.findAll()
      .filter(q => q.status === 'QC_REVIEW');

    const queue = questionnaires.map(q => {
      const party = PartyRepository.findById(q.partyId);
      return {
        ...q,
        partyName: party ? party.legalName : 'Unknown',
        partyId: q.partyId
      };
    });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Approve questionnaire
router.post('/:id/approve', (req, res) => {
  try {
    const questionnaire = QuestionnaireRepository.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ success: false, error: { code: 'QUESTIONNAIRE_NOT_FOUND', message: 'Questionnaire not found' } });
    }

    if (questionnaire.status !== 'QC_REVIEW') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Questionnaire must be in QC_REVIEW status' } });
    }

    const updatedQuestionnaire = QuestionnaireRepository.update(req.params.id, {
      status: 'ACTIVE',
      approvedAt: new Date().toISOString(),
      approvedBy: req.body.approvedBy || 'qc_admin'
    });

    // Update party status
    PartyRepository.update(questionnaire.partyId, {
      status: 'ACTIVE'
    });

    // Create verification items for all gates
    const gates = [
      { code: 'REGISTRATION', number: 1, name: 'Registration Certificate' },
      { code: 'LICENSING', number: 2, name: 'Business Licence' },
      { code: 'BANKING', number: 3, name: 'Bank Proof' },
      { code: 'BUSINESS', number: 4, name: 'Business Verification' },
      { code: 'LISTING', number: 5, name: 'Listing Verification' }
    ];

    gates.forEach(gate => {
      VerificationItemRepository.create({
        partyId: questionnaire.partyId,
        gate: gate.code,
        gateNumber: gate.number,
        type: 'DOCUMENT',
        name: gate.name,
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: req.body.approvedBy || 'qc_admin'
      });
    });

    AuditService.log({
      entityType: 'QUESTIONNAIRE',
      entityId: questionnaire.id,
      action: 'KYC_APPROVED',
      actorId: req.body.approvedBy || 'qc_admin',
      oldValue: JSON.stringify(questionnaire),
      newValue: JSON.stringify(updatedQuestionnaire)
    });

    res.json(updatedQuestionnaire);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Reject questionnaire
router.post('/:id/reject', (req, res) => {
  try {
    const questionnaire = QuestionnaireRepository.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ success: false, error: { code: 'QUESTIONNAIRE_NOT_FOUND', message: 'Questionnaire not found' } });
    }

    if (questionnaire.status !== 'QC_REVIEW') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Questionnaire must be in QC_REVIEW status' } });
    }

    const updatedQuestionnaire = QuestionnaireRepository.update(req.params.id, {
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      rejectedBy: req.body.rejectedBy || 'qc_admin',
      rejectionReason: req.body.rejectionReason
    });

    // Update party status
    PartyRepository.update(questionnaire.partyId, {
      status: 'REJECTED'
    });

    AuditService.log({
      entityType: 'QUESTIONNAIRE',
      entityId: questionnaire.id,
      action: 'KYC_REJECTED',
      actorId: req.body.rejectedBy || 'qc_admin',
      oldValue: JSON.stringify(questionnaire),
      newValue: JSON.stringify(updatedQuestionnaire)
    });

    res.json(updatedQuestionnaire);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Reopen gate (for amendment workflow)
router.post('/reopen', (req, res) => {
  try {
    const { partyId, amendmentId, gate, gateNumber, reason, invalidatedItemIds } = req.body;

    // Create reopen signal
    const signal = GateReopenSignalRepository.create({
      amendmentId,
      partyId,
      gate,
      gateNumber,
      reason,
      invalidatedItemIds,
      status: 'SENT',
      queueEntryId: `queue_${Date.now()}`
    });

    // Mark verification items as stale
    if (invalidatedItemIds && Array.isArray(invalidatedItemIds)) {
      invalidatedItemIds.forEach(itemId => {
        VerificationItemRepository.updateStatus(itemId, 'STALE');
      });
    }

    // Update party status to indicate re-verification needed
    PartyRepository.update(partyId, {
      status: 'REVERIFICATION'
    });

    AuditService.log({
      entityType: 'GATE_REOPEN',
      entityId: signal.id,
      action: 'GATE_REOPENED',
      actorId: 'system',
      oldValue: null,
      newValue: JSON.stringify(signal)
    });

    res.json({
      success: true,
      queueEntryId: signal.queueEntryId,
      status: 'REOPENED'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
