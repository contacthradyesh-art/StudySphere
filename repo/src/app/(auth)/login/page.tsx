'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginWithEmail, loginWithGoogle, resendVerification } from '@/lib/auth/service';
import { loginSchema } from '@/lib/validators/auth';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/dashboard';
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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
    try {
      await loginWithEmail(parsed.data.email, parsed.data.password);
      toast.success('Welcome back!');
      router.push(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(message);
      // Agar email verify nahi hui toh resend button dikhao
      if (message.includes('verify your email')) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setResendLoading(true);
    try {
      await resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Could not send email. Try again.');
    } finally {
      setResendLoading(false);
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      window.location.href = redirect;    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to continue studying</p>
      </div>

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

      {/* Resend verification box */}
      {showResend && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="mb-2 font-medium">Email not verified</p>
          <p className="mb-3 text-yellow-700">
            Check your inbox for the verification link. Spam folder bhi dekho!
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onResend}
            disabled={resendLoading}
            className="w-full"
          >
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