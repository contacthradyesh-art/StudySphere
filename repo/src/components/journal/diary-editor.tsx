'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Patrick_Hand, Caveat, Kalam, Dancing_Script } from 'next/font/google';
import { BookOpenText, Feather, Flame } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Handwriting fonts — loaded once, swapped instantly via class name.
// ---------------------------------------------------------------------------
const patrickHand = Patrick_Hand({ subsets: ['latin'], weight: '400', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'], display: 'swap' });
const kalam = Kalam({ subsets: ['latin'], weight: ['300', '400', '700'], display: 'swap' });
const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['500', '700'], display: 'swap' });

type WritingStyleId = 'classic' | 'handwriting' | 'cursive' | 'elegant';

const WRITING_STYLES: Array<{
  id: WritingStyleId;
  label: string;
  font: { className: string };
  textSize: string;
  lineHeight: number; // px — must match the ruled-line background for the ink to sit on the line
}> = [
  { id: 'classic', label: 'Classic', font: patrickHand, textSize: 'text-[18px]', lineHeight: 32 },
  { id: 'handwriting', label: 'Handwriting', font: caveat, textSize: 'text-[22px]', lineHeight: 32 },
  { id: 'cursive', label: 'Cursive', font: kalam, textSize: 'text-[18px]', lineHeight: 32 },
  { id: 'elegant', label: 'Elegant', font: dancingScript, textSize: 'text-[22px]', lineHeight: 32 },
];

// Lightweight, resolution-independent grain — an inline SVG turbulence filter
// rather than a shipped raster image.
const PAPER_GRAIN =
  'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix type=\'saturate\' values=\'0\'/></filter><rect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/></svg>")';

function diaryStamp(date: Date) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${weekday} ${day} ${month} ${year} ${time}`;
}

interface DiaryEditorProps {
  /** Controlled value — same `content` state the page already saves to Firestore. */
  value: string;
  onChange: (value: string) => void;
  /** Optional current writing streak in days. Omit or pass 0 to hide the badge. */
  streak?: number;
  className?: string;
}

export function DiaryEditor({ value, onChange, streak, className }: DiaryEditorProps) {
  const [styleId, setStyleId] = useState<WritingStyleId>('classic');
  const [now, setNow] = useState<Date | null>(null);
  const reduceMotion = useReducedMotion();

  // Live clock — mounted client-side only to avoid SSR/client hydration mismatch.
  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  const active = WRITING_STYLES.find((s) => s.id === styleId) ?? WRITING_STYLES[0];

  const wordCount = useMemo(() => {
    const trimmed = value.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [value]);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('space-y-2', className)}
    >
      <label className="flex items-center gap-1.5 text-sm font-medium">
        Write about your day <Feather className="h-3.5 w-3.5 text-primary" />
      </label>

      <GlassCard className="relative space-y-4 overflow-hidden border-amber-200/10">
        {/* ambient gold glow, purely decorative */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(217,180,110,0.10),transparent_55%)]" />

        {/* Diary letterhead — always the elegant script, independent of the body style picked below */}
        <div className="relative flex flex-col items-center gap-1 text-center">
          <div className={cn(dancingScript.className, 'flex items-center gap-2 text-2xl text-amber-200/90')}>
            <BookOpenText className="h-5 w-5 text-amber-300/80" />
            My Diary
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-100/40">
            {now ? diaryStamp(now) : '\u00A0'}
          </p>
        </div>

        {/* Writing style selector */}
        <div className="relative flex flex-wrap items-center justify-center gap-1.5">
          {WRITING_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyleId(s.id)}
              aria-pressed={styleId === s.id}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                s.font.className,
                styleId === s.id
                  ? 'border-amber-300/60 bg-amber-300/10 text-amber-200'
                  : 'border-white/10 text-amber-100/40 hover:border-amber-300/30 hover:text-amber-100/70'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* The page itself */}
        <motion.div
          initial={reduceMotion ? false : { clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
          animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.15 }}
          className="relative overflow-hidden rounded-xl bg-[#f5ecd8] shadow-[0_20px_45px_-20px_rgba(0,0,0,0.65)]"
        >
          {/* paper grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
            style={{ backgroundImage: PAPER_GRAIN }}
          />
          {/* gentle vignette so the cream page still reads as "dark luxury", not a plain white box */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/[0.18]" />

          {/* ribbon bookmark tucked into the page */}
          <div className="pointer-events-none absolute -top-1 right-7 h-9 w-4 bg-gradient-to-b from-rose-800 to-rose-950 shadow-sm [clip-path:polygon(0_0,100%_0,100%_100%,50%_72%,0_100%)]" />

          {/* margin rule */}
          <div className="pointer-events-none absolute bottom-0 left-[52px] top-0 w-px bg-rose-700/30" />
          <div className="pointer-events-none absolute bottom-0 left-[54px] top-0 w-px bg-white/50" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.textarea
              key={styleId}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22 }}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={'Dear Diary,\nToday...'}
              className={cn(
                'relative min-h-[260px] w-full resize-y bg-transparent pb-6 pr-6 pt-5 text-[#3a2e1f] placeholder:text-[#3a2e1f]/40 focus-visible:outline-none',
                active.font.className,
                active.textSize
              )}
              style={{
                paddingLeft: 72,
                lineHeight: `${active.lineHeight}px`,
                backgroundAttachment: 'local',
                backgroundImage: `repeating-linear-gradient(transparent, transparent ${
                  active.lineHeight - 1
                }px, rgba(58,46,31,0.18) ${active.lineHeight - 1}px, rgba(58,46,31,0.18) ${active.lineHeight}px)`,
              }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Footer meta */}
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-xs text-amber-100/50">
          <span>Words: {wordCount}</span>
          <span>Reading Time: {readingTime} min</span>
          {typeof streak === 'number' && streak > 0 && (
            <span className="flex items-center gap-1 text-amber-300/80">
              <Flame className="h-3.5 w-3.5" /> {streak} day streak
            </span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}