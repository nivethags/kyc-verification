import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAmendments, getEditRequests, getVerificationQueue } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingAmendments: 0,
    pendingEditRequests: 0,
    pendingVerification: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [amendmentsRes, editRequestsRes, verificationRes] = await Promise.all([
        getAmendments({ status: 'PENDING' }),
        getEditRequests({ status: 'PENDING' }),
        getVerificationQueue()
      ]);

      setStats({
        pendingAmendments: amendmentsRes.data.length,
        pendingEditRequests: editRequestsRes.data.length,
        pendingVerification: verificationRes.data.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/amendments" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.pendingAmendments}</div>
          <div className="text-gray-600">Pending Amendments</div>
        </Link>
        
        <Link to="/edit-requests" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-green-600 mb-2">{stats.pendingEditRequests}</div>
          <div className="text-gray-600">Pending Edit Requests</div>
        </Link>
        
        <Link to="/verification" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-purple-600 mb-2">{stats.pendingVerification}</div>
          <div className="text-gray-600">Pending Verification</div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/questionnaire" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-center">
            Submit KYC
          </Link>
          <Link to="/verification" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition text-center">
            Review KYC
          </Link>
          <Link to="/edit-requests" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-center">
            Request Edit
          </Link>
          <Link to="/amendments" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition text-center">
            Review Amendments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
