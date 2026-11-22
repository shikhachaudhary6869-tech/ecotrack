// A card wrapper for charts: title, subtitle, optional right-side control, and children (the chart).
export default function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="card">
      <div className="chart-head">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-sub" style={{ marginBottom: 0 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
