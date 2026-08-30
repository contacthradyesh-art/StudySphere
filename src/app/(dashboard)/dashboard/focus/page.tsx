'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { BlockListEditor } from '@/components/focus/block-list-editor';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useFocusShieldState } from '@/hooks/use-focus-shield-state';
import { getFocusSettings, saveFocusSettings } from '@/lib/pomodoro/session-service';
import { broadcastFocusStart, broadcastFocusStop, buildBlockList } from '@/lib/focus/extension-contract';
import { DEFAULT_FOCUS_SETTINGS, type FocusSettings } from '@/lib/firestore/pomodoro-schema';
import { cn } from '@/lib/utils';

type NativeReminderBridge = {
  isPermissionGranted: () => boolean;
  openPermissionSettings: () => void;
  setShieldActive: (active: boolean) => void;
};

function getNativeBridge(): NativeReminderBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  const bridge = (window as Window & { StudySphereFocusShield?: NativeReminderBridge }).StudySphereFocusShield;
  return bridge;
}

type Settings = Omit<FocusSettings, 'updatedAt'>;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={cn('h-6 w-11 rounded-full p-0.5 transition-colors', checked ? 'bg-gradient-brand' : 'bg-muted')} aria-pressed={checked}>
        <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', checked && 'translate-x-5')} />
      </button>
    </label>
  );
}

export default function FocusShieldPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_FOCUS_SETTINGS);
  const { active, endsAt, startSession, endSession } = useFocusShieldState();
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [nativePermission, setNativePermission] = useState<boolean | null>(null);
  const wasActive = useRef(active);

  const checkNativePermission = () => {
    const bridge = getNativeBridge();
    setNativePermission(bridge ? Boolean(bridge.isPermissionGranted()) : null);
  };

  useEffect(() => {
    if (!user) return;
    getFocusSettings(user.uid).then(setSettings);
  }, [user]);

  useEffect(() => {
    checkNativePermission();
    const onVisible = () => checkNativePermission();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.data?.channel === 'studysphere-focus' && event.data?.type === 'EXTENSION_READY') setExtensionConnected(true);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const bridge = getNativeBridge();
    if (wasActive.current && !active) {
      broadcastFocusStop();
      bridge?.setShieldActive(false);
    }
    if (active) bridge?.setShieldActive(true);
    wasActive.current = active;
  }, [active]);

  function patch(p: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...p }));
  }

  async function persist() {
    if (!requireAuth(user)) return;
    await saveFocusSettings(user.uid, settings);
    toast.success('Focus settings saved');
  }

  function activate() {
    const bridge = getNativeBridge();
    if (bridge && !bridge.isPermissionGranted()) {
      toast.error('Permission required', { description: 'Allow StudySphere in Accessibility settings, then return here.' });
      bridge.openPermissionSettings();
      return;
    }

    const end = Date.now() + settings.focusDurationMinutes * 60 * 1000;
    startSession(settings.focusDurationMinutes, buildBlockList(settings).length);
    bridge?.setShieldActive(true);
    broadcastFocusStart(buildBlockList(settings), end, settings.disableNotifications);
    toast.success('Focus Shield activated');
  }

  function emergencyExit() {
    endSession();
    getNativeBridge()?.setShieldActive(false);
    broadcastFocusStop();
    toast.message('Focus Shield deactivated');
  }

  return (
    <div className={cn('space-y-6 animate-fade-in', active && settings.distractionFreeMode && 'mx-auto max-w-2xl')}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Focus Shield</h1>
        <p className="text-sm text-muted-foreground">Block distractions and protect your focus sessions.</p>
      </div>

      {nativePermission === false && (
        <GlassCard className="border-primary/30 bg-primary/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Android protection permission required</p>
              <p className="text-sm text-muted-foreground">Allow StudySphere Accessibility access to block selected distraction apps during Focus Shield sessions.</p>
            </div>
            <Button variant="gradient" onClick={() => getNativeBridge()?.openPermissionSettings()}>Grant permission</Button>
          </div>
        </GlassCard>
      )}

      {active ? (
        <GlassCard className="flex flex-col items-center gap-4 py-10 text-center">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <p className="text-lg font-semibold">Shield is active</p>
          <p className="text-sm text-muted-foreground">Blocking {buildBlockList(settings).length} pattern(s){endsAt && ` until ${new Date(endsAt).toLocaleTimeString()}`}.</p>
          <Button variant="destructive" onClick={emergencyExit}><ShieldOff className="h-4 w-4" /> Emergency exit</Button>
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
              <input type="range" min={5} max={120} step={5} value={settings.focusDurationMinutes} onChange={(e) => patch({ focusDurationMinutes: Number(e.target.value) })} className="flex-1" />
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
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">Browser extension</h2>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', extensionConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
            {extensionConnected ? '● Extension connected' : '○ Extension not detected'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Website blocking is enforced by the companion extension. The Android app now also provides native Accessibility protection for selected distraction apps.</p>
      </GlassCard>
    </div>
  );
}
