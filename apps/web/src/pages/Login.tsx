import { useState } from 'react';
import { login } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/toaster';

export default function Login(){
  const [email, setEmail] = useState('admin@corp.local');
  const [password, setPassword] = useState('admin123');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(){
    if (loading) return;
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Signed in', variant: 'success' });
      window.location.href = '/tasks';
    } catch {
      toast({ title: "Can't sign in. Check credentials and try again.", variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <form className="w-full max-w-sm space-y-3" onSubmit={e=>{e.preventDefault(); handleSubmit();}}>
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <Input
          placeholder="Email"
          autoFocus
          value={email}
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
        />
        <div className="relative">
          <Input
            className="pr-16"
            placeholder="Password"
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
    </motion.div>
  );
}
