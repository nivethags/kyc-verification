import { useState, useEffect } from 'react';
import { getEditRequests, approveEditRequest, rejectEditRequest } from '../services/api';

const VOSApproval = () => {
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    loadEditRequests();
  }, []);

  const loadEditRequests = async () => {
    try {
      const res = await getEditRequests({ status: 'PENDING' });
      setEditRequests(res.data);
    } catch (error) {
      console.error('Error loading edit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEditRequest(id, { approvedBy: 'vos_admin' });
      loadEditRequests();
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await rejectEditRequest(id, {
        rejectedBy: 'vos_admin',
        rejectionReason
      });
      setRejectionReason('');
      setRejectingId(null);
      loadEditRequests();
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading edit requests...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">V.O.S Approval Queue</h1>
      
      {editRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          No pending edit requests
        </div>
      ) : (
        <div className="space-y-4">
          {editRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Party</div>
                  <div className="font-medium">{request.partyName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Field</div>
                  <div className="font-medium">{request.questionText}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Current Value</div>
                  <div className="font-medium">{request.currentValue}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Requested Value</div>
                  <div className="font-medium text-blue-600">{request.requestedValue}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600">Reason</div>
                  <div className="font-medium">{request.reason}</div>
                </div>
                {request.attachment && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600">Attachment</div>
                    <div className="font-medium">{request.attachment}</div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectingId(request.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Edit Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VOSApproval;
