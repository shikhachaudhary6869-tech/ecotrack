import { Link } from 'react-router-dom';
import { Info, ArrowRight } from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { LEVELS } from '../utils/calculations';
import { DAILY_TARGET_KG } from '../utils/emissionFactors';

export default function EcoScore() {
  const { ecoScore, level, rewardPoints, tipState, records } = useEco();
  const { score, emissionsPoints, challengePoints, tipPoints, avgDaily } = ecoScore;

  const R = 72;
  const C = 2 * Math.PI * R;
  const offset = C - (score / 100) * C;

  // Personalised suggestions based on which part of the score has the most room to grow
  const suggestions = [];
  if (records.length === 0) suggestions.push({ text: 'Save your first calculation so EcoScore can use your real activity.', to: '/calculator', cta: 'Open calculator' });
  if (emissionsPoints < 45 && records.length > 0) suggestions.push({ text: `Your recent average is ${avgDaily} kg CO₂e/day. Try cutting car trips or non-veg meals to lower it.`, to: '/simulator', cta: 'Try the simulator' });
  if (challengePoints < 25) suggestions.push({ text: `Complete challenges to earn more points (${challengePoints}/25 score points so far).`, to: '/challenges', cta: 'See challenges' });
  if (tipPoints < 15) suggestions.push({ text: `Mark eco tips as done after you try them (${tipState.done.length}/5 tips counted).`, to: '/tips', cta: 'Browse tips' });
  if (suggestions.length === 0) suggestions.push({ text: 'Excellent! Keep logging and maintaining your habits.', to: '/dashboard', cta: 'Back to dashboard' });

  const rows = [
    { label: 'Low daily emissions', value: emissionsPoints, max: 60 },
    { label: 'Challenge points', value: challengePoints, max: 25 },
    { label: 'Eco tips completed', value: tipPoints, max: 15 },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>EcoScore</h1>
          <p>A simple score out of 100 based on your recorded activity and eco actions.</p>
        </div>
      </div>

      <div className="grid grid-2 mb">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="ring-wrap">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r={R} fill="none" stroke="#e8f3ea" strokeWidth="14" />
              <circle cx="85" cy="85" r={R} fill="none" stroke="#10B981" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="ring-center"><b>{score}</b><span>out of 100</span></div>
          </div>
          <h2 style={{ marginTop: 16 }}>{level.name}</h2>
          <p className="hint">{rewardPoints} reward points earned</p>
          <div className="level-track">
            {LEVELS.map((l) => (
              <div key={l.name} className={`level-step ${score >= l.min ? 'on' : ''} ${l.name === level.name ? 'cur' : ''}`}>
                <i />{l.name}
              </div>
            ))}
          </div>
          <div className="hint" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {LEVELS.map((l) => <span key={l.name}>{l.min}+</span>)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">How your score is calculated</div>
          <div className="card-sub">Score = emissions points (60) + challenge points (25) + tip points (15)</div>
          {rows.map((r) => (
            <div key={r.label} style={{ marginBottom: 14 }}>
              <div className="method-row" style={{ border: 'none', padding: '0 0 6px' }}>
                <span>{r.label}</span><b>{r.value} / {r.max}</b>
              </div>
              <div className="progress"><span style={{ width: `${(r.value / r.max) * 100}%` }} /></div>
            </div>
          ))}
          <div className="disclaimer" style={{ marginTop: 8 }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <b>Methodology.</b> Emissions points use your average daily CO₂e over the last 7 days that have records. At or below {DAILY_TARGET_KG * 0.5} kg/day gives 60 points; at or above {DAILY_TARGET_KG * 2} kg/day gives 0 (scaled in between; 20 if you have no data yet). Challenge points: 1 per 8 reward points (max 25). Tip points: 3 per completed tip (max 15). This is an educational score, not a scientific or official environmental rating.
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Suggestions to improve your score</div>
        <div className="card-sub">Based on where you can gain the most points</div>
        <div className="activity-list">
          {suggestions.map((s) => (
            <div key={s.text} className="activity">
              <div className="a-main"><div className="a-title" style={{ fontWeight: 500 }}>{s.text}</div></div>
              <Link to={s.to} className="btn btn-outline btn-sm">{s.cta} <ArrowRight size={14} /></Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
