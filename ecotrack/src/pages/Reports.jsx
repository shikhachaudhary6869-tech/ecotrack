import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { Download, Printer, FileBarChart, TrendingDown, TrendingUp } from 'lucide-react';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { useEco } from '../context/EcoContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/emissionFactors';
import { todayISO, toISO, inRange, sumTotal, sumByCategory, formatDate, monthlySeries, round } from '../utils/calculations';
import { Cloud, CalendarRange, Percent } from 'lucide-react';

const AXIS = { fontSize: 12, fill: '#5b6b61' };
const DAYS = { daily: 1, weekly: 7, monthly: 30 };

const shift = (iso, n) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toISO(d);
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function Reports() {
  const { user } = useAuth();
  const { records, sortedRecords, toast } = useEco();
  const [type, setType] = useState('weekly');
  const [day, setDay] = useState(todayISO());

  const days = DAYS[type];
  const end = type === 'daily' ? day : todayISO();
  const start = shift(end, -(days - 1));
  const prevEnd = shift(start, -1);
  const prevStart = shift(prevEnd, -(days - 1));

  const current = useMemo(() => inRange(records, start, end), [records, start, end]);
  const previous = useMemo(() => inRange(records, prevStart, prevEnd), [records, prevStart, prevEnd]);
  const total = sumTotal(current);
  const prevTotal = sumTotal(previous);
  const reduction = prevTotal > 0 ? round(((prevTotal - total) / prevTotal) * 100, 1) : null;
  const byCat = sumByCategory(current);
  const catData = CATEGORIES.map((c) => ({ name: c.label, value: byCat[c.key], color: c.color }));

  // Trend: for daily reports show 7 days ending on the chosen date; otherwise the report range
  const trendDays = type === 'daily' ? 7 : days;
  const trend = useMemo(() => {
    const out = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const iso = shift(end, -i);
      const recs = records.filter((r) => r.date === iso);
      out.push({ label: new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), total: sumTotal(recs) });
    }
    return out;
  }, [records, end, trendDays]);

  const history = useMemo(() => monthlySeries(records, 6), [records]);
  const rows = sortedRecords.filter((r) => r.date >= start && r.date <= end);

  const rangeLabel = type === 'daily' ? formatDate(end) : `${formatDate(start)} – ${formatDate(end)}`;

  const downloadCSV = () => {
    if (rows.length === 0) return toast('No records in this period to download', 'error');
    const header = ['Date', 'Title', 'Transport (kg)', 'Electricity (kg)', 'Food (kg)', 'Waste (kg)', 'Total (kg CO2e)'];
    const lines = rows.map((r) => [r.date, r.title, r.breakdown.transport, r.breakdown.electricity, r.breakdown.food, r.breakdown.waste, r.total].map(csvCell).join(','));
    const csv = [header.map(csvCell).join(','), ...lines, '', csvCell('Illustrative estimates only - not certified data')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotrack-${type}-report-${end}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('CSV downloaded');
  };

  const printPDF = () => {
    toast('Choose “Save as PDF” in the print dialog', 'info');
    setTimeout(() => window.print(), 400);
  };

  return (
    <>
      <div className="page-head no-print">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Review your emissions by day, week or month.</p>
        </div>
        <div className="filters">
          <button className="btn btn-outline" onClick={downloadCSV}><Download size={16} /> CSV</button>
          <button className="btn btn-primary" onClick={printPDF}><Printer size={16} /> PDF</button>
        </div>
      </div>

      <div className="print-only" style={{ marginBottom: 16 }}>
        <h1>EcoTrack {type} report</h1>
        <p>{user.name} · {rangeLabel}</p>
      </div>

      <div className="card mb no-print" style={{ padding: 16 }}>
        <div className="filters" style={{ justifyContent: 'space-between' }}>
          <div className="filters">
            <div className="seg">
              {Object.keys(DAYS).map((k) => (
                <button key={k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>{k[0].toUpperCase() + k.slice(1)}</button>
              ))}
            </div>
            {type === 'daily' && <input type="date" className="date-input" value={day} max={todayISO()} onChange={(e) => e.target.value && setDay(e.target.value)} aria-label="Report date" />}
          </div>
          <span className="badge">{rangeLabel}</span>
        </div>
      </div>

      <div className="grid grid-3 mb">
        <StatCard label="Total emissions" value={total} unit="kg CO₂e" icon={Cloud} footer={`${current.length} record${current.length === 1 ? '' : 's'} in period`} />
        <StatCard label="Average per day" value={round(total / days)} unit="kg CO₂e" icon={CalendarRange} footer={`Over ${days} day${days > 1 ? 's' : ''}`} />
        <StatCard
          label="Carbon reduction"
          value={reduction === null ? '—' : `${reduction >= 0 ? '' : '+'}${Math.abs(reduction)}%`}
          icon={Percent}
          trend={reduction === null ? undefined : reduction >= 0 ? 'good' : 'bad'}
          footer={reduction === null ? 'No data in previous period to compare' : reduction >= 0 ? `Down vs previous ${days === 1 ? 'day' : days + ' days'} (${prevTotal} kg)` : `Up vs previous ${days === 1 ? 'day' : days + ' days'} (${prevTotal} kg)`}
        />
      </div>

      {records.length === 0 ? (
        <div className="card"><EmptyState icon={FileBarChart} title="No data to report yet" text="Save some records in the calculator and your reports will appear here." /></div>
      ) : (
        <>
          <div className="grid grid-2 mb">
            <ChartCard title="Category-wise footprint" subtitle="Selected period (kg CO₂e)">
              <div className="chart-box">
                <ResponsiveContainer>
                  <BarChart data={catData} margin={{ left: -10, right: 4, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                    <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f0f7ee' }} formatter={(v) => `${v} kg CO₂e`} />
                    <Bar dataKey="value" name="kg CO₂e" fill="#166534" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title={type === 'daily' ? 'Last 7 days up to this date' : 'Daily trend'} subtitle="Total per day (kg CO₂e)">
              <div className="chart-box">
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                    <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Total']} />
                    <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="mb">
            <ChartCard title="Historical emission trend" subtitle="Last 6 months by category (kg CO₂e)">
              <div className="chart-box">
                <ResponsiveContainer>
                  <BarChart data={history} margin={{ left: -10, right: 4, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eee6" vertical={false} />
                    <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f0f7ee' }} formatter={(v) => `${v} kg CO₂e`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    {CATEGORIES.map((c) => <Bar key={c.key} dataKey={c.key} name={c.label} stackId="h" fill={c.color} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="card">
            <div className="card-title">Records in this period</div>
            <div className="card-sub">{rows.length} record{rows.length === 1 ? '' : 's'}</div>
            {rows.length === 0 ? (
              <EmptyState icon={FileBarChart} title="No records in this period" text="Choose another period or add records in the calculator." />
            ) : (
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr><th>Date</th><th>Title</th>{CATEGORIES.map((c) => <th key={c.key}>{c.label}</th>)}<th>Total</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{formatDate(r.date)}</td><td>{r.title}</td>
                        {CATEGORIES.map((c) => <td key={c.key}>{r.breakdown[c.key]}</td>)}
                        <td><b>{r.total}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="hint" style={{ marginTop: 12 }}>All values in kg CO₂e. Illustrative estimates, not certified data.</p>
          </div>
        </>
      )}
    </>
  );
}
