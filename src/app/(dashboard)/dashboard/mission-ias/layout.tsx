'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MissionIasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/mission-ias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Mission IAS
      </Link>
      {children}
    </div>
  );
}