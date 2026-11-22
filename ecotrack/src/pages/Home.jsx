import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Trophy, FlaskConical, BarChart3, Lightbulb, Sparkles, Leaf, PlayCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Calculator, title: 'Carbon Calculator', text: 'Estimate emissions from transport, electricity, food and waste with configurable factors.' },
  { icon: Sparkles, title: 'EcoScore', text: 'A transparent score out of 100 with levels from Beginner to Planet Protector.' },
  { icon: Trophy, title: 'Eco Challenges', text: 'Daily and weekly challenges with reward points and achievement badges.' },
  { icon: FlaskConical, title: 'What-If Simulator', text: 'Compare lifestyle choices side by side and see the estimated emissions saved.' },
  { icon: BarChart3, title: 'Reports & Analytics', text: 'Daily, weekly and monthly trends. Download your data as CSV or a printable PDF.' },
  { icon: Lightbulb, title: 'Personalised Tips', text: 'Practical tips based on your biggest emission category. Save favourites and mark them done.' },
];

const STEPS = [
  { title: 'Create an account', text: 'Sign up in seconds. Your data stays in your own browser.' },
  { title: 'Log your activities', text: 'Enter travel, energy, food and waste for the day.' },
  { title: 'Understand your impact', text: 'See charts, category breakdowns and your EcoScore.' },
  { title: 'Take action', text: 'Join challenges, try the simulator and follow eco tips.' },
];

const STATS = [
  { big: '~4.7 t', lbl: 'approx. average yearly CO₂ per person worldwide' },
  { big: '~1.9 t', lbl: 'approx. average yearly CO₂ per person in India' },
  { big: '~2 t', lbl: 'commonly cited per-person level for climate goals' },
  { big: '~30%', lbl: 'of global emissions linked to food systems (approx.)' },
];

export default function Home() {
  const { user } = useAuth();
  const cta = user ? '/dashboard' : '/signup';
  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-tag"><Leaf size={14} /> Smart Personal Carbon Footprint Tracker</span>
            <h1>Track Your Impact. <span>Protect Our Planet.</span></h1>
            <p className="lead">
              EcoTrack helps you calculate, monitor and reduce your carbon footprint from daily transport, electricity, food and waste with clear charts, challenges and tips.
            </p>
            <div className="hero-cta">
              <Link to={cta} className="btn btn-primary btn-lg">Get Started <ArrowRight size={18} /></Link>
              <a href="#how" className="btn btn-outline btn-lg" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <PlayCircle size={18} /> See how it works
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="row">
              <div>
                <div className="hint">This week (sample)</div>
                <div className="hero-metric">62.4 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 600 }}>kg CO₂e</span></div>
              </div>
              <span className="badge">-12% vs last week</span>
            </div>
            <div className="mini-bars">
              {[55, 70, 48, 82, 40, 35, 60].map((h, i) => (
                <span key={i} className={i === 5 ? 'hi' : ''} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="progress"><span style={{ width: '72%' }} /></div>
            <div className="hint" style={{ marginTop: 8 }}>Sample EcoScore: 72/100 · Green Champion</div>
          </div>
        </div>
      </section>

      <section className="section alt" id="features">
        <div className="container">
          <div className="section-head">
            <h2>Everything you need to go greener</h2>
            <p>Simple tools that turn everyday choices into measurable progress.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card feature">
                <div className="ico"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
            <p>Four simple steps from first log to lasting habits.</p>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step">
                <div className="num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="impact">
        <div className="container">
          <div className="section-head">
            <h2>Why it matters</h2>
            <p>Individual choices add up. Here are some rounded, widely cited figures for context.</p>
          </div>
          <div className="stats-band">
            {STATS.map((s) => (
              <div key={s.big}>
                <div className="big">{s.big}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
          <p className="stats-note">Figures are approximate and rounded for awareness only. Check official sources (e.g. IEA, Global Carbon Project) for exact values.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to measure your footprint?</h2>
            <p>Create a free demo account and start tracking in under a minute.</p>
            <Link to={cta} className="btn btn-primary btn-lg">Get Started <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
