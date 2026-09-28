const express = require('express');
const router = express.Router();
const { PartyRepository, QuestionnaireRepository, QuestionnaireAnswerRepository } = require('../repositories/repository');
const AuditService = require('../services/auditService');

// Create a new party
router.post('/', (req, res) => {
  try {
    const party = PartyRepository.create(req.body);
    
    AuditService.log({
      entityType: 'PARTY',
      entityId: party.id,
      action: 'PARTY_CREATED',
      actorId: req.body.createdBy || 'system',
      oldValue: null,
      newValue: JSON.stringify(party)
    });

    res.status(201).json(party);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get party by ID
router.get('/:id', (req, res) => {
  try {
    const party = PartyRepository.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' } });
    }
    res.json(party);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get party's questionnaire
router.get('/:id/questionnaire', (req, res) => {
  try {
    const party = PartyRepository.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' } });
    }

    const questionnaires = QuestionnaireRepository.findByPartyId(req.params.id);
    if (questionnaires.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'QUESTIONNAIRE_NOT_FOUND', message: 'Questionnaire not found' } });
    }

    const questionnaire = questionnaires[questionnaires.length - 1]; // Get latest
    const answers = QuestionnaireAnswerRepository.findByQuestionnaireId(questionnaire.id);

    res.json({
      ...questionnaire,
      answers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Update party
router.put('/:id', (req, res) => {
  try {
    const party = PartyRepository.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' } });
    }

    const updatedParty = PartyRepository.update(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString()
    });

    AuditService.log({
      entityType: 'PARTY',
      entityId: party.id,
      action: 'PARTY_UPDATED',
      actorId: req.body.updatedBy || 'system',
      oldValue: JSON.stringify(party),
      newValue: JSON.stringify(updatedParty)
    });

    res.json(updatedParty);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
