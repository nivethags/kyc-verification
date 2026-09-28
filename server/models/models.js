// Data Models for KYC Verification System

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

class Party {
  constructor(data) {
    this.id = data.id || generateId('party');
    this.legalName = data.legalName;
    this.businessActivity = data.businessActivity;
    this.marketsServed = data.marketsServed;
    this.registrationNumber = data.registrationNumber;
    this.country = data.country;
    this.businessAddress = data.businessAddress;
    this.status = data.status || 'DRAFT';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class Questionnaire {
  constructor(data) {
    this.id = data.id || generateId('questionnaire');
    this.partyId = data.partyId;
    this.version = data.version || 1;
    this.status = data.status || 'DRAFT';
    this.submittedAt = data.submittedAt || null;
    this.approvedAt = data.approvedAt || null;
    this.approvedBy = data.approvedBy || null;
    this.rejectedAt = data.rejectedAt || null;
    this.rejectedBy = data.rejectedBy || null;
    this.rejectionReason = data.rejectionReason || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class QuestionnaireAnswer {
  constructor(data) {
    this.id = data.id || generateId('answer');
    this.questionnaireId = data.questionnaireId;
    this.questionId = data.questionId;
    this.questionText = data.questionText;
    this.answer = data.answer;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class EditRequest {
  constructor(data) {
    this.id = data.id || generateId('edit_request');
    this.partyId = data.partyId;
    this.questionnaireId = data.questionnaireId;
    this.questionId = data.questionId;
    this.questionText = data.questionText;
    this.currentValue = data.currentValue;
    this.requestedValue = data.requestedValue;
    this.reason = data.reason;
    this.attachment = data.attachment || null;
    this.status = data.status || 'PENDING';
    this.createdBy = data.createdBy;
    this.approvedBy = data.approvedBy || null;
    this.approvedAt = data.approvedAt || null;
    this.rejectedBy = data.rejectedBy || null;
    this.rejectedAt = data.rejectedAt || null;
    this.rejectionReason = data.rejectionReason || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class Amendment {
  constructor(data) {
    this.id = data.id || generateId('amendment');
    this.partyId = data.partyId;
    this.questionnaireId = data.questionnaireId;
    this.editRequestId = data.editRequestId;
    this.questionnaireVersion = data.questionnaireVersion;
    this.questionId = data.questionId;
    this.questionText = data.questionText;
    this.beforeValue = data.beforeValue;
    this.afterValue = data.afterValue;
    this.reason = data.reason;
    this.targetGate = data.targetGate;
    this.targetGateNumber = data.targetGateNumber;
    this.listingImpact = data.listingImpact;
    this.invalidatedItems = data.invalidatedItems || [];
    this.status = data.status || 'PENDING';
    this.decision = data.decision || null;
    this.decisionNote = data.decisionNote || null;
    this.decidedBy = data.decidedBy || null;
    this.decidedAt = data.decidedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class VerificationItem {
  constructor(data) {
    this.id = data.id || generateId('verification_item');
    this.partyId = data.partyId;
    this.gate = data.gate;
    this.gateNumber = data.gateNumber;
    this.type = data.type;
    this.name = data.name;
    this.status = data.status || 'PENDING';
    this.verifiedAt = data.verifiedAt || null;
    this.verifiedBy = data.verifiedBy || null;
    this.staleAt = data.staleAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class GateReopenSignal {
  constructor(data) {
    this.id = data.id || generateId('reopen_signal');
    this.amendmentId = data.amendmentId;
    this.partyId = data.partyId;
    this.gate = data.gate;
    this.gateNumber = data.gateNumber;
    this.reason = data.reason;
    this.invalidatedItemIds = data.invalidatedItemIds || [];
    this.status = data.status || 'PENDING';
    this.queueEntryId = data.queueEntryId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.processedAt = data.processedAt || null;
  }
}

class AuditLog {
  constructor(data) {
    this.id = data.id || generateId('audit');
    this.entityType = data.entityType;
    this.entityId = data.entityId;
    this.action = data.action;
    this.actorId = data.actorId;
    this.oldValue = data.oldValue || null;
    this.newValue = data.newValue || null;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = {
  Party,
  Questionnaire,
  QuestionnaireAnswer,
  EditRequest,
  Amendment,
  VerificationItem,
  GateReopenSignal,
  AuditLog,
  generateId
};
