const express = require('express');
const router = express.Router();
const { EditRequestRepository, QuestionnaireAnswerRepository, QuestionnaireRepository, PartyRepository, AmendmentRepository } = require('../repositories/repository');
const AuditService = require('../services/auditService');

// Create an edit request
router.post('/', (req, res) => {
  try {
    const { partyId, questionnaireId, questionId, questionText, currentValue, requestedValue, reason, attachment, createdBy } = req.body;

    const party = PartyRepository.findById(partyId);
    if (!party) {
      return res.status(404).json({ success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' } });
    }

    if (party.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Party must be ACTIVE to request edits' } });
    }

    const editRequest = EditRequestRepository.create({
      partyId,
      questionnaireId,
      questionId,
      questionText,
      currentValue,
      requestedValue,
      reason,
      attachment,
      status: 'PENDING',
      createdBy
    });

    AuditService.log({
      entityType: 'EDIT_REQUEST',
      entityId: editRequest.id,
      action: 'EDIT_REQUEST_CREATED',
      actorId: createdBy,
      oldValue: null,
      newValue: JSON.stringify(editRequest)
    });

    res.status(201).json(editRequest);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get all edit requests
router.get('/', (req, res) => {
  try {
    const { status, partyId } = req.query;
    let editRequests = EditRequestRepository.findAll();

    if (status) {
      editRequests = editRequests.filter(er => er.status === status);
    }
    if (partyId) {
      editRequests = editRequests.filter(er => er.partyId === partyId);
    }

    // Enrich with party names
    const enriched = editRequests.map(er => {
      const party = PartyRepository.findById(er.partyId);
      return {
        ...er,
        partyName: party ? party.legalName : 'Unknown'
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get edit request by ID
router.get('/:id', (req, res) => {
  try {
    const editRequest = EditRequestRepository.findById(req.params.id);
    if (!editRequest) {
      return res.status(404).json({ success: false, error: { code: 'EDIT_REQUEST_NOT_FOUND', message: 'Edit request not found' } });
    }

    const party = PartyRepository.findById(editRequest.partyId);
    res.json({
      ...editRequest,
      partyName: party ? party.legalName : 'Unknown'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Approve edit request (V.O.S)
router.post('/:id/approve', (req, res) => {
  try {
    const editRequest = EditRequestRepository.findById(req.params.id);
    if (!editRequest) {
      return res.status(404).json({ success: false, error: { code: 'EDIT_REQUEST_NOT_FOUND', message: 'Edit request not found' } });
    }

    if (editRequest.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Edit request must be in PENDING status' } });
    }

    const updatedEditRequest = EditRequestRepository.update(req.params.id, {
      status: 'APPROVED',
      approvedBy: req.body.approvedBy || 'vos_admin',
      approvedAt: new Date().toISOString()
    });

    // Apply the edit to questionnaire (this updates the actual data)
    const answer = QuestionnaireAnswerRepository.findByQuestionnaireId(editRequest.questionnaireId)
      .find(a => a.questionId === editRequest.questionId);
    
    if (answer) {
      QuestionnaireAnswerRepository.update(answer.id, {
        answer: editRequest.requestedValue
      });
    }

    // Automatically create an amendment for QC review
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
      entityType: 'EDIT_REQUEST',
      entityId: editRequest.id,
      action: 'EDIT_REQUEST_APPROVED',
      actorId: req.body.approvedBy || 'vos_admin',
      oldValue: JSON.stringify(editRequest),
      newValue: JSON.stringify(updatedEditRequest)
    });

    AuditService.log({
      entityType: 'AMENDMENT',
      entityId: amendment.id,
      action: 'AMENDMENT_CREATED',
      actorId: 'system',
      oldValue: null,
      newValue: JSON.stringify(amendment)
    });

    res.json({
      editRequest: updatedEditRequest,
      amendment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Reject edit request (V.O.S)
router.post('/:id/reject', (req, res) => {
  try {
    const editRequest = EditRequestRepository.findById(req.params.id);
    if (!editRequest) {
      return res.status(404).json({ success: false, error: { code: 'EDIT_REQUEST_NOT_FOUND', message: 'Edit request not found' } });
    }

    if (editRequest.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Edit request must be in PENDING status' } });
    }

    const updatedEditRequest = EditRequestRepository.update(req.params.id, {
      status: 'REJECTED',
      rejectedBy: req.body.rejectedBy || 'vos_admin',
      rejectedAt: new Date().toISOString(),
      rejectionReason: req.body.rejectionReason
    });

    AuditService.log({
      entityType: 'EDIT_REQUEST',
      entityId: editRequest.id,
      action: 'EDIT_REQUEST_REJECTED',
      actorId: req.body.rejectedBy || 'vos_admin',
      oldValue: JSON.stringify(editRequest),
      newValue: JSON.stringify(updatedEditRequest)
    });

    res.json(updatedEditRequest);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
