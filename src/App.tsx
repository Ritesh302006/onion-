import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import NewAssessment from './pages/officer/NewAssessment';
import AdminDashboard from './pages/admin/AdminDashboard';
import RulesEngine from './pages/admin/RulesEngine';
import ModelsManagement from './pages/admin/ModelsManagement';
import ReportView from './pages/ReportView';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Public/Farmer view via QR */}
        <Route path="/report/:id" element={<ReportView />} />
        
        <Route element={<Layout />}>
          {/* Officer Routes */}
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/officer/new-lot" element={<NewAssessment />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/rules" element={<RulesEngine />} />
          <Route path="/admin/models" element={<ModelsManagement />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer" element={<FarmerDashboard />} />
          
          {/* Reviewer Routes */}
          <Route path="/reviewer" element={<ReviewerDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
