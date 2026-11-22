import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address.';
    if (!form.password) err.password = 'Password is required.';
    return err;
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    setServerError('');
    if (Object.keys(err).length) return;
    setBusy(true);
    setTimeout(() => {
      const res = login(form);
      setBusy(false);
      if (!res.ok) return setServerError(res.error);
      navigate(location.state?.from || '/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <Link to="/" className="logo"><span className="logo-mark"><Leaf size={20} /></span> EcoTrack</Link>
        <div>
          <h2>Small habits. Big planet-sized impact.</h2>
          <p>Log in to continue tracking your carbon footprint and completing eco challenges.</p>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#bbf7d0' }}>Demo project · data is stored only in your browser</span>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>Welcome back</h1>
          <p className="sub">Log in to your EcoTrack account.</p>
          {serverError && <div className="form-error">{serverError}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={`input ${errors.email ? 'invalid' : ''}`} value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input id="password" name="password" type={show ? 'text' : 'password'} className={`input ${errors.password ? 'invalid' : ''}`} value={form.password} onChange={change} placeholder="Your password" autoComplete="current-password" />
              <button type="button" className="toggle" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
          <p className="switch">New to EcoTrack? <Link to="/signup">Create an account</Link></p>
          <p className="hint" style={{ textAlign: 'center', marginTop: 14 }}>Frontend-only demo login. Not secure for real use.</p>
        </form>
      </div>
    </div>
  );
}
