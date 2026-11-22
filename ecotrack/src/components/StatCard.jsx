export default function StatCard({ label, value, unit, icon: Icon, footer, trend }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className="stat-icon"><Icon size={19} /></span>
        )}
      </div>
      <div className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {footer && (
        <div className={`stat-foot ${trend === 'good' ? 'trend-good' : trend === 'bad' ? 'trend-bad' : ''}`}>{footer}</div>
      )}
    </div>
  );
}
