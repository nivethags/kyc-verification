const { AuditLogRepository } = require('../repositories/repository');

const AuditService = {
  log(data) {
    return AuditLogRepository.create(data);
  },

  getAuditTrail(entityType, entityId) {
    return AuditLogRepository.findByEntity(entityType, entityId);
  }
};

module.exports = AuditService;
