// Simple confirmation dialog. Render it only when you need it (open === true).
export default function ConfirmModal({ open, title, message, confirmText = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger-solid" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
