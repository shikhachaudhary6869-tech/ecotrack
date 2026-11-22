import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useEco } from '../context/EcoContext';
import { formatDate, toISO } from '../utils/calculations';

export default function Profile() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { records, clearRecords, rewardPoints, ecoScore, level, challengeState, toast } = useEco();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'records' | 'account' | null

  const saveName = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Name must be at least 2 characters.');
    setError('');
    updateProfile({ name });
    toast('Profile updated');
  };

  const handleLogout = () => {
    logout();
    toast('You have been logged out', 'info');
    navigate('/');
  };

  const confirm = () => {
    if (modal === 'records') {
      clearRecords();
      toast('All records deleted', 'info');
    } else if (modal === 'account') {
      deleteAccount();
      navigate('/');
    }
    setModal(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Manage your account and data.</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}><LogOut size={16} /> Log out</button>
      </div>

      <div className="grid grid-2 mb" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="profile-head">
            <div className="avatar-lg">{user.name[0]?.toUpperCase()}</div>
            <div>
              <h3>{user.name}</h3>
              <p className="hint">{user.email}</p>
              <p className="hint">Member since {formatDate(toISO(user.createdAt))}</p>
            </div>
          </div>
          <form onSubmit={saveName} noValidate>
            <div className="field">
              <label htmlFor="pname">Display name</label>
              <input id="pname" className={`input ${error ? 'invalid' : ''}`} value={name} onChange={(e) => setName(e.target.value)} />
              {error && <span className="error-text">{error}</span>}
            </div>
            <div className="field">
              <label htmlFor="pmail">Email</label>
              <input id="pmail" className="input" value={user.email} disabled />
              <span className="hint">Email cannot be changed in this demo.</span>
            </div>
            <button className="btn btn-primary"><Save size={16} /> Save changes</button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Your stats</div>
          <div className="card-sub">A quick summary of your progress</div>
          <div className="summary-row"><span>EcoScore</span><b>{ecoScore.score}/100 · {level.name}</b></div>
          <div className="summary-row"><span>Saved records</span><b>{records.length}</b></div>
          <div className="summary-row"><span>Reward points</span><b>{rewardPoints}</b></div>
          <div className="summary-row"><span>Challenges completed</span><b>{challengeState.history.length}</b></div>
        </div>
      </div>

      <div className="card" style={{ borderColor: '#fecaca' }}>
        <div className="card-title" style={{ color: 'var(--danger)', display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle size={18} /> Danger zone</div>
        <div className="card-sub">These actions cannot be undone. Your data lives only in this browser.</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-danger" disabled={records.length === 0} onClick={() => setModal('records')}><Trash2 size={16} /> Delete all records</button>
          <button className="btn btn-danger" onClick={() => setModal('account')}><Trash2 size={16} /> Delete account</button>
        </div>
      </div>

      <ConfirmModal
        open={!!modal}
        title={modal === 'account' ? 'Delete your account?' : 'Delete all records?'}
        message={modal === 'account' ? 'Your account and all saved data on this device will be permanently removed.' : `All ${records.length} saved records will be permanently removed.`}
        confirmText={modal === 'account' ? 'Delete account' : 'Delete all'}
        onConfirm={confirm}
        onCancel={() => setModal(null)}
      />
    </>
  );
}
