import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEco } from '../context/EcoContext';

export default function Toaster() {
  const { toasts, dismissToast } = useEco();
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'error' ? <AlertCircle size={18} color="#dc2626" /> : t.type === 'info' ? <Info size={18} color="#0ea5e9" /> : <CheckCircle2 size={18} color="#10b981" />}
          <span>{t.message}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss"><X size={15} /></button>
        </div>
      ))}
    </div>
  );
}
