import { useState } from 'react';
import { createParty, createQuestionnaire, submitQuestionnaire } from '../services/api';

const QuestionnairePage = () => {
  const [formData, setFormData] = useState({
    legalName: '',
    businessActivity: '',
    marketsServed: '',
    registrationNumber: '',
    country: '',
    businessAddress: ''
  });
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create party
      const partyRes = await createParty({
        ...formData,
        status: 'DRAFT',
        createdBy: 'party_user'
      });

      const partyId = partyRes.data.id;

      // Create questionnaire with answers
      const answers = [
        { questionId: 'q_001', questionText: 'Legal Name', answer: formData.legalName },
        { questionId: 'q_002', questionText: 'Business Activity', answer: formData.businessActivity },
        { questionId: 'q_003', questionText: 'Markets Served', answer: formData.marketsServed },
        { questionId: 'q_004', questionText: 'Registration Number', answer: formData.registrationNumber },
        { questionId: 'q_005', questionText: 'Country', answer: formData.country },
        { questionId: 'q_006', questionText: 'Business Address', answer: formData.businessAddress }
      ];

      const questionnaireRes = await createQuestionnaire({
        partyId,
        answers,
        createdBy: 'party_user'
      });

      // Submit questionnaire
      await submitQuestionnaire(questionnaireRes.data.id, {
        submittedBy: 'party_user'
      });

      setStatus('SUBMITTED');
      setMessage('KYC Questionnaire submitted successfully! Pending QC verification.');
      setFormData({
        legalName: '',
        businessActivity: '',
        marketsServed: '',
        registrationNumber: '',
        country: '',
        businessAddress: ''
      });
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setMessage('Error submitting questionnaire. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">KYC Questionnaire</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded ${status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Name *
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ABC Trading Pvt Ltd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Activity *
            </label>
            <input
              type="text"
              name="businessActivity"
              value={formData.businessActivity}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Wholesale Distribution"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Markets Served *
            </label>
            <input
              type="text"
              name="marketsServed"
              value={formData.marketsServed}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="India, UAE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number *
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="REG123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="India"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address *
            </label>
            <textarea
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Business Street, Mumbai"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Questionnaire'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionnairePage;
