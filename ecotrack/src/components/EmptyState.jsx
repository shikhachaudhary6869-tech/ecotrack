export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      {Icon && <div className="empty-icon"><Icon size={24} /></div>}
      <h4>{title}</h4>
      <p style={{ marginBottom: action ? 16 : 0 }}>{text}</p>
      {action}
    </div>
  );
}
