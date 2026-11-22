import { useMemo, useState } from 'react';
import { Heart, CheckCircle2, Circle, Search, Lightbulb } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useEco } from '../context/EcoContext';
import { ECO_TIPS } from '../data/ecoTips';
import { CATEGORIES } from '../utils/emissionFactors';
import { daysAgoISO, inRange, sumByCategory, todayISO } from '../utils/calculations';

export default function EcoTips() {
  const { tipState, toggleTipDone, toggleTipFav, records, toast } = useEco();
  const [cat, setCat] = useState('all');
  const [view, setView] = useState('all'); // all | favs | done | todo
  const [search, setSearch] = useState('');

  // Personalisation: recommend tips from the category with the highest emissions in the last 30 days
  const topCat = useMemo(() => {
    const sums = sumByCategory(inRange(records, daysAgoISO(29), todayISO()));
    const best = Object.entries(sums).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0 ? best[0] : null;
  }, [records]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ECO_TIPS
      .filter((t) => (cat === 'all' || t.category === cat))
      .filter((t) => view === 'all' || (view === 'favs' && tipState.favs.includes(t.id)) || (view === 'done' && tipState.done.includes(t.id)) || (view === 'todo' && !tipState.done.includes(t.id)))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.text.toLowerCase().includes(q))
      .sort((a, b) => (b.category === topCat) - (a.category === topCat));
  }, [cat, view, search, tipState, topCat]);

  const catLabel = (k) => CATEGORIES.find((c) => c.key === k)?.label;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Eco Tips</h1>
          <p>
            {topCat ? `Tips about ${catLabel(topCat).toLowerCase()} are shown first, since it is your biggest recent source.` : 'Save some records to get tips tailored to your habits.'}
          </p>
        </div>
        <span className="badge">{tipState.done.length}/{ECO_TIPS.length} completed</span>
      </div>

      <div className="card mb" style={{ padding: 16 }}>
        <div className="filters" style={{ justifyContent: 'space-between' }}>
          <div className="filters">
            <div className="search-box">
              <Search size={16} />
              <input className="input" placeholder="Search tips" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ width: 'auto' }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div className="seg">
            {[['all', 'All'], ['todo', 'To do'], ['done', 'Done'], ['favs', 'Favourites']].map(([v, l]) => (
              <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card"><EmptyState icon={Lightbulb} title="No tips found" text="Try changing the search or filters." /></div>
      ) : (
        <div className="grid grid-3">
          {list.map((t) => {
            const done = tipState.done.includes(t.id);
            const fav = tipState.favs.includes(t.id);
            return (
              <div key={t.id} className={`card tip ${done ? 'done' : ''}`}>
                <div className="tip-top">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge">{catLabel(t.category)}</span>
                    {t.category === topCat && <span className="badge warn">Recommended</span>}
                  </div>
                  <button
                    className={`icon-btn ${fav ? 'active' : ''}`}
                    aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                    onClick={() => { toggleTipFav(t.id); toast(fav ? 'Removed from favourites' : 'Added to favourites', 'info'); }}
                  >
                    <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h4>{t.title}</h4>
                <p>{t.text}</p>
                <div className="tip-actions">
                  <button
                    className={`btn btn-sm ${done ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => { toggleTipDone(t.id); toast(done ? 'Marked as not done' : 'Nice! Tip marked as done', done ? 'info' : 'success'); }}
                  >
                    {done ? <CheckCircle2 size={15} /> : <Circle size={15} />} {done ? 'Done' : 'Mark as done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
