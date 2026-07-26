'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerWithEmail, loginWithGoogle } from '@/lib/auth/service';
import { registerSchema } from '@/lib/validators/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      displayName: f.get('displayName'),
      email: f.get('email'),
      password: f.get('password'),
      confirmPassword: f.get('confirmPassword')
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    try {
      await registerWithEmail(parsed.data.email, parsed.data.password, parsed.data.displayName);
      toast.success('Account created! Check your inbox to verify your email before signing in.');
      // No session is created until the email is verified, so send the user to login.
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start your productivity journey</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Name</Label>
          <Input id="displayName" name="displayName" placeholder="Ada Lovelace" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
        <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </Button>
      </form>

      <Button variant="outline" className="w-full" onClick={onGoogle}>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}
