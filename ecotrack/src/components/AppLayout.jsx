import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Toaster from './Toaster';
import { useAuth } from '../context/AuthContext';
import { useEco } from '../context/EcoContext';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/calculator': 'Carbon Calculator',
  '/challenges': 'Eco Challenges',
  '/ecoscore': 'EcoScore',
  '/simulator': 'What-If Simulator',
  '/reports': 'Reports & Analytics',
  '/tips': 'Eco Tips',
  '/profile': 'Profile',
};

// Wraps every private page. Redirects to /login when there is no session.
export default function AppLayout() {
  const { user, logout } = useAuth();
  const { ecoScore, toast } = useEco();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // short loading state on first page load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const handleLogout = () => {
    logout();
    toast('You have been logged out', 'info');
    navigate('/');
  };

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} onLogout={handleLogout} />
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn hamburger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
            <h2>{TITLES[location.pathname] || 'EcoTrack'}</h2>
          </div>
          <div className="topbar-right">
            <div className="score-pill" title="Your current EcoScore">
              <Sparkles size={15} /> {ecoScore.score}<span className="txt">/100 EcoScore</span>
            </div>
            <div className="avatar" title={user.name}>{user.name?.[0]?.toUpperCase()}</div>
          </div>
        </header>
        <main className="content">
          {loading ? <div className="page-loader"><div className="spinner" /></div> : <Outlet />}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
