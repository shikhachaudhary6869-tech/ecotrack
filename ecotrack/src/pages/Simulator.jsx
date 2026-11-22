import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList } from 'recharts';
import { Car, Bike, Zap, Salad, Recycle, Info } from 'lucide-react';
import ChartCard from '../components/ChartCard';
import { EMISSION_FACTORS, FACTORS_DISCLAIMER } from '../utils/emissionFactors';
import { round } from '../utils/calculations';

const F = EMISSION_FACTORS;

// Each scenario describes its sliders and how to compute "current" and "alternative" emissions PER DAY (kg CO₂e).
const SCENARIOS = [
  {
    id: 'carBus', title: 'Car vs Bus', desc: 'Swap a daily car commute for the bus', icon: Car,
    currentLabel: 'By car', altLabel: 'By bus',
    sliders: [{ key: 'km', label: 'Distance travelled per day', unit: 'km', min: 1, max: 100, def: 20 }],
    compute: (v) => ({ current: v.km * F.transport.car.factor, alt: v.km * F.transport.bus.factor }),
  },
  {
    id: 'carCycle', title: 'Car vs Bicycle', desc: 'Cycle instead of driving short trips', icon: Bike,
    currentLabel: 'By car', altLabel: 'By bicycle',
    sliders: [{ key: 'km', label: 'Distance travelled per day', unit: 'km', min: 1, max: 30, def: 5 }],
    compute: (v) => ({ current: v.km * F.transport.car.factor, alt: v.km * F.transport.walkCycle.factor }),
  },
  {
    id: 'appliances', title: 'Efficient appliances', desc: 'Use less electricity for the same comfort', icon: Zap,
    currentLabel: 'Current usage', altLabel: 'Efficient usage',
    sliders: [
      { key: 'kwh', label: 'Electricity used per day', unit: 'kWh', min: 1, max: 50, def: 10 },
      { key: 'saving', label: 'Energy saved by efficient appliances', unit: '%', min: 5, max: 60, def: 30 },
    ],
    compute: (v) => ({ current: v.kwh * F.electricity.grid.factor, alt: v.kwh * (1 - v.saving / 100) * F.electricity.grid.factor }),
  },
  {
    id: 'meat', title: 'Reduce meat', desc: 'Replace some non-veg meals with vegetarian ones', icon: Salad,
    currentLabel: 'Current diet', altLabel: 'Reduced meat',
    sliders: [
      { key: 'now', label: 'Non-veg meals per week now', unit: 'meals', min: 0, max: 21, def: 10 },
      { key: 'after', label: 'Non-veg meals per week after', unit: 'meals', min: 0, max: 21, def: 3 },
    ],
    compute: (v) => {
      const after = Math.min(v.after, v.now); // can't have more than now in a "reduction"
      const swapped = v.now - after;
      return {
        current: (v.now * F.food.nonVegMeal.factor) / 7,
        alt: (after * F.food.nonVegMeal.factor + swapped * F.food.vegMeal.factor) / 7,
      };
    },
  },
  {
    id: 'recycle', title: 'Recycling vs not', desc: 'Recycle part of your waste instead of landfill', icon: Recycle,
    currentLabel: 'No recycling', altLabel: 'With recycling',
    sliders: [
      { key: 'kg', label: 'Waste produced per day', unit: 'kg', min: 0.2, max: 5, step: 0.1, def: 1 },
      { key: 'share', label: 'Share you would recycle', unit: '%', min: 0, max: 100, def: 60 },
    ],
    compute: (v) => ({
      current: v.kg * F.waste.general.factor,
      alt: v.kg * (1 - v.share / 100) * F.waste.general.factor + v.kg * (v.share / 100) * F.waste.recycled.factor,
    }),
  },
];

const PERIODS = { day: { label: 'Per day', mult: 1 }, month: { label: 'Per month', mult: 30 }, year: { label: 'Per year', mult: 365 } };

