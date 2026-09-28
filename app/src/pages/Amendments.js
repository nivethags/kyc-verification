import { useState, useEffect } from 'react';
import { getAmendments, getAmendment, makeAmendmentDecision } from '../services/api';

const Amendments = () => {
  const [amendments, setAmendments] = useState([]);
  const [selectedAmendment, setSelectedAmendment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionNote, setDecisionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [filters, setFilters] = useState({
    gate: '',
    listingImpact: '',
    status: ''
  });

  useEffect(() => {
    loadAmendments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadAmendments = async () => {
    setLoading(true);
    try {
      const res = await getAmendments(filters);
      setAmendments(res.data);
    } catch (error) {
      console.error('Error loading amendments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAmendment = async (id) => {
    try {
      const res = await getAmendment(id);
      setSelectedAmendment(res.data);
      setDecisionNote('');
      setMessage('');
    } catch (error) {
      console.error('Error loading amendment:', error);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedAmendment) return;

    setSubmitting(true);
    setMessage('');

    try {
      await makeAmendmentDecision(selectedAmendment.id, {
        decision,
        note: decisionNote,
        decidedBy: 'qc_admin'
      });

      setMessage(`Amendment ${decision === 'ACCEPT_REOPEN' ? 'accepted and gate reopened' : decision === 'ACCEPT_NO_REVERIFICATION' ? 'accepted without re-verification' : 'refused'} successfully!`);
      setSelectedAmendment(null);
      loadAmendments();
    } catch (error) {
      console.error('Error making decision:', error);
      if (error.response?.data?.error?.code === 'AMENDMENT_ALREADY_DECIDED') {
        setMessage('This amendment has already been decided by another user.');
      } else {
        setMessage('Error making decision. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED_REOPENED': return 'bg-green-100 text-green-800';
      case 'ACCEPTED_NO_REVERIFY': return 'bg-blue-100 text-blue-800';
      case 'REFUSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading amendments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Answer Amendments</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gate</label>
            <select
              value={filters.gate}
              onChange={(e) => setFilters({ ...filters, gate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Gates</option>
              <option value="REGISTRATION">Registration</option>
              <option value="LICENSING">Licensing</option>
              <option value="BANKING">Banking</option>
              <option value="BUSINESS">Business</option>
              <option value="LISTING">Listing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Listing Impact</label>
            <select
              value={filters.listingImpact}
              onChange={(e) => setFilters({ ...filters, listingImpact: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Impact</option>
              <option value="false">No Impact</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED_REOPENED">Accepted & Reopened</option>
              <option value="ACCEPTED_NO_REVERIFY">Accepted - No Reverification</option>
              <option value="REFUSED">Refused</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Amendment List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Amendment List</h2>
          </div>
          <div className="p-6">
            {amendments.length === 0 ? (
              <div className="text-gray-600 text-center py-8">No amendments found</div>
            ) : (
              <div className="space-y-3">
                {amendments.map((amendment) => (
                  <div
                    key={amendment.id}
                    onClick={() => handleSelectAmendment(amendment.id)}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                      selectedAmendment?.id === amendment.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{amendment.questionText}</div>
                        <div className="text-sm text-gray-600">{amendment.partyName}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(amendment.status)}`}>
                        {amendment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Gate:</span> {amendment.targetGate} (Gate {amendment.targetGateNumber})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amendment Detail Panel */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Amendment Details</h2>
          </div>
          <div className="p-6">
            {!selectedAmendment ? (
              <div className="text-gray-600 text-center py-8">Select an amendment to view details</div>
            ) : (
              <div className="space-y-6">
                {/* Party Info */}
                <div>
                  <div className="text-sm text-gray-600">Party</div>
                  <div className="font-medium">{selectedAmendment.partyName}</div>
                </div>

                {/* Question */}
                <div>
                  <div className="text-sm text-gray-600">Question</div>
                  <div className="font-medium">{selectedAmendment.questionText}</div>
                </div>

                {/* Before/After */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Before</div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                      {selectedAmendment.beforeValue}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">After</div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                      {selectedAmendment.afterValue}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <div className="text-sm text-gray-600">Reason</div>
                  <div className="font-medium">{selectedAmendment.reason}</div>
                </div>

                {/* Target Gate */}
                <div>
                  <div className="text-sm text-gray-600">Target Gate</div>
                  <div className="font-medium">
                    {selectedAmendment.targetGate} — Gate {selectedAmendment.targetGateNumber}
                  </div>
                </div>

                {/* Listing Impact */}
                <div>
                  <div className="text-sm text-gray-600">Listing Impact</div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedAmendment.listingImpact ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedAmendment.listingImpact ? 'YES' : 'NO'}
                  </span>
                </div>

                {/* Invalidated Items */}
                {selectedAmendment.invalidatedItems && selectedAmendment.invalidatedItems.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">What This Invalidates</div>
                    <div className="space-y-2">
                      {selectedAmendment.invalidatedItems.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <span className="text-red-500 mr-2">✓</span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision UI - Only for pending amendments */}
                {selectedAmendment.status === 'PENDING' ? (
                  <div className="border-t pt-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Decision Note
                      </label>
                      <textarea
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        placeholder="Add a note for this decision..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => handleDecision('ACCEPT_REOPEN')}
                        disabled={submitting}
                        className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition disabled:bg-gray-400"
                      >
                        Accept & Reopen {selectedAmendment.targetGate}
                      </button>
                      <button
                        onClick={() => handleDecision('ACCEPT_NO_REVERIFICATION')}
                        disabled={submitting}
                        className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
                      >
                        Accept — No Reverification Needed
                      </button>
                      <button
                        onClick={() => handleDecision('REFUSE')}
                        disabled={submitting}
                        className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition disabled:bg-gray-400"
                      >
                        Refuse Amendment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-6">
                    <div className="text-sm text-gray-600">Decision</div>
                    <div className="font-medium">{selectedAmendment.decision}</div>
                    {selectedAmendment.decisionNote && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">Decision Note</div>
                        <div className="text-sm">{selectedAmendment.decisionNote}</div>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-2">
                      Decided by: {selectedAmendment.decidedBy} at {new Date(selectedAmendment.decidedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amendments;
