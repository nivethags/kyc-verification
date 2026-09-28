import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              KYC Verification System
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="px-3 py-2 rounded hover:bg-blue-700 transition">
              Dashboard
            </Link>
            <Link to="/questionnaire" className="px-3 py-2 rounded hover:bg-blue-700 transition">
              Questionnaire
            </Link>
            <Link to="/verification" className="px-3 py-2 rounded hover:bg-blue-700 transition">
              Verification Queue
            </Link>
            <Link to="/edit-requests" className="px-3 py-2 rounded hover:bg-blue-700 transition">
              Edit Requests
            </Link>
            <Link to="/vos" className="px-3 py-2 rounded hover:bg-blue-700 transition">
              V.O.S Approval
            </Link>
            <Link to="/amendments" className="px-3 py-2 rounded hover:bg-blue-700 transition">
              Amendments
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
