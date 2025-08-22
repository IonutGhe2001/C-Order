import { useState } from 'react';
import { login } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
        <Input
          placeholder="email"
          autoFocus
          value={email}
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
        />
        <div className="relative">
          <Input
            className="pr-16"
            placeholder="password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
          />
          <Button
            type="button"
            variant="link"
            className="absolute top-1/2 -translate-y-1/2 right-2 h-auto p-0 text-sm"
            onClick={()=>setShowPwd(s=>!s)}
          >
            {showPwd ? 'Hide' : 'Show'}
          </Button>
        </div>
        <Button type="submit" className="flex items-center justify-center" disabled={loading}>
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2"></div>}
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
