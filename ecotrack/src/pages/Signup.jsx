import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (form.name.trim().length < 2) err.name = 'Name must be at least 2 characters.';
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address.';
    if (form.password.length < 6) err.password = 'Password must be at least 6 characters.';
    else if (!/\d/.test(form.password)) err.password = 'Password must include at least one number.';
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
      const res = signup(form);
      setBusy(false);
      if (!res.ok) return setServerError(res.error);
      navigate('/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <Link to="/" className="logo"><span className="logo-mark"><Leaf size={20} /></span> EcoTrack</Link>
        <div>
          <h2>Start your sustainability journey today.</h2>
          <p>Create a demo account to calculate your footprint, join challenges and watch your EcoScore grow.</p>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#bbf7d0' }}>Demo project · data is stored only in your browser</span>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>Create your account</h1>
          <p className="sub">It takes less than a minute.</p>
          {serverError && <div className="form-error">{serverError}</div>}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" className={`input ${errors.name ? 'invalid' : ''}`} value={form.name} onChange={change} placeholder="Your name" autoComplete="name" />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={`input ${errors.email ? 'invalid' : ''}`} value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input id="password" name="password" type={show ? 'text' : 'password'} className={`input ${errors.password ? 'invalid' : ''}`} value={form.password} onChange={change} placeholder="At least 6 characters, with a number" autoComplete="new-password" />
              <button type="button" className="toggle" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>{busy ? 'Creating account…' : 'Sign up'}</button>
          <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
          <p className="hint" style={{ textAlign: 'center', marginTop: 14 }}>Frontend-only demo. Passwords are kept in localStorage and are not secure.</p>
        </form>
      </div>
    </div>
  );
}
