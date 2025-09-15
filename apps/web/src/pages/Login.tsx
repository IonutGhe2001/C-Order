import { useState } from 'react';
import { login } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useToast } from '../components/ui/toaster';
import { Skeleton } from '../components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useTimeToAction } from '../lib/use-tta';
import loginIllustration from '../assets/login-illustration.svg?raw';

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
  const form = (
    <form className="w-full max-w-sm" onSubmit={e=>{e.preventDefault(); handleSubmit();}}>
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl">{t('titles.signIn')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('labels.email')}
            </label>
            <Input
              id="email"
              placeholder={t('placeholders.emailExample')}
              autoFocus
              value={email}
              onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); handleSubmit();}}}
              tabIndex={1}
              disabled={loading}
            />
            {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('labels.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                className="pr-10"
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
                variant="ghost"
                className="absolute inset-y-0 right-0 flex items-center px-3 h-full"
                onClick={()=>setShowPwd(s=>!s)}
                tabIndex={3}
                disabled={loading}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{t(showPwd ? 'buttons.hide' : 'buttons.show')}</span>
              </Button>
            </div>
            {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
          </div>
          <Button
            type="submit"
            className="w-full flex items-center justify-center"
            disabled={loading}
            tabIndex={4}
          >
            {loading ? <Skeleton className="h-4 w-20" /> : t('buttons.signIn')}
          </Button>
        </CardContent>
      </Card>
    </form>
  );

  const illustration = (
    <div
      className="hidden lg:flex items-center justify-center bg-muted p-6"
      dangerouslySetInnerHTML={{ __html: loginIllustration }}
    />
  );

  return shouldReduceMotion ? (
    <main id="main-content" className="min-h-screen grid lg:grid-cols-2">
      {illustration}
      <div className="flex items-center justify-center p-6">{form}</div>
    </main>
  ) : (
    <motion.main
      id="main-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen grid lg:grid-cols-2"
    >
      {illustration}
      <div className="flex items-center justify-center p-6">{form}</div>
    </motion.main>
  );
}
