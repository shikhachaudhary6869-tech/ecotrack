import { NavLink, Link } from 'react-router-dom';
import { Leaf, LayoutDashboard, Calculator, Trophy, Sparkles, FlaskConical, BarChart3, Lightbulb, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/challenges', label: 'Challenges', icon: Trophy },
  { to: '/ecoscore', label: 'EcoScore', icon: Sparkles },
  { to: '/simulator', label: 'What-If Simulator', icon: FlaskConical },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/tips', label: 'Eco Tips', icon: Lightbulb },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ open, onClose, onLogout }) {
  const { user } = useAuth();
  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Link to="/" className="logo">
          <span className="logo-mark"><Leaf size={20} /></span>
          EcoTrack
        </Link>
        <nav className="side-nav">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-footer">
          <div className="side-user">
            <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="name">{user?.name}</div>
              <div className="mail">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={onLogout}>
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
