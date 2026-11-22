import { EMISSION_FACTORS, CATEGORIES, DAILY_TARGET_KG } from './emissionFactors';

export const round = (n, d = 2) => Math.round((Number(n) + Number.EPSILON) * 10 ** d) / 10 ** d;

// ---------- Dates ----------
export const toISO = (d) => {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
};
export const todayISO = () => toISO(new Date());
export const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
};
export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------- Core calculation ----------
// inputs shape: { transport: {car: 10, ...}, electricity: {...}, food: {...}, waste: {...} }
export function calculateEmissions(inputs) {
  const breakdown = {};
  let total = 0;
  CATEGORIES.forEach(({ key }) => {
    let sum = 0;
    const factors = EMISSION_FACTORS[key];
    Object.keys(factors).forEach((field) => {
      const value = Math.max(0, Number(inputs?.[key]?.[field]) || 0);
      sum += value * factors[field].factor;
    });
    breakdown[key] = round(sum);
    total += sum;
  });
  return { breakdown, total: round(total) };
}

export const emptyInputs = () => {
  const out = {};
  Object.keys(EMISSION_FACTORS).forEach((cat) => {
    out[cat] = {};
    Object.keys(EMISSION_FACTORS[cat]).forEach((f) => (out[cat][f] = ''));
  });
  return out;
};

// ---------- Aggregation helpers over saved records ----------
export const inRange = (records, fromISO, toISOStr) =>
  records.filter((r) => r.date >= fromISO && r.date <= toISOStr);

export const sumTotal = (records) => round(records.reduce((s, r) => s + r.total, 0));

export function sumByCategory(records) {
  const out = { transport: 0, electricity: 0, food: 0, waste: 0 };
  records.forEach((r) => CATEGORIES.forEach(({ key }) => (out[key] += r.breakdown?.[key] || 0)));
  CATEGORIES.forEach(({ key }) => (out[key] = round(out[key])));
  return out;
}

export function dailySeries(records, days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = daysAgoISO(i);
    const dayRecs = records.filter((r) => r.date === iso);
    out.push({
      date: iso,
      label: new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weekday: new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' }),
      total: sumTotal(dayRecs),
      ...sumByCategory(dayRecs),
    });
  }
  return out;
}

export function monthlySeries(records, months = 6) {
  const out = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const recs = records.filter((r) => r.date.startsWith(prefix));
    out.push({
      key: prefix,
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      total: sumTotal(recs),
      ...sumByCategory(recs),
    });
  }
  return out;
}

// Percentage reduction: last 7 days vs previous 7 days. Positive = emissions went down.
export function reductionPercent(records) {
  const last = sumTotal(inRange(records, daysAgoISO(6), todayISO()));
  const prev = sumTotal(inRange(records, daysAgoISO(13), daysAgoISO(7)));
  if (prev <= 0) return null;
  return round(((prev - last) / prev) * 100, 1);
}

// ---------- EcoScore (transparent, simple formula) ----------
// Score = emissionsPoints (max 60) + challengePoints (max 25) + tipPoints (max 15)
//  - emissionsPoints: based on average daily emissions over the last 7 days that have records,
//    compared with DAILY_TARGET_KG. At or below half the target = 60, at or above double = 0.
//  - challengePoints: 1 point per 8 reward points earned, capped at 25.
//  - tipPoints: 3 points per completed tip, capped at 15.
export function calculateEcoScore({ records, rewardPoints = 0, completedTips = 0 }) {
  const recent = inRange(records, daysAgoISO(6), todayISO());
  const activeDays = new Set(recent.map((r) => r.date)).size;
  let emissionsPoints = 20; // neutral start when there is no data
  let avgDaily = null;
  if (activeDays > 0) {
    avgDaily = sumTotal(recent) / activeDays;
    const low = DAILY_TARGET_KG * 0.5;
    const high = DAILY_TARGET_KG * 2;
    const ratio = (high - Math.min(Math.max(avgDaily, low), high)) / (high - low);
    emissionsPoints = round(ratio * 60, 1);
  }
  const challengePoints = Math.min(25, Math.floor(rewardPoints / 8));
  const tipPoints = Math.min(15, completedTips * 3);
  const score = Math.max(0, Math.min(100, Math.round(emissionsPoints + challengePoints + tipPoints)));
  return { score, emissionsPoints, challengePoints, tipPoints, avgDaily: avgDaily === null ? null : round(avgDaily) };
}

export const LEVELS = [
  { name: 'Beginner', min: 0, max: 29 },
  { name: 'Eco Learner', min: 30, max: 54 },
  { name: 'Green Champion', min: 55, max: 79 },
  { name: 'Planet Protector', min: 80, max: 100 },
];

export const getLevel = (score) => LEVELS.find((l) => score >= l.min && score <= l.max) || LEVELS[0];
