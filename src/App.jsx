import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RegistrationProvider } from './contexts/RegistrationContext';
import WelcomePage from './pages/WelcomePage';
import FormPage from './pages/FormPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import LoginPage from './pages/LoginPage';
import RegenerateOTPPage from './pages/RegenerateOTPPage';
import DashboardHome from './pages/DashboardHome'
import MainLayout from './components/layout/MainLayout'; // persistent sidebar layout
import AdminDashboard from './pages/DashboardAdmin'
import UserDashboard from './pages/DashboardUser'
import GroupManagerDashboard from './pages/DashboardGM'
import MemberDashboard from './pages/DashboardMember';
import TestAdminApi from './components/admin/TestAdminApi';

function App() {
  console.log("App loaded");
  return (
    <RegistrationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/register" element={<FormPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/generate-otp" element={<RegenerateOTPPage />} />
          <Route path="/test-api" element={<TestAdminApi />} />

          {/* Dashboard routes with sidebar layout */}
          <Route path="/dashboard-page" element={<MainLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="user" element={<UserDashboard />} />
            <Route path="group-manager" element={<GroupManagerDashboard />} />
            <Route path="member" element={<MemberDashboard />} />
          </Route>
        </Routes>
      </Router>
    </RegistrationProvider>
  );


}

export default App;