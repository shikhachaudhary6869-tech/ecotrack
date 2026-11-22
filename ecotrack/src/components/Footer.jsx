import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">
              <span className="logo-mark"><Leaf size={20} /></span>
              EcoTrack
            </div>
            <p>Track, understand and reduce your personal carbon footprint. A frontend-only college project built with React.</p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><Link to="/signup">Get Started</Link></li>
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/calculator">Calculator</Link></li>
              <li><Link to="/simulator">What-If Simulator</Link></li>
              <li><Link to="/challenges">Challenges</Link></li>
            </ul>
          </div>
          <div>
            <h4>Learn</h4>
            <ul>
              <li><Link to="/tips">Eco Tips</Link></li>
              <li><Link to="/reports">Reports</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EcoTrack. Built for a Full Stack Development course project.</span>
          <span>Emission factors are illustrative estimates, not certified data.</span>
        </div>
      </div>
    </footer>
  );
}
