import { useState, useEffect } from 'react';
import { getParties, getParty, getPartyQuestionnaire, createEditRequest, getEditRequests } from '../services/api';

const EditRequests = () => {
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [editRequests, setEditRequests] = useState([]);
  const [formData, setFormData] = useState({
    questionId: '',
    questionText: '',
    currentValue: '',
    requestedValue: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadActiveParties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadActiveParties = async () => {
    try {
      // Dynamically load all ACTIVE parties from the database
      const res = await getParties({ status: 'ACTIVE' });
      const activeParties = res.data;
      
      setParties(activeParties);
      
      // Automatically select the first active party if available
      if (activeParties.length > 0) {
        const firstActiveParty = activeParties[0];
        setSelectedParty(firstActiveParty);
        loadPartyQuestionnaire(firstActiveParty.id);
        loadEditRequests(firstActiveParty.id);
      }
    } catch (error) {
      console.error('Error loading parties:', error);
    }
  };

  const loadPartyQuestionnaire = async (partyId) => {
    try {
      const res = await getPartyQuestionnaire(partyId);
      setQuestionnaire(res.data);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    }
  };

  const loadEditRequests = async (partyId) => {
    try {
      const res = await getEditRequests({ partyId });
      setEditRequests(res.data);
    } catch (error) {
      console.error('Error loading edit requests:', error);
    }
  };

  const handleQuestionSelect = (answer) => {
    setFormData({
      questionId: answer.questionId,
      questionText: answer.questionText,
      currentValue: answer.answer,
      requestedValue: '',
      reason: ''
    });
  };

  const handlePartySelect = async (partyId) => {
    setSelectedParty(null);
    setQuestionnaire(null);
    setEditRequests([]);
    setFormData({
      questionId: '',
      questionText: '',
      currentValue: '',
      requestedValue: '',
      reason: ''
    });

    try {
      const partyRes = await getParty(partyId);
      setSelectedParty(partyRes.data);
      loadPartyQuestionnaire(partyId);
      loadEditRequests(partyId);
    } catch (error) {
      console.error('Error loading party:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParty || !questionnaire) {
      setMessage('Please select an active party first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await createEditRequest({
        partyId: selectedParty.id,
        questionnaireId: questionnaire.id,
        ...formData,
        createdBy: 'party_user'
      });

      setMessage('Edit request submitted successfully! Pending V.O.S approval.');
      setFormData({
        questionId: '',
        questionText: '',
        currentValue: '',
        requestedValue: '',
        reason: ''
      });
      loadEditRequests(selectedParty.id);
    } catch (error) {
      console.error('Error creating edit request:', error);
      setMessage('Error creating edit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Requests</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Request Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create Edit Request</h2>
          
          {/* Party Selection */}
          {parties.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Party
              </label>
              <select
                value={selectedParty?.id || ''}
                onChange={(e) => handlePartySelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.legalName}
                  </option>
                ))}
              </select>
              {selectedParty && (
                <div className="mt-2 text-sm text-gray-600">
                  Working with: <span className="font-medium">{selectedParty.legalName}</span>
                </div>
              )}
            </div>
          )}
          
          {!selectedParty ? (
            <div className="text-gray-600">No active party found. Please complete KYC first.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field to Edit *
                </label>
                <select
                  value={formData.questionId}
                  onChange={(e) => {
                    const answer = questionnaire?.answers?.find(a => a.questionId === e.target.value);
                    if (answer) handleQuestionSelect(answer);
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a field</option>
                  {questionnaire?.answers?.map((answer) => (
                    <option key={answer.questionId} value={answer.questionId}>
                      {answer.questionText}
                    </option>
                  ))}
                </select>
              </div>

              {formData.currentValue && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Value
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded">
                      {formData.currentValue}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Value *
                    </label>
                    <input
                      type="text"
                      value={formData.requestedValue}
                      onChange={(e) => setFormData({ ...formData, requestedValue: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Change *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Submitting...' : 'Submit Edit Request'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Edit Requests List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Edit Requests</h2>
          
          {editRequests.length === 0 ? (
            <div className="text-gray-600">No edit requests found</div>
          ) : (
            <div className="space-y-4">
              {editRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{request.questionText}</div>
                      <div className="text-sm text-gray-600">
                        {request.currentValue} → {request.requestedValue}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{request.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditRequests;
