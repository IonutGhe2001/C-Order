
import { useState } from 'react';
import { login } from '../lib/api';

export default function Login(){
  const [email, setEmail] = useState('admin@corp.local');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form className="w-full max-w-sm space-y-3" onSubmit={async e=>{e.preventDefault(); setErr(''); try { await login(email, password); window.location.href='/tasks'; } catch { setErr('Login invalid'); }}}>
        <h1 className="text-2xl font-semibold">Login</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="border p-2 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border px-3 py-2">Sign in</button>
      </form>
    </div>
  );
}
