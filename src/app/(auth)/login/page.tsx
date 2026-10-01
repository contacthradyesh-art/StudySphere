'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  confirmPhoneCode,
  loginWithEmail,
  loginWithGoogle,
  resendVerification,
  restoreSessionFromFirebase,
  safeRedirect,
  sendPhoneCode,
} from '@/lib/auth/service';
import type { ConfirmationResult } from 'firebase/auth';
import { loginSchema } from '@/lib/validators/auth';

function LoginForm() {
  const params = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const relogin = params.get('relogin') === '1';
  const lastCreds = useRef<{ email: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);



  // Server session cookie lasts 5 days while Firebase stays signed in on the device.
  // Re-create the cookie silently so users are never stuck on the login screen.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (relogin) {
        // A guard sent us here because there is no usable Firebase user: clear the stale cookie.
        await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => undefined);
        return;
      }
      const restored = await restoreSessionFromFirebase();
      if (restored && !cancelled) window.location.href = redirect;
    })();
    return () => { cancelled = true; };
  }, [redirect, relogin]);

  function normalizePhone(value: string) {
    const clean = value.trim().replace(/[\s()-]/g, '');
    if (/^\d{10}$/.test(clean)) return '+91' + clean;
    if (/^0\d{10}$/.test(clean)) return '+91' + clean.slice(1);
    return clean;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get('email'),
      password: form.get('password')
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    setShowResend(false);
    lastCreds.current = { email: parsed.data.email, password: parsed.data.password };
    try {
      await loginWithEmail(parsed.data.email, parsed.data.password);
      toast.success('Welcome back!');
      window.location.href = redirect;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(message);
      if (message.includes('verify your email')) setShowResend(true);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setResendLoading(true);
    try {
      const creds = lastCreds.current;
      if (!creds) {
        toast.error('Enter your email and password, then try Resend again.');
        return;
      }
      await resendVerification(creds.email, creds.password);
      toast.success('Verification email sent! Check your inbox and spam folder.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send email. Try again.');
    } finally {
      setResendLoading(false);
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) window.location.href = redirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  }

  async function onSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhoneLoading(true);
    try {
      const result = await sendPhoneCode(normalizePhone(phone), 'phone-recaptcha');
      setConfirmation(result);
      setOtp('');
      toast.success('OTP sent to your mobile number.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send OTP');
    } finally {
      setPhoneLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirmation) return;
    setPhoneLoading(true);
    try {
      await confirmPhoneCode(confirmation, otp);
      toast.success('Welcome back!');
      window.location.href = redirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not verify OTP');
    } finally {
      setPhoneLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to continue studying</p>
      </div>

      <div className="grid grid-cols-2 rounded-xl border border-border p-1">
        <button type="button" onClick={() => { setMethod('email'); setConfirmation(null); }} className={method === 'email' ? 'rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground' : 'rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground'}>
          Email & password
        </button>
        <button type="button" onClick={() => { setMethod('phone'); setConfirmation(null); }} className={method === 'phone' ? 'rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground' : 'rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground'}>
          Mobile OTP
        </button>
      </div>

      {method === 'email' && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
            </div>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Log in'}
          </Button>
        </form>
      )}

      {method === 'phone' && !confirmation && (
        <form onSubmit={onSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" type="tel" inputMode="tel" placeholder="+91 9876543210" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <p className="text-xs text-muted-foreground">India numbers can be entered as 10 digits. We will send an OTP by SMS.</p>
          </div>
          <div id="phone-recaptcha" className="flex min-h-[78px] justify-center" />
          <Button id="phone-otp-button" type="submit" variant="gradient" className="w-full" disabled={phoneLoading || !phone.trim()}>
            {phoneLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      )}

      {method === 'phone' && confirmation && (
        <form onSubmit={onVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">6-digit OTP</Label>
            <Input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={phoneLoading || otp.length !== 6}>
            {phoneLoading ? 'Verifying...' : 'Verify & continue'}
          </Button>
          <button type="button" className="w-full text-xs text-primary hover:underline" onClick={() => setConfirmation(null)}>
            Change number / resend OTP
          </button>
        </form>
      )}


      {showResend && method === 'email' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="mb-2 font-medium">Email not verified</p>
          <p className="mb-3 text-yellow-700">Check your inbox for the verification link. Spam folder bhi dekho!</p>
          <Button variant="outline" size="sm" onClick={onResend} disabled={resendLoading} className="w-full">
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" onClick={onGoogle} disabled={googleLoading}>
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
