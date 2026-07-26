import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

/** Shared layout for all authentication screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-bold">
          <GraduationCap className="h-7 w-7 text-primary" /> StudySphere
        </Link>
        <div className="glass rounded-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
