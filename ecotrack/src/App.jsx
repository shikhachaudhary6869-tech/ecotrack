import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Challenges from './pages/Challenges';
import EcoScore from './pages/EcoScore';
import Simulator from './pages/Simulator';
import Reports from './pages/Reports';
import EcoTips from './pages/EcoTips';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Private pages (AppLayout redirects to /login if not logged in) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/ecoscore" element={<EcoScore />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tips" element={<EcoTips />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
