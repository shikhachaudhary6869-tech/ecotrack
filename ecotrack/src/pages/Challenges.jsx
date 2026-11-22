import { useState } from 'react';
import { Trophy, Star, CheckCircle2, History, Sprout, Leaf, Shield, ClipboardCheck, Lightbulb } from 'lucide-react';
import ChallengeCard from '../components/ChallengeCard';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { useEco } from '../context/EcoContext';
import { CHALLENGES } from '../data/challenges';
import { formatDate, toISO } from '../utils/calculations';

const BADGE_ICONS = { Sprout, Leaf, Star, Shield, ClipboardCheck, Lightbulb };

export default function Challenges() {
  const { challengeState, logChallengeProgress, restartChallenge, isChallengeDone, rewardPoints, badges } = useEco();
  const [filter, setFilter] = useState('all');

  const list = CHALLENGES.filter((c) => filter === 'all' || c.type === filter);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Eco Challenges</h1>
          <p>Complete challenges to earn points and unlock badges.</p>
        </div>
        <div className="seg">
          {[['all', 'All'], ['daily', 'Daily'], ['weekly', 'Weekly']].map(([v, l]) => (
            <button key={v} className={filter === v ? 'on' : ''} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-3 mb">
        <StatCard label="Reward Points" value={rewardPoints} icon={Star} footer="Earned from completed challenges" />
        <StatCard label="Challenges Completed" value={challengeState.history.length} icon={CheckCircle2} footer={`${CHALLENGES.length} available`} />
        <StatCard label="Badges Earned" value={`${earned}/${badges.length}`} icon={Trophy} footer="Unlock more by staying active" />
      </div>

      <div className="grid grid-3 mb">
        {list.map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            progress={challengeState.progress[c.id] || 0}
            done={isChallengeDone(c.id)}
            onLog={logChallengeProgress}
            onRestart={restartChallenge}
          />
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Achievement Badges</div>
          <div className="card-sub">{earned} of {badges.length} unlocked</div>
          <div className="badge-grid">
            {badges.map((b) => {
              const Icon = BADGE_ICONS[b.icon] || Star;
              return (
                <div key={b.id} className={`achievement ${b.earned ? '' : 'locked'}`} title={b.description}>
                  <div className="b-ico"><Icon size={22} /></div>
                  <b>{b.name}</b>
                  <span>{b.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Completed History</div>
          <div className="card-sub">Your finished challenges</div>
          {challengeState.history.length === 0 ? (
            <EmptyState icon={History} title="Nothing completed yet" text="Finish a challenge and it will appear here." />
          ) : (
            <div className="activity-list">
              {challengeState.history.map((h, i) => (
                <div className="activity" key={h.id + i}>
                  <div className="a-icon"><CheckCircle2 size={19} /></div>
                  <div className="a-main">
                    <div className="a-title">{h.title}</div>
                    <div className="a-meta">{formatDate(toISO(h.date))}</div>
                  </div>
                  <span className="badge">+{h.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
