import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import QuestionnairePage from './pages/QuestionnairePage';
import VerificationQueue from './pages/VerificationQueue';
import EditRequests from './pages/EditRequests';
import VOSApproval from './pages/VOSApproval';
import Amendments from './pages/Amendments';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/verification" element={<VerificationQueue />} />
          <Route path="/edit-requests" element={<EditRequests />} />
          <Route path="/vos" element={<VOSApproval />} />
          <Route path="/amendments" element={<Amendments />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
