import { useState } from 'react';
import { login } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, useReducedMotion } from 'framer-motion';
import { useToast } from '../components/ui/toaster';
import { Skeleton } from '../components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useTimeToAction } from '../lib/use-tta';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const toast = useToast();
  const { t } = useTranslation();
  const logLogin = useTimeToAction('login_submit');

  async function handleSubmit(){
    if (loading) return;
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = t('validation.emailRequired');
    if (!password.trim()) newErrors.password = t('validation.passwordRequired');
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    setLoading(true);
    try {
      logLogin();
      await login(email, password);
      toast({ title: t('messages.signInSuccess'), variant: 'success' });
      window.location.href = '/tasks';
    } catch {
      toast({ title: t('messages.signInFailed'), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ? (
    <main id="main-content" className="min-h-screen flex items-center justify-center p-6">
      <form className="w-full max-w-sm space-y-3" onSubmit={e=>{e.preventDefault(); handleSubmit();}}>
        <h1 className="text-2xl font-semibold">{t('titles.signIn')}</h1>
        <Input
          placeholder={t('placeholders.emailExample')}
          autoFocus
          value={email}
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
          tabIndex={1}
          disabled={loading}
        />
        {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
        <div className="relative">
          <Input
            className="pr-16"
            placeholder={t('placeholders.passwordExample')}
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
            tabIndex={2}
            disabled={loading}
          />
          <Button
            type="button"
            variant="link"
            className="absolute top-1/2 -translate-y-1/2 right-2 h-auto p-0 text-sm"
            onClick={()=>setShowPwd(s=>!s)}
            tabIndex={3}
            disabled={loading}
          >
            {t(showPwd ? 'buttons.hide' : 'buttons.show')}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
        <Button
          type="submit"
          className="flex items-center justify-center"
          disabled={loading}
          tabIndex={4}
        >
          {loading ? <Skeleton className="h-4 w-20" /> : t('buttons.signIn')}
        </Button>
      </form>
    </main>
  ) : (
    <motion.main
      id="main-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <form className="w-full max-w-sm space-y-3" onSubmit={e=>{e.preventDefault(); handleSubmit();}}>
        <h1 className="text-2xl font-semibold">{t('titles.signIn')}</h1>
        <Input
          placeholder={t('placeholders.emailExample')}
          autoFocus
          value={email}
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
          tabIndex={1}
          disabled={loading}
        />
        {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
        <div className="relative">
          <Input
            className="pr-16"
            placeholder={t('placeholders.passwordExample')}
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
            tabIndex={2}
            disabled={loading}
          />
          <Button
            type="button"
            variant="link"
            className="absolute top-1/2 -translate-y-1/2 right-2 h-auto p-0 text-sm"
            onClick={()=>setShowPwd(s=>!s)}
            tabIndex={3}
            disabled={loading}
          >
            {t(showPwd ? 'buttons.hide' : 'buttons.show')}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
        <Button
          type="submit"
          className="flex items-center justify-center"
          disabled={loading}
          tabIndex={4}
        >
          {loading ? <Skeleton className="h-4 w-20" /> : t('buttons.signIn')}
        </Button>
      </form>
    </motion.main>
  );
}
