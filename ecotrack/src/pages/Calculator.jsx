import { useMemo, useState } from 'react';
import { Car, Zap, Utensils, Trash2, Calculator as CalcIcon, Save, RotateCcw, Search, ClipboardList, Info, X } from 'lucide-react';
import ActivityCard from '../components/ActivityCard';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { useEco } from '../context/EcoContext';
import { EMISSION_FACTORS, CATEGORIES, FACTORS_DISCLAIMER } from '../utils/emissionFactors';
import { calculateEmissions, emptyInputs, todayISO } from '../utils/calculations';

const TAB_ICONS = { transport: Car, electricity: Zap, food: Utensils, waste: Trash2 };

export default function Calculator() {
  const { sortedRecords, addRecord, updateRecord, deleteRecord, toast } = useEco();
  const [tab, setTab] = useState('transport');
  const [inputs, setInputs] = useState(emptyInputs());
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showFactors, setShowFactors] = useState(false);

  // records list controls
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [toDelete, setToDelete] = useState(null);

  const setValue = (cat, field, value) => {
    setInputs((prev) => ({ ...prev, [cat]: { ...prev[cat], [field]: value } }));
    setResult(null);
    setErrors((e) => ({ ...e, [`${cat}.${field}`]: undefined }));
  };

  const validate = () => {
    const err = {};
    let anyValue = false;
    Object.keys(EMISSION_FACTORS).forEach((cat) => {
      Object.keys(EMISSION_FACTORS[cat]).forEach((field) => {
        const raw = inputs[cat][field];
        if (raw === '' || raw === undefined) return;
        const n = Number(raw);
        if (Number.isNaN(n)) err[`${cat}.${field}`] = 'Enter a number.';
        else if (n < 0) err[`${cat}.${field}`] = 'Value cannot be negative.';
        else if (n > 100000) err[`${cat}.${field}`] = 'Value is too large.';
        else if (n > 0) anyValue = true;
      });
    });
    if (!date) err.date = 'Choose a date.';
    else if (date > todayISO()) err.date = 'Date cannot be in the future.';
    if (!anyValue && Object.keys(err).length === 0) err.form = 'Enter at least one value greater than 0.';
    return err;
  };

  const calculate = () => {
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) {
      toast(err.form || 'Please fix the highlighted fields', 'error');
      setResult(null);
      return;
    }
    setResult(calculateEmissions(inputs));
  };

  const reset = () => {
    setInputs(emptyInputs());
    setResult(null);
    setErrors({});
    setTitle('');
    setDate(todayISO());
    setEditingId(null);
  };

  const saveRecord = () => {
    if (!result) return;
    const data = { date, title: title.trim() || 'Daily footprint', inputs, breakdown: result.breakdown, total: result.total };
    if (editingId) {
      updateRecord(editingId, data);
      toast('Record updated');
    } else {
      addRecord(data);
      toast('Record saved');
    }
    reset();
  };

  const startEdit = (rec) => {
    const fresh = emptyInputs();
    Object.keys(fresh).forEach((cat) => Object.keys(fresh[cat]).forEach((f) => {
      const v = rec.inputs?.[cat]?.[f];
      fresh[cat][f] = v === undefined ? '' : v;
    }));
    setInputs(fresh);
    setDate(rec.date);
    setTitle(rec.title || '');
    setEditingId(rec.id);
    setResult(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Editing record. Update values and press Calculate.', 'info');
  };

  const confirmDelete = () => {
    deleteRecord(toDelete.id);
    if (editingId === toDelete.id) reset();
    toast('Record deleted', 'info');
    setToDelete(null);
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedRecords.filter((r) => {
      const matchText = !q || (r.title || '').toLowerCase().includes(q) || r.date.includes(q);
      const matchCat = catFilter === 'all' || (r.breakdown?.[catFilter] || 0) > 0;
      return matchText && matchCat;
    });
  }, [sortedRecords, search, catFilter]);

  const fields = EMISSION_FACTORS[tab];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Carbon Footprint Calculator</h1>
          <p>Enter your activities for a day and calculate estimated emissions.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setShowFactors(!showFactors)}><Info size={16} /> {showFactors ? 'Hide' : 'View'} emission factors</button>
      </div>

      <div className="disclaimer mb"><Info size={18} style={{ flexShrink: 0 }} /> <span>{FACTORS_DISCLAIMER}</span></div>

      {showFactors && (
        <div className="card mb">
          <div className="card-title">Emission factors used (illustrative)</div>
          <div className="table-scroll">
            <table className="factor-table">
              <thead><tr><th>Category</th><th>Activity</th><th>Factor</th><th>Note</th></tr></thead>
              <tbody>
                {Object.entries(EMISSION_FACTORS).flatMap(([cat, items]) =>
                  Object.entries(items).map(([k, f]) => (
                    <tr key={cat + k}><td>{CATEGORIES.find((c) => c.key === cat).label}</td><td>{f.label}</td><td>{f.factor} / {f.unit}</td><td>{f.note}</td></tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-2-1 mb" style={{ alignItems: 'start' }}>
        <div className="card">
          {editingId && (
            <div className="badge warn" style={{ marginBottom: 14 }}>Editing a saved record <button className="icon-btn" style={{ width: 22, height: 22, marginLeft: 6 }} onClick={reset} aria-label="Cancel edit"><X size={12} /></button></div>
          )}
          <div className="input-grid">
            <div className="field">
              <label htmlFor="title">Title (optional)</label>
              <input id="title" className="input" value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekday commute" />
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" className={`input ${errors.date ? 'invalid' : ''}`} value={date} max={todayISO()} onChange={(e) => { setDate(e.target.value); setResult(null); }} />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>

          <div className="tabs">
            {CATEGORIES.map((c) => {
              const Icon = TAB_ICONS[c.key];
              return (
                <button key={c.key} className={`tab ${tab === c.key ? 'on' : ''}`} onClick={() => setTab(c.key)}>
                  <Icon size={16} /> {c.label}
                </button>
              );
            })}
          </div>

          <div className="input-grid">
            {Object.entries(fields).map(([field, f]) => {
              const key = `${tab}.${field}`;
              return (
                <div className="field" key={field}>
                  <label htmlFor={key}>{f.label} ({f.unit})</label>
                  <input
                    id={key}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    className={`input ${errors[key] ? 'invalid' : ''}`}
                    value={inputs[tab][field]}
                    onChange={(e) => setValue(tab, field, e.target.value)}
                    placeholder="0"
                  />
                  {errors[key] ? <span className="error-text">{errors[key]}</span> : <span className="hint">{f.note}</span>}
                </div>
              );
            })}
          </div>
          {errors.form && <div className="form-error">{errors.form}</div>}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={calculate}><CalcIcon size={16} /> Calculate</button>
            <button className="btn btn-outline" onClick={reset}><RotateCcw size={16} /> Reset</button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Summary</div>
          {!result ? (
            <EmptyState icon={CalcIcon} title="No result yet" text="Fill in your activities in any tab, then press Calculate." />
          ) : (
            <>
              <div className="card-sub">Estimated emissions for {date}</div>
              <div className="summary-total">{result.total} <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 600 }}>kg CO₂e</span></div>
              <div style={{ margin: '12px 0 18px' }}>
                {CATEGORIES.map((c) => (
                  <div className="summary-row" key={c.key}>
                    <span><i className="dot" style={{ background: c.color }} />{c.label}</span>
                    <b>{result.breakdown[c.key]} kg</b>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveRecord}>
                <Save size={16} /> {editingId ? 'Update record' : 'Save record'}
              </button>
              <p className="hint" style={{ marginTop: 10 }}>Illustrative estimate. Not a certified measurement.</p>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="chart-head">
          <div>
            <div className="card-title">Saved records</div>
            <div className="card-sub">{sortedRecords.length} total · search, filter, edit or delete</div>
          </div>
          <div className="filters">
            <div className="search-box">
              <Search size={16} />
              <input className="input" placeholder="Search title or date" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ width: 'auto' }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {sortedRecords.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No saved records" text="Calculate and save your first record above." />
        ) : visible.length === 0 ? (
          <EmptyState icon={Search} title="No matches" text="Try a different search or filter." />
        ) : (
          <div className="activity-list">
            {visible.map((r) => <ActivityCard key={r.id} record={r} onEdit={startEdit} onDelete={setToDelete} />)}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete this record?"
        message="This record will be permanently removed from your device. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
