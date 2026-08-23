import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import RegulatoryDashboard from './pages/RegulatoryDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Public) */}
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Contractor Route */}
        <Route
          path="/contractor"
          element={
            <ProtectedRoute>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Regulatory Route */}
        <Route
          path="/regulatory-dashboard"
          element={
            <ProtectedRoute>
              <RegulatoryDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;