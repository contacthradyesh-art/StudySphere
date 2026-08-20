'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth/service';
import { resetSchema } from '@/lib/validators/auth';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email'));
    const parsed = resetSchema.safeParse({ email });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    try {
      await resetPassword(parsed.data.email);
      setSent(true);
      toast.success('Reset link sent if the email exists');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground">We'll email you a secure reset link</p>
      </div>

      {sent ? (
        <p className="rounded-lg bg-accent p-4 text-center text-sm text-accent-foreground">
          Check your inbox for the reset link.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
