
import { useState } from 'react';
import { login } from '../lib/api';

export default function Login(){
  const [email, setEmail] = useState('admin@corp.local');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(){
    if (loading) return;
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = '/tasks';
    } catch {
      setErr('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form className="w-full max-w-sm space-y-3" onSubmit={e=>{e.preventDefault(); handleSubmit();}}>
        <h1 className="text-2xl font-semibold">Login</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="border p-2 w-full" placeholder="email" autoFocus value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}} />
        <div className="relative">
          <input className="border p-2 w-full pr-16" placeholder="password" type={showPwd ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}} />
          <button type="button" className="absolute top-1/2 -translate-y-1/2 right-2 text-sm" onClick={()=>setShowPwd(s=>!s)}>
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit" className="border px-3 py-2 flex items-center justify-center" disabled={loading}>
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2"></div>}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
