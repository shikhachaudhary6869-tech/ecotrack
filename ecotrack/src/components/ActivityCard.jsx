import { Car, Zap, Utensils, Trash2, Pencil } from 'lucide-react';
import { CATEGORIES } from '../utils/emissionFactors';
import { formatDate } from '../utils/calculations';

const ICONS = { transport: Car, electricity: Zap, food: Utensils, waste: Trash2 };

// Shows one saved calculation record. Edit/delete buttons only appear when handlers are given.
export default function ActivityCard({ record, onEdit, onDelete }) {
  // find the biggest category to show as the icon
  const top = CATEGORIES.reduce((best, c) => ((record.breakdown?.[c.key] || 0) > (record.breakdown?.[best.key] || 0) ? c : best), CATEGORIES[0]);
  const Icon = ICONS[top.key];

  return (
    <div className="activity">
      <div className="a-icon"><Icon size={19} /></div>
      <div className="a-main">
        <div className="a-title">{record.title || 'Daily footprint'}</div>
        <div className="a-meta">{formatDate(record.date)}</div>
        <div className="chips">
          {CATEGORIES.filter((c) => (record.breakdown?.[c.key] || 0) > 0).map((c) => (
            <span key={c.key} className="badge gray">{c.label}: {record.breakdown[c.key]}</span>
          ))}
        </div>
      </div>
      <div className="a-total">{record.total} <small>kg CO₂e</small></div>
      {(onEdit || onDelete) && (
        <div className="a-actions">
          {onEdit && <button className="icon-btn" title="Edit" onClick={() => onEdit(record)}><Pencil size={15} /></button>}
          {onDelete && <button className="icon-btn" title="Delete" onClick={() => onDelete(record)}><Trash2 size={15} /></button>}
        </div>
      )}
    </div>
  );
}
