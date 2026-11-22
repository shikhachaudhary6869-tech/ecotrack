import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { KEYS, load, save } from '../utils/storage';
import { calculateEcoScore, getLevel } from '../utils/calculations';
import { CHALLENGES, BADGES } from '../data/challenges';

const EcoContext = createContext(null);

const EMPTY_CHALLENGES = { progress: {}, history: [] }; // progress: {id: count}, history: [{id, title, points, date}]
const EMPTY_TIPS = { done: [], favs: [] };

export function EcoProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id;

  const [records, setRecords] = useState([]);
  const [challengeState, setChallengeState] = useState(EMPTY_CHALLENGES);
  const [tipState, setTipState] = useState(EMPTY_TIPS);
  const [toasts, setToasts] = useState([]);

  // Load data whenever the logged-in user changes
  useEffect(() => {
    if (!uid) {
      setRecords([]);
      setChallengeState(EMPTY_CHALLENGES);
      setTipState(EMPTY_TIPS);
      return;
    }
    setRecords(load(KEYS.records(uid), []));
    setChallengeState(load(KEYS.challenges(uid), EMPTY_CHALLENGES));
    setTipState(load(KEYS.tips(uid), EMPTY_TIPS));
  }, [uid]);

  // ---------- Toasts ----------
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ---------- Records (CRUD) ----------
  const persistRecords = (next) => {
    setRecords(next);
    if (uid) save(KEYS.records(uid), next);
  };

  const addRecord = (record) => {
    const rec = { ...record, id: 'r' + Date.now() + Math.floor(Math.random() * 1000) };
    persistRecords([rec, ...records]);
    return rec;
  };
  const addRecords = (list) => {
    const stamped = list.map((r, i) => ({ ...r, id: 'r' + Date.now() + i + Math.floor(Math.random() * 1000) }));
    persistRecords([...stamped, ...records]);
  };
  const updateRecord = (id, changes) => persistRecords(records.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  const deleteRecord = (id) => persistRecords(records.filter((r) => r.id !== id));
  const clearRecords = () => persistRecords([]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)),
    [records]
  );

  // ---------- Challenges ----------
  const persistChallenges = (next) => {
    setChallengeState(next);
    if (uid) save(KEYS.challenges(uid), next);
  };

  const logChallengeProgress = (challenge) => {
    const current = challengeState.progress[challenge.id] || 0;
    if (current >= challenge.target) return;
    const next = current + 1;
    const progress = { ...challengeState.progress, [challenge.id]: next };
    if (next >= challenge.target) {
      const history = [
        { id: challenge.id, title: challenge.title, points: challenge.points, date: new Date().toISOString() },
        ...challengeState.history,
      ];
      persistChallenges({ progress, history });
      toast(`Challenge complete! +${challenge.points} points`);
    } else {
      persistChallenges({ ...challengeState, progress });
      toast(`Progress saved (${next}/${challenge.target})`);
    }
  };

  const restartChallenge = (challenge) => {
    const progress = { ...challengeState.progress };
    delete progress[challenge.id];
    persistChallenges({ ...challengeState, progress });
    toast('Challenge restarted', 'info');
  };

  const isChallengeDone = (id) => challengeState.history.some((h) => h.id === id) &&
    (challengeState.progress[id] || 0) >= (CHALLENGES.find((c) => c.id === id)?.target || 1);

  const resetChallengeForReplay = restartChallenge;

  const rewardPoints = challengeState.history.reduce((s, h) => s + h.points, 0);

  // ---------- Tips ----------
  const persistTips = (next) => {
    setTipState(next);
    if (uid) save(KEYS.tips(uid), next);
  };
  const toggleTipDone = (id) => {
    const done = tipState.done.includes(id) ? tipState.done.filter((x) => x !== id) : [...tipState.done, id];
    persistTips({ ...tipState, done });
  };
  const toggleTipFav = (id) => {
    const favs = tipState.favs.includes(id) ? tipState.favs.filter((x) => x !== id) : [...tipState.favs, id];
    persistTips({ ...tipState, favs });
  };

  // ---------- Derived: EcoScore, level, badges ----------
  const ecoScore = useMemo(
    () => calculateEcoScore({ records, rewardPoints, completedTips: tipState.done.length }),
    [records, rewardPoints, tipState.done]
  );
  const level = getLevel(ecoScore.score);

  const badges = useMemo(() => {
    const stats = {
      completedCount: challengeState.history.length,
      points: rewardPoints,
      recordCount: records.length,
      tipsDone: tipState.done.length,
    };
    return BADGES.map((b) => ({ ...b, earned: b.check(stats) }));
  }, [challengeState.history, rewardPoints, records.length, tipState.done]);

  const value = {
    records,
    sortedRecords,
    addRecord,
    addRecords,
    updateRecord,
    deleteRecord,
    clearRecords,
    challengeState,
    logChallengeProgress,
    restartChallenge,
    resetChallengeForReplay,
    isChallengeDone,
    rewardPoints,
    tipState,
    toggleTipDone,
    toggleTipFav,
    ecoScore,
    level,
    badges,
    toasts,
    toast,
    dismissToast,
  };

  return <EcoContext.Provider value={value}>{children}</EcoContext.Provider>;
}

export const useEco = () => useContext(EcoContext);
