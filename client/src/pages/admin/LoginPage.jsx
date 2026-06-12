import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginAdmin, selectAdmin, selectAdminLoading, selectAdminError } from '../../store/slices/adminAuthSlice';
import Logo from '../../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (admin) navigate('/admin/dashboard', { replace: true });
  }, [admin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter email and password');
      return;
    }

    dispatch(loginAdmin({ email, password }));
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-deep via-teal-luxury to-emerald-deep flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-[0_8px_30px_rgba(11,58,66,0.12)]">
        <div className="text-center mb-6">
          <Logo link={false} />
          <div className="text-xs text-emerald-deep font-semibold tracking-widest uppercase mt-0.5">Admin Login</div>
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-3 mb-4">{displayError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
              className="w-full px-3.5 py-3 border-2 border-gold-soft/30 rounded-xl text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-3.5 py-3 border-2 border-gold-soft/30 rounded-xl text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-deep text-white font-bold text-sm py-3.5 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury disabled:opacity-60 transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          <Link to="/" className="text-emerald-deep hover:underline">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
