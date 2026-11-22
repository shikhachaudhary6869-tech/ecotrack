import { Bus, Recycle, Footprints, Zap, TreePine, Trash2, Salad, GlassWater, CheckCircle2, RotateCcw } from 'lucide-react';

const ICONS = { Bus, Recycle, Footprints, Zap, TreePine, Trash2, Salad, GlassWater };

export default function ChallengeCard({ challenge, progress, done, onLog, onRestart }) {
  const Icon = ICONS[challenge.icon] || Recycle;
  const pct = Math.min(100, Math.round((progress / challenge.target) * 100));

  return (
    <div className={`card challenge ${done ? 'done' : ''}`}>
      <div className="challenge-top">
        <div className="c-icon">{done ? <CheckCircle2 size={22} /> : <Icon size={22} />}</div>
        <div style={{ flex: 1 }}>
          <h4>{challenge.title}</h4>
          <p>{challenge.description}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="badge">{challenge.type === 'daily' ? 'Daily' : 'Weekly'}</span>
        <span className="badge gray">+{challenge.points} pts</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>
          <span>Progress</span>
          <span>{progress}/{challenge.target}</span>
        </div>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="challenge-foot">
        {done ? (
          <>
            <span className="badge">Completed</span>
            <button className="btn btn-outline btn-sm" onClick={() => onRestart(challenge)}><RotateCcw size={14} /> Do it again</button>
          </>
        ) : (
          <>
            <span className="hint">{challenge.target > 1 ? 'Log one day at a time' : 'Mark it when done'}</span>
            <button className="btn btn-primary btn-sm" onClick={() => onLog(challenge)}>
              {challenge.target > 1 ? 'Log today' : 'Mark complete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
