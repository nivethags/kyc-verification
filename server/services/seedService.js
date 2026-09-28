const { PartyRepository, QuestionnaireRepository, QuestionnaireAnswerRepository, EditRequestRepository, AmendmentRepository, VerificationItemRepository } = require('../repositories/repository');
const { Party, Questionnaire, QuestionnaireAnswer, EditRequest, Amendment, VerificationItem } = require('../models/models');

const SeedService = {
  seed() {
    // Check if data already exists
    const existingParties = PartyRepository.findAll();
    if (existingParties.length > 0) {
      console.log('Seed data already exists');
      return;
    }

    console.log('Seeding demo data...');

    // Create a demo party
    const party = PartyRepository.create({
      legalName: 'ABC Trading Pvt Ltd',
      businessActivity: 'Wholesale Distribution',
      marketsServed: 'India, UAE',
      registrationNumber: 'REG123456',
      country: 'India',
      businessAddress: '123 Business Street, Mumbai',
      status: 'ACTIVE'
    });

    // Create a questionnaire
    const questionnaire = QuestionnaireRepository.create({
      partyId: party.id,
      version: 1,
      status: 'ACTIVE',
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: 'qc_admin_001'
    });

    // Create questionnaire answers
    const answers = [
      {
        questionnaireId: questionnaire.id,
        questionId: 'q_001',
        questionText: 'Legal Name',
        answer: 'ABC Trading Pvt Ltd'
      },
      {
        questionnaireId: questionnaire.id,
        questionId: 'q_002',
        questionText: 'Business Activity',
        answer: 'Wholesale Distribution'
      },
      {
        questionnaireId: questionnaire.id,
        questionId: 'q_003',
        questionText: 'Markets Served',
        answer: 'India, UAE'
      },
      {
        questionnaireId: questionnaire.id,
        questionId: 'q_004',
        questionText: 'Registration Number',
        answer: 'REG123456'
      },
      {
        questionnaireId: questionnaire.id,
        questionId: 'q_005',
        questionText: 'Country',
        answer: 'India'
      },
      {
        questionnaireId: questionnaire.id,
        questionId: 'q_006',
        questionText: 'Business Address',
        answer: '123 Business Street, Mumbai'
      }
    ];

    answers.forEach(answer => {
      QuestionnaireAnswerRepository.create(answer);
    });

    // Create verification items
    const verificationItems = [
      {
        partyId: party.id,
        gate: 'REGISTRATION',
        gateNumber: 1,
        type: 'DOCUMENT',
        name: 'Registration Certificate',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'qc_admin_001'
      },
      {
        partyId: party.id,
        gate: 'LICENSING',
        gateNumber: 2,
        type: 'DOCUMENT',
        name: 'Business Licence',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'qc_admin_001'
      },
      {
        partyId: party.id,
        gate: 'BANKING',
        gateNumber: 3,
        type: 'DOCUMENT',
        name: 'Bank Proof',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'qc_admin_001'
      },
      {
        partyId: party.id,
        gate: 'BUSINESS',
        gateNumber: 4,
        type: 'VERIFICATION',
        name: 'Business Verification',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'qc_admin_001'
      },
      {
        partyId: party.id,
        gate: 'LISTING',
        gateNumber: 5,
        type: 'VERIFICATION',
        name: 'Listing Verification',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'qc_admin_001'
      }
    ];

    verificationItems.forEach(item => {
      VerificationItemRepository.create(item);
    });

    // Create an approved edit request
    const editRequest = EditRequestRepository.create({
      partyId: party.id,
      questionnaireId: questionnaire.id,
      questionId: 'q_001',
      questionText: 'Legal Name',
      currentValue: 'ABC Trading Pvt Ltd',
      requestedValue: 'ABC Trading Private Limited',
      reason: 'Legal entity name has been updated with new registration.',
      attachment: 'registration_update.pdf',
      status: 'APPROVED',
      createdBy: 'party_user_001',
      approvedBy: 'vos_admin_001',
      approvedAt: new Date().toISOString()
    });

    // Apply the edit to questionnaire
    const answer = QuestionnaireAnswerRepository.findByQuestionnaireId(questionnaire.id)
      .find(a => a.questionId === 'q_001');
    if (answer) {
      QuestionnaireAnswerRepository.update(answer.id, {
        answer: 'ABC Trading Private Limited'
      });
    }

    // Create an amendment from the approved edit request
    const amendment = AmendmentRepository.create({
      partyId: party.id,
      questionnaireId: questionnaire.id,
      editRequestId: editRequest.id,
      questionnaireVersion: 1,
      questionId: 'q_001',
      questionText: 'Legal Name',
      beforeValue: 'ABC Trading Pvt Ltd',
      afterValue: 'ABC Trading Private Limited',
      reason: 'Legal entity name has been updated with new registration.',
      targetGate: 'REGISTRATION',
      targetGateNumber: 1,
      listingImpact: true,
      invalidatedItems: [
        {
          id: verificationItems[0].id,
          type: 'DOCUMENT',
          name: 'Registration Certificate',
          previousStatus: 'VERIFIED',
          status: 'STALE',
          invalidatedReason: 'Legal name change affects registration document',
          invalidatedAt: new Date().toISOString()
        },
        {
          id: verificationItems[3].id,
          type: 'VERIFICATION',
          name: 'Business Verification',
          previousStatus: 'VERIFIED',
          status: 'STALE',
          invalidatedReason: 'Legal name change affects business verification',
          invalidatedAt: new Date().toISOString()
        }
      ],
      status: 'PENDING'
    });

    // Create another pending amendment for demo
    const amendment2 = AmendmentRepository.create({
      partyId: party.id,
      questionnaireId: questionnaire.id,
      editRequestId: null,
      questionnaireVersion: 1,
      questionId: 'q_002',
      questionText: 'Business Activity',
      beforeValue: 'Wholesale Distribution',
      afterValue: 'Wholesale & Retail Distribution',
      reason: 'The company has expanded its business operations to include retail.',
      targetGate: 'BUSINESS',
      targetGateNumber: 4,
      listingImpact: false,
      invalidatedItems: [],
      status: 'PENDING'
    });

    console.log('Seed data created successfully');
    console.log('Party ID:', party.id);
    console.log('Questionnaire ID:', questionnaire.id);
    console.log('Amendment ID:', amendment.id);
  }
};

module.exports = SeedService;