export default function Simulator() {
  const [sid, setSid] = useState('carBus');
  const [period, setPeriod] = useState('month');
  const [values, setValues] = useState(() => {
    const out = {};
    SCENARIOS.forEach((s) => { out[s.id] = {}; s.sliders.forEach((sl) => (out[s.id][sl.key] = sl.def)); });
    return out;
  });

  const scenario = SCENARIOS.find((s) => s.id === sid);
  const v = values[sid];
  const mult = PERIODS[period].mult;

  const { current, alt, saved, pct } = useMemo(() => {
    const r = scenario.compute(v);
    const cur = round(r.current * mult);
    const al = round(r.alt * mult);
    const sv = round(cur - al);
    return { current: cur, alt: al, saved: sv, pct: cur > 0 ? round((sv / cur) * 100, 0) : 0 };
  }, [scenario, v, mult]);

  const setSlider = (key, value) => setValues((prev) => ({ ...prev, [sid]: { ...prev[sid], [key]: Number(value) } }));

  const chartData = [
    { name: scenario.currentLabel, value: current, color: '#94a3a0' },
    { name: scenario.altLabel, value: alt, color: '#10B981' },
    { name: 'Saved', value: Math.max(saved, 0), color: '#166534' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>What-If Simulator</h1>
          <p>Compare lifestyle choices and see the potential emissions saved.</p>
        </div>
        <div className="seg">
          {Object.entries(PERIODS).map(([k, p]) => (
            <button key={k} className={period === k ? 'on' : ''} onClick={() => setPeriod(k)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="scenario-grid">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} className={`scenario ${sid === s.id ? 'on' : ''}`} onClick={() => setSid(s.id)}>
              <Icon size={20} color="#166534" />
              <b>{s.title}</b>
              <span>{s.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-2 mb" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-title">{scenario.title}</div>
          <div className="card-sub">Adjust the sliders to match your routine</div>
          {scenario.sliders.map((sl) => (
            <div className="field" key={sl.key}>
              <label htmlFor={sl.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{sl.label}</span>
                <span style={{ color: 'var(--primary)' }}>{v[sl.key]} {sl.unit}</span>
              </label>
              <input id={sl.key} className="range" type="range" min={sl.min} max={sl.max} step={sl.step || 1} value={v[sl.key]} onChange={(e) => setSlider(sl.key, e.target.value)} />
            </div>
          ))}
          {scenario.id === 'meat' && v.after > v.now && (
            <p className="hint">“After” is capped at your current number of meals.</p>
          )}

          <div className="compare" style={{ marginTop: 20 }}>
            <div className="box">
              <div className="l">{scenario.currentLabel}</div>
              <div className="v">{current}</div>
              <div className="l">kg CO₂e {PERIODS[period].label.toLowerCase()}</div>
            </div>
            <span style={{ color: 'var(--muted)', fontWeight: 700 }}>→</span>
            <div className="box alt">
              <div className="l">{scenario.altLabel}</div>
              <div className="v">{alt}</div>
              <div className="l">kg CO₂e {PERIODS[period].label.toLowerCase()}</div>
            </div>
          </div>

          <div className={`saved-banner ${saved < 0 ? 'neg' : ''}`}>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Potential emissions saved</div>
            <div className="v">{saved} kg CO₂e</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{pct}% lower {PERIODS[period].label.toLowerCase()}</div>
          </div>
        </div>

        <ChartCard title="Comparison" subtitle={`Estimated kg CO₂e ${PERIODS[period].label.toLowerCase()}`}>
          <div className="chart-box" style={{ height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 24, left: -6, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5b6b61' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5b6b61' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f0f7ee' }} formatter={(val) => [`${val} kg CO₂e`, 'Estimated']} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                  {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 700, fill: '#0f1f14' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="disclaimer"><Info size={18} style={{ flexShrink: 0 }} /> <span>{FACTORS_DISCLAIMER} Results are rough what-if estimates, not predictions.</span></div>
    </>
  );
}
