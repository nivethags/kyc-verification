const express = require('express');
const router = express.Router();
const { QuestionnaireRepository, QuestionnaireAnswerRepository, PartyRepository } = require('../repositories/repository');
const AuditService = require('../services/auditService');

// Create a new questionnaire
router.post('/', (req, res) => {
  try {
    const { partyId, answers } = req.body;
    
    const party = PartyRepository.findById(partyId);
    if (!party) {
      return res.status(404).json({ success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' } });
    }

    const questionnaire = QuestionnaireRepository.create({
      partyId,
      version: 1,
      status: 'DRAFT'
    });

    // Save answers
    if (answers && Array.isArray(answers)) {
      answers.forEach(answer => {
        QuestionnaireAnswerRepository.create({
          questionnaireId: questionnaire.id,
          ...answer
        });
      });
    }

    AuditService.log({
      entityType: 'QUESTIONNAIRE',
      entityId: questionnaire.id,
      action: 'QUESTIONNAIRE_CREATED',
      actorId: req.body.createdBy || 'system',
      oldValue: null,
      newValue: JSON.stringify(questionnaire)
    });

    res.status(201).json(questionnaire);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Get questionnaire by ID
router.get('/:id', (req, res) => {
  try {
    const questionnaire = QuestionnaireRepository.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ success: false, error: { code: 'QUESTIONNAIRE_NOT_FOUND', message: 'Questionnaire not found' } });
    }

    const answers = QuestionnaireAnswerRepository.findByQuestionnaireId(questionnaire.id);

    res.json({
      ...questionnaire,
      answers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Submit questionnaire for review
router.post('/:id/submit', (req, res) => {
  try {
    const questionnaire = QuestionnaireRepository.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ success: false, error: { code: 'QUESTIONNAIRE_NOT_FOUND', message: 'Questionnaire not found' } });
    }

    if (questionnaire.status !== 'DRAFT') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Questionnaire must be in DRAFT status to submit' } });
    }

    const updatedQuestionnaire = QuestionnaireRepository.update(req.params.id, {
      status: 'QC_REVIEW',
      submittedAt: new Date().toISOString()
    });

    // Update party status
    PartyRepository.update(questionnaire.partyId, {
      status: 'QC_REVIEW'
    });

    AuditService.log({
      entityType: 'QUESTIONNAIRE',
      entityId: questionnaire.id,
      action: 'QUESTIONNAIRE_SUBMITTED',
      actorId: req.body.submittedBy || 'system',
      oldValue: JSON.stringify(questionnaire),
      newValue: JSON.stringify(updatedQuestionnaire)
    });

    res.json(updatedQuestionnaire);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// Update questionnaire answers (only if DRAFT)
router.put('/:id', (req, res) => {
  try {
    const questionnaire = QuestionnaireRepository.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ success: false, error: { code: 'QUESTIONNAIRE_NOT_FOUND', message: 'Questionnaire not found' } });
    }

    if (questionnaire.status !== 'DRAFT') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Cannot modify submitted questionnaire' } });
    }

    const { answers } = req.body;
    
    if (answers && Array.isArray(answers)) {
      answers.forEach(answer => {
        const existingAnswer = QuestionnaireAnswerRepository.findByQuestionnaireId(questionnaire.id)
          .find(a => a.questionId === answer.questionId);
        
        if (existingAnswer) {
          QuestionnaireAnswerRepository.update(existingAnswer.id, {
            answer: answer.answer,
            updatedAt: new Date().toISOString()
          });
        } else {
          QuestionnaireAnswerRepository.create({
            questionnaireId: questionnaire.id,
            ...answer
          });
        }
      });
    }

    const updatedQuestionnaire = QuestionnaireRepository.update(req.params.id, {
      updatedAt: new Date().toISOString()
    });

    res.json(updatedQuestionnaire);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
