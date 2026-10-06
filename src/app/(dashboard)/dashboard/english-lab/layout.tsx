'use client';
import { Languages } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
export default function EnglishLabLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <div className="space-y-5"><GlassCard className="border-primary/15 bg-primary/5"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Languages className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">StudySphere · English Lab</p><h1 className="text-xl font-bold tracking-tight">English Lab · अंग्रेज़ी अभ्यास</h1><p className="text-sm text-muted-foreground">{user ? 'Words samjhein aur speaking practice karein।' : 'Sign in karke English practice shuru karein।'}</p></div></div></GlassCard>{children}</div>;
}