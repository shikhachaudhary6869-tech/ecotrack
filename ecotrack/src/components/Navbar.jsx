import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Public navigation bar used on the landing, login and signup pages.
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id) => {
    setOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-mark"><Leaf size={20} /></span>
          EcoTrack
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <a className="link" href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a>
          <a className="link" href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how'); }}>How it works</a>
          <a className="link" href="#impact" onClick={(e) => { e.preventDefault(); scrollTo('impact'); }}>Impact</a>
          <div className="nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary" onClick={() => setOpen(false)}>Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </nav>

        <button className="icon-btn menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  );
}
