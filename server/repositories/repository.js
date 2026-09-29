const Storage = require('./storage');
const { Party, Questionnaire, QuestionnaireAnswer, EditRequest, Amendment, VerificationItem, GateReopenSignal, AuditLog } = require('../models/models');

const PartyRepository = {
  create(data) {
    const party = new Party(data);
    return Storage.add('parties', party);
  },

  findById(id) {
    return Storage.find('parties', p => p.id === id);
  },

  findAll() {
    return Storage.get('parties');
  },

  update(id, updates) {
    return Storage.update('parties', id, updates);
  },

  delete(id) {
    return Storage.delete('parties', id);
  }
};

const QuestionnaireRepository = {
  create(data) {
    const questionnaire = new Questionnaire(data);
    return Storage.add('questionnaires', questionnaire);
  },

  findById(id) {
    return Storage.find('questionnaires', q => q.id === id);
  },

  findByPartyId(partyId) {
    return Storage.filter('questionnaires', q => q.partyId === partyId);
  },

  findAll() {
    return Storage.get('questionnaires');
  },

  update(id, updates) {
    return Storage.update('questionnaires', id, updates);
  },

  delete(id) {
    return Storage.delete('questionnaires', id);
  }
};

const QuestionnaireAnswerRepository = {
  create(data) {
    const answer = new QuestionnaireAnswer(data);
    return Storage.add('questionnaireAnswers', answer);
  },

  findById(id) {
    return Storage.find('questionnaireAnswers', a => a.id === id);
  },

  findByQuestionnaireId(questionnaireId) {
    return Storage.filter('questionnaireAnswers', a => a.questionnaireId === questionnaireId);
  },

  update(id, updates) {
    return Storage.update('questionnaireAnswers', id, updates);
  },

  delete(id) {
    return Storage.delete('questionnaireAnswers', id);
  }
};

const EditRequestRepository = {
  create(data) {
    const editRequest = new EditRequest(data);
    return Storage.add('editRequests', editRequest);
  },

  findById(id) {
    return Storage.find('editRequests', e => e.id === id);
  },

  findByPartyId(partyId) {
    return Storage.filter('editRequests', e => e.partyId === partyId);
  },

  findByStatus(status) {
    return Storage.filter('editRequests', e => e.status === status);
  },

  findAll() {
    return Storage.get('editRequests');
  },

  update(id, updates) {
    return Storage.update('editRequests', id, updates);
  },

  delete(id) {
    return Storage.delete('editRequests', id);
  }
};

const AmendmentRepository = {
  create(data) {
    const amendment = new Amendment(data);
    return Storage.add('amendments', amendment);
  },

  findById(id) {
    return Storage.find('amendments', a => a.id === id);
  },

  findByPartyId(partyId) {
    return Storage.filter('amendments', a => a.partyId === partyId);
  },

  findByEditRequestId(editRequestId) {
    return Storage.filter('amendments', a => a.editRequestId === editRequestId);
  },

  findByStatus(status) {
    return Storage.filter('amendments', a => a.status === status);
  },

  findAll(filters = {}) {
    let amendments = Storage.get('amendments');
    
    if (filters.gate) {
      amendments = amendments.filter(a => a.targetGate === filters.gate);
    }
    if (filters.listingImpact !== undefined) {
      amendments = amendments.filter(a => a.listingImpact === filters.listingImpact);
    }
    if (filters.questionnaireVersion) {
      amendments = amendments.filter(a => a.questionnaireVersion === filters.questionnaireVersion);
    }
    if (filters.status) {
      amendments = amendments.filter(a => a.status === filters.status);
    }
    if (filters.partyId) {
      amendments = amendments.filter(a => a.partyId === filters.partyId);
    }
    if (filters.editRequestId) {
      amendments = amendments.filter(a => a.editRequestId === filters.editRequestId);
    }
    
    return amendments;
  },

  update(id, updates) {
    return Storage.update('amendments', id, updates);
  },

  delete(id) {
    return Storage.delete('amendments', id);
  }
};

const VerificationItemRepository = {
  create(data) {
    const item = new VerificationItem(data);
    return Storage.add('verificationItems', item);
  },

  findById(id) {
    return Storage.find('verificationItems', v => v.id === id);
  },

  findByPartyId(partyId) {
    return Storage.filter('verificationItems', v => v.partyId === partyId);
  },

  findByGate(gate) {
    return Storage.filter('verificationItems', v => v.gate === gate);
  },

  update(id, updates) {
    return Storage.update('verificationItems', id, updates);
  },

  updateStatus(id, status) {
    return Storage.update('verificationItems', id, { 
      status, 
      staleAt: status === 'STALE' ? new Date().toISOString() : null 
    });
  },

  delete(id) {
    return Storage.delete('verificationItems', id);
  }
};

const GateReopenSignalRepository = {
  create(data) {
    const signal = new GateReopenSignal(data);
    return Storage.add('gateReopenSignals', signal);
  },

  findById(id) {
    return Storage.find('gateReopenSignals', g => g.id === id);
  },

  findByAmendmentId(amendmentId) {
    return Storage.filter('gateReopenSignals', g => g.amendmentId === amendmentId);
  },

  findByPartyId(partyId) {
    return Storage.filter('gateReopenSignals', g => g.partyId === partyId);
  },

  update(id, updates) {
    return Storage.update('gateReopenSignals', id, updates);
  },

  delete(id) {
    return Storage.delete('gateReopenSignals', id);
  }
};

const AuditLogRepository = {
  create(data) {
    const log = new AuditLog(data);
    return Storage.add('auditLogs', log);
  },

  findByEntity(entityType, entityId) {
    return Storage.filter('auditLogs', a => a.entityType === entityType && a.entityId === entityId);
  },

  findByAction(action) {
    return Storage.filter('auditLogs', a => a.action === action);
  },

  findAll() {
    return Storage.get('auditLogs');
  }
};

module.exports = {
  PartyRepository,
  QuestionnaireRepository,
  QuestionnaireAnswerRepository,
  EditRequestRepository,
  AmendmentRepository,
  VerificationItemRepository,
  GateReopenSignalRepository,
  AuditLogRepository
};
