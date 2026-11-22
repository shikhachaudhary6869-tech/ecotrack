import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { Cloud, CalendarDays, CalendarRange, Sparkles, TrendingDown, Plus, Database, ClipboardList } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ActivityCard from '../components/ActivityCard';
import EmptyState from '../components/EmptyState';
import { useEco } from '../context/EcoContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/emissionFactors';
import { ECO_TIPS } from '../data/ecoTips';
import {
  todayISO, daysAgoISO, inRange, sumTotal, sumByCategory, dailySeries, monthlySeries, reductionPercent, calculateEmissions, round,
} from '../utils/calculations';

const AXIS = { fontSize: 12, fill: '#5b6b61' };

// Builds 14 days of believable sample records so the dashboard can be demonstrated quickly.
function buildDemoRecords() {
  const list = [];
  for (let i = 13; i >= 0; i--) {
    const inputs = {
      transport: { car: 8 + ((i * 7) % 14), bus: 4 + (i % 5), train: i % 3 === 0 ? 10 : 0, walkCycle: 1 + (i % 3) },
      electricity: { grid: 5 + ((i * 3) % 6), household: 2 },
      food: { vegMeal: 2, nonVegMeal: i % 2 === 0 ? 1 : 0, dairy: 2 },
      waste: { general: 0.6, recycled: 0.4, plastic: i % 4 === 0 ? 0.2 : 0.05 },
    };
    const { breakdown, total } = calculateEmissions(inputs);
    list.push({ date: daysAgoISO(i), title: 'Sample day', inputs, breakdown, total });
  }
  return list;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { records, sortedRecords, addRecords, ecoScore, level, toast } = useEco();
  const [range, setRange] = useState('7');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const today = todayISO();
  const monthPrefix = today.slice(0, 7);

  // ----- Filtered records for the date filter -----
  const [start, end] = useMemo(() => {
    if (range === 'custom') return [from || '0000-01-01', to || '9999-12-31'];
    if (range === 'all') return ['0000-01-01', '9999-12-31'];
    return [daysAgoISO(Number(range) - 1), today];
  }, [range, from, to, today]);

  const filtered = useMemo(() => inRange(records, start, end), [records, start, end]);
  const filteredTotal = sumTotal(filtered);

  // ----- Stats -----
  const totalAll = sumTotal(records);
  const todayTotal = sumTotal(records.filter((r) => r.date === today));
  const monthTotal = sumTotal(records.filter((r) => r.date.startsWith(monthPrefix)));
  const reduction = reductionPercent(records);

  // ----- Chart data -----
  const weekly = useMemo(() => dailySeries(records, 7), [records]);
  const monthly = useMemo(() => monthlySeries(records, 6), [records]);
  const trendDays = range === 'custom' || range === 'all' ? 30 : Number(range);
  const trend = useMemo(() => dailySeries(records, Math.max(trendDays, 7)), [records, trendDays]);
  const byCat = sumByCategory(filtered);
  const pieData = CATEGORIES.map((c) => ({ name: c.label, value: byCat[c.key], color: c.color })).filter((d) => d.value > 0);

  // ----- Personalised tips: from the biggest category in the last 30 days -----
  const topCat = useMemo(() => {
    const cats = sumByCategory(inRange(records, daysAgoISO(29), today));
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    return sorted[0] && sorted[0][1] > 0 ? sorted[0][0] : null;
  }, [records, today]);
  const tips = useMemo(() => {
    const first = ECO_TIPS.filter((t) => t.category === topCat);
    const rest = ECO_TIPS.filter((t) => t.category !== topCat);
    return [...first, ...rest].slice(0, 3);
  }, [topCat]);

  const loadDemo = () => {
    addRecords(buildDemoRecords());
    toast('Added 14 days of sample data');
  };

  if (records.length === 0) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
            <p>Let’s start measuring your footprint.</p>
          </div>
        </div>
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title="No activity recorded yet"
            text="Calculate your first footprint, or load sample data to explore the dashboard."
            action={
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/calculator" className="btn btn-primary"><Plus size={16} /> Add first record</Link>
                <button className="btn btn-outline" onClick={loadDemo}><Database size={16} /> Load sample data</button>
              </div>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
          <p>Here is your carbon footprint overview.</p>
        </div>
        <Link to="/calculator" className="btn btn-primary"><Plus size={16} /> New record</Link>
      </div>

      <div className="grid grid-4 mb">
        <StatCard label="Total Carbon Footprint" value={totalAll} unit="kg CO₂e" icon={Cloud} footer={`${records.length} saved record${records.length === 1 ? '' : 's'}`} />
        <StatCard label="Today" value={todayTotal} unit="kg CO₂e" icon={CalendarDays} footer={todayTotal === 0 ? 'Nothing logged today' : 'Daily emissions'} />
        <StatCard label="This Month" value={monthTotal} unit="kg CO₂e" icon={CalendarRange} footer="Monthly emissions" />
        <StatCard label="EcoScore" value={ecoScore.score} unit="/ 100" icon={Sparkles} footer={`Level: ${level.name}`} />
      </div>

      <div className="grid grid-2-1 mb">
        <ChartCard title="Weekly Emissions" subtitle="Last 7 days by category (kg CO₂e)">
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={weekly} margin={{ left: -10, right: 4, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                <XAxis dataKey="weekday" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f0f7ee' }} formatter={(v) => `${v} kg`} />
                {CATEGORIES.map((c) => (
                  <Bar key={c.key} dataKey={c.key} name={c.label} stackId="a" fill={c.color} radius={c.key === 'waste' ? [4, 4, 0, 0] : 0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">{CATEGORIES.map((c) => <span key={c.key}><i style={{ background: c.color }} />{c.label}</span>)}</div>
        </ChartCard>

        <div className="card">
          <div className="card-title">Carbon Reduction Progress</div>
          <div className="card-sub">Last 7 days compared with the 7 days before</div>
          {reduction === null ? (
            <p className="hint">Add records for two weeks to see your reduction percentage.</p>
          ) : (
            <>
              <div className="stat-value" style={{ color: reduction >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                {reduction >= 0 ? '−' : '+'}{Math.abs(reduction)}%
              </div>
              <div className="progress" style={{ margin: '12px 0 8px' }}>
                <span style={{ width: `${Math.min(100, Math.max(0, reduction))}%` }} />
              </div>
              <div className="hint">
                <TrendingDown size={13} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                {reduction >= 0 ? 'Your emissions went down. Nice work!' : 'Emissions went up. Try a challenge or a tip.'}
              </div>
            </>
          )}
          <div style={{ marginTop: 18 }}>
            <div className="hint" style={{ marginBottom: 6 }}>EcoScore progress</div>
            <div className="progress"><span style={{ width: `${ecoScore.score}%` }} /></div>
            <Link to="/ecoscore" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>View score details</Link>
          </div>
        </div>
      </div>

      {/* Date filter */}
      <div className="card mb" style={{ padding: 16 }}>
        <div className="filters" style={{ justifyContent: 'space-between' }}>
          <div className="filters">
            <strong style={{ fontSize: '0.9rem' }}>Date filter</strong>
            <div className="seg">
              {[['7', '7 days'], ['30', '30 days'], ['90', '90 days'], ['all', 'All'], ['custom', 'Custom']].map(([v, l]) => (
                <button key={v} className={range === v ? 'on' : ''} onClick={() => setRange(v)}>{l}</button>
              ))}
            </div>
            {range === 'custom' && (
              <>
                <input type="date" className="date-input" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
                <span className="hint">to</span>
                <input type="date" className="date-input" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
              </>
            )}
          </div>
          <span className="badge">{filtered.length} records · {filteredTotal} kg CO₂e</span>
        </div>
      </div>

      <div className="grid grid-2-1 mb">
        <ChartCard title="Emission Trend" subtitle="Daily total in the selected period (kg CO₂e)">
          <div className="chart-box">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Total']} />
                <Area type="monotone" dataKey="total" stroke="#166534" strokeWidth={2.5} fill="url(#trendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Category Breakdown" subtitle="Selected period">
          {pieData.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No data in this range" text="Try a wider date range." />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${round(v)} kg CO₂e`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-2 mb">
        <ChartCard title="Monthly Comparison" subtitle="Last 6 months (kg CO₂e)">
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={monthly} margin={{ left: -10, right: 4, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f0f7ee' }} formatter={(v) => `${v} kg CO₂e`} />
                <Bar dataKey="total" name="Total" fill="#166534" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="card">
          <div className="card-title">Personalised Eco Tips</div>
          <div className="card-sub">{topCat ? `Your biggest recent source is ${CATEGORIES.find((c) => c.key === topCat).label.toLowerCase()}.` : 'General tips to get started.'}</div>
          <div className="activity-list">
            {tips.map((t) => (
              <div key={t.id} className="activity" style={{ alignItems: 'flex-start' }}>
                <div className="a-main">
                  <div className="a-title">{t.title}</div>
                  <div className="a-meta">{t.text}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/tips" className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>See all tips</Link>
        </div>
      </div>

      <div className="card">
        <div className="chart-head">
          <div>
            <div className="card-title">Recent Activity</div>
            <div className="card-sub">Latest records in the selected period</div>
          </div>
          <Link to="/calculator" className="btn btn-outline btn-sm">Manage records</Link>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No activity in this range" text="Pick another date range or add a new record." />
        ) : (
          <div className="activity-list">
            {sortedRecords.filter((r) => r.date >= start && r.date <= end).slice(0, 5).map((r) => <ActivityCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </>
  );
}
