'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { BlockListEditor } from '@/components/focus/block-list-editor';
import { useAuth } from '@/hooks/use-auth';
import { useFocusShieldState } from '@/hooks/use-focus-shield-state';
import { getFocusSettings, saveFocusSettings } from '@/lib/pomodoro/session-service';
import { broadcastFocusStart, broadcastFocusStop, buildBlockList } from '@/lib/focus/extension-contract';
import { DEFAULT_FOCUS_SETTINGS, type FocusSettings } from '@/lib/firestore/pomodoro-schema';
import { cn } from '@/lib/utils';

type Settings = Omit<FocusSettings, 'updatedAt'>;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('h-6 w-11 rounded-full p-0.5 transition-colors', checked ? 'bg-gradient-brand' : 'bg-muted')}
        aria-pressed={checked}
      >
        <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', checked && 'translate-x-5')} />
      </button>
    </label>
  );
}

export default function FocusShieldPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_FOCUS_SETTINGS);
  const { active, endsAt, startSession, endSession } = useFocusShieldState();

  useEffect(() => {
    if (!user) return;
    getFocusSettings(user.uid).then(setSettings);
  }, [user]);

  function patch(p: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...p }));
  }

  async function persist() {
    if (!user) return;
    await saveFocusSettings(user.uid, settings);
    toast.success('Focus settings saved');
  }

  function activate() {
    const end = Date.now() + settings.focusDurationMinutes * 60 * 1000;
    startSession(settings.focusDurationMinutes, buildBlockList(settings).length);
    broadcastFocusStart(buildBlockList(settings), end);
    toast.success('Focus Shield activated');
  }

  function emergencyExit() {
    endSession();
    broadcastFocusStop();
    toast.message('Focus Shield deactivated');
  }

  return (
    <div className={cn('space-y-6 animate-fade-in', active && settings.distractionFreeMode && 'mx-auto max-w-2xl')}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Focus Shield</h1>
        <p className="text-sm text-muted-foreground">Block distractions and protect your focus sessions.</p>
      </div>

      {active ? (
        <GlassCard className="flex flex-col items-center gap-4 py-10 text-center">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <p className="text-lg font-semibold">Shield is active</p>
          <p className="text-sm text-muted-foreground">
            Blocking {buildBlockList(settings).length} pattern(s)
            {endsAt && ` until ${new Date(endsAt).toLocaleTimeString()}`}.
          </p>
          <Button variant="destructive" onClick={emergencyExit}>
            <ShieldOff className="h-4 w-4" /> Emergency exit
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-1">
            <h2 className="mb-2 font-semibold">Presets</h2>
            <Toggle label="Block YouTube Shorts" checked={settings.blockShorts} onChange={(v) => patch({ blockShorts: v })} />
            <Toggle label="Block Instagram Reels" checked={settings.blockReels} onChange={(v) => patch({ blockReels: v })} />
            <Toggle label="Block Facebook Reels" checked={settings.blockFacebookReels} onChange={(v) => patch({ blockFacebookReels: v })} />
            <Toggle label="Disable notifications" checked={settings.disableNotifications} onChange={(v) => patch({ disableNotifications: v })} />
            <Toggle label="Distraction-free mode" checked={settings.distractionFreeMode} onChange={(v) => patch({ distractionFreeMode: v })} />
          </GlassCard>

          <GlassCard className="space-y-4">
            <h2 className="font-semibold">Custom block list</h2>
            <BlockListEditor items={settings.customBlockList} onChange={(customBlockList) => patch({ customBlockList })} />
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Duration</label>
              <input
                type="range" min={5} max={120} step={5} value={settings.focusDurationMinutes}
                onChange={(e) => patch({ focusDurationMinutes: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-semibold">{settings.focusDurationMinutes}m</span>
            </div>
          </GlassCard>
        </div>
      )}

      {!active && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={persist}>Save settings</Button>
          <Button variant="gradient" onClick={activate}><ShieldCheck className="h-4 w-4" /> Activate Focus Shield</Button>
        </div>
      )}

      <GlassCard>
        <h2 className="mb-1 font-semibold">Browser extension</h2>
        <p className="text-sm text-muted-foreground">
          Website blocking at the network level is enforced by the companion extension, which listens on the
          <code> studysphere-focus </code> channel. The app broadcasts the active block list on activation; see
          <code> src/lib/focus/extension-contract.ts</code>.
        </p>
      </GlassCard>
    </div>
  );
}