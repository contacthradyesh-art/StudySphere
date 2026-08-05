'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Newspaper, Library, Languages, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Every future Mission IAS feature (Editorial Hub, PIB Hub, PYQ Explorer,
 * Answer Writing, Revision Engine, ...) gets one entry here and a matching
 * folder under src/app/(dashboard)/dashboard/mission-ias/.
 * `ready: false` entries render as disabled "Coming soon" tabs so the nav
 * shape is visible without pretending unbuilt features exist.
 */
const MISSION_IAS_NAV = [
  { href: '/dashboard/mission-ias', label: 'Mission Dashboard', icon: Landmark, ready: true },
  { href: '/dashboard/mission-ias/current-affairs', label: 'Current Affairs', icon: Newspaper, ready: true },
  { href: '/dashboard/mission-ias/digital-library', label: 'Digital Library', icon: Library, ready: true },
  { href: '/dashboard/mission-ias/vocabulary-lab', label: 'Vocabulary Lab', icon: Languages, ready: true },
  { href: '/dashboard/mission-ias/map-practice', label: 'Map Practice', icon: Map, ready: true }
];

export default function MissionIasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex w-fit gap-1 rounded-xl bg-secondary p-1">
          {MISSION_IAS_NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'bg-gradient-brand text-white shadow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground/40"
              >
                <Icon className="h-4 w-4" /> {item.label}
              </span>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}