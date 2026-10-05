'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Bug, ChevronDown, ChevronUp, Plus, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { BlockListEditor } from '@/components/focus/block-list-editor';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { useFocusShieldState } from '@/hooks/use-focus-shield-state';
import { getFocusSettings, saveFocusSettings } from '@/lib/pomodoro/session-service';
import { broadcastFocusStart, broadcastFocusStop, buildBlockList } from '@/lib/focus/extension-contract';
import { DEFAULT_FOCUS_SETTINGS, type FocusSettings } from '@/lib/firestore/pomodoro-schema';
import {
  FOCUS_APPS,
  getShieldBridge,
  packagesForSettings,
  startNativeShield,
  stopNativeShield,
  supportsYoutubeStudyMode
} from '@/lib/focus/native-shield';
import { cn } from '@/lib/utils';

type Settings = Omit<FocusSettings, 'updatedAt'>;
const getNativeBridge = getShieldBridge;

const QUICK_YOUTUBE_CHANNELS = ['Physics Wallah', 'StudyIQ', 'Adda247', 'Khan Academy'];

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

function YoutubeRadio({
  checked,
  title,
  description,
  onChange
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <label className={cn(
      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
      checked ? 'border-primary/50 bg-primary/5' : 'border-border/60 hover:bg-muted/40'
    )}>
      <input
        type="radio"
        name="youtubeMode"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

export default function FocusShieldPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_FOCUS_SETTINGS);
  const { active, endsAt, startSession, endSession } = useFocusShieldState();
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [nativePermission, setNativePermission] = useState<boolean | null>(null);
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [bridgeVersion, setBridgeVersion] = useState<number | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [studyDisclosureOpen, setStudyDisclosureOpen] = useState(false);
  const [channelInput, setChannelInput] = useState('');
  const [debugOpen, setDebugOpen] = useState(false);
  const [youtubeDebug, setYoutubeDebug] = useState<unknown[]>([]);
  const wasActive = useRef(active);

  const checkNativePermission = () => {
    const bridge = getNativeBridge();
    if (!bridge?.isPermissionGranted) {
      setNativePermission(null);
      return;
    }
    setNativePermission(Boolean(bridge.isPermissionGranted()));
  };

  useEffect(() => {
    if (!user) return;
    getFocusSettings(user.uid)
      .then(setSettings)
      .catch(() => undefined)
      .finally(() => setSettingsLoaded(true));
  }, [user]);

  useEffect(() => {
    const bridge = getNativeBridge();
    setIsAndroidApp(Boolean(bridge));
    if (!bridge?.getBridgeVersion) {
      setBridgeVersion(null);
      return;
    }
    try {
      const version = Number(bridge.getBridgeVersion());
      setBridgeVersion(Number.isFinite(version) ? version : null);
    } catch {
      setBridgeVersion(null);
    }
  }, []);

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
    window.postMessage({ channel: 'studysphere-focus', type: 'EXTENSION_PING' }, window.location.origin);
    const retry = window.setTimeout(() => {
      window.postMessage({ channel: 'studysphere-focus', type: 'EXTENSION_PING' }, window.location.origin);
    }, 250);
    return () => {
      window.clearTimeout(retry);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    if (wasActive.current && !active) {
      broadcastFocusStop();
      stopNativeShield();
    }
    wasActive.current = active;
  }, [active]);

  // Keep the Android side in sync (e.g. the app was reopened mid-session).
  useEffect(() => {
    if (active && endsAt && settingsLoaded) {
      if (settings.youtubeMode === 'study' && getNativeBridge() && !supportsYoutubeStudyMode()) {
        toast.warning('Study mode ke liye APK update karein');
      }
      startNativeShield(endsAt, settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, endsAt, settingsLoaded]);

  useEffect(() => {
    if (settings.youtubeMode !== 'study' || !debugOpen) return;
    const bridge = getNativeBridge();
    if (!bridge?.getYoutubeDebug) {
      setYoutubeDebug([]);
      return;
    }

    const readDebug = () => {
      try {
        const raw = bridge.getYoutubeDebug?.();
        const parsed = raw ? JSON.parse(raw) : [];
        setYoutubeDebug(Array.isArray(parsed) ? parsed.slice(-20) : []);
      } catch {
        setYoutubeDebug([]);
      }
    };

    readDebug();
    const interval = window.setInterval(readDebug, 1500);
    return () => window.clearInterval(interval);
  }, [settings.youtubeMode, debugOpen]);

  function patch(p: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...p }));
  }

  function addStudyChannel(value: string) {
    const channel = value.trim();
    if (!channel) return;
    if (channel.length > 60) {
      toast.error('Channel name max 60 characters / चैनल नाम अधिकतम 60 अक्षर');
      return;
    }
    if (settings.studyChannels.length >= 30) {
      toast.error('Maximum 30 study channels / अधिकतम 30 चैनल');
      return;
    }
    if (settings.studyChannels.some((item) => item.trim().toLowerCase() === channel.toLowerCase())) {
      toast.message('Channel already added / चैनल पहले से जुड़ा है');
      return;
    }
    patch({ studyChannels: [...settings.studyChannels, channel] });
    setChannelInput('');
  }

  function removeStudyChannel(index: number) {
    patch({ studyChannels: settings.studyChannels.filter((_, i) => i !== index) });
  }

  async function persist() {
    if (!requireAuth(user)) return;
    try {
      await saveFocusSettings(user.uid, settings);
      toast.success('Focus settings saved / फोकस सेटिंग्स सेव हो गईं');
    } catch {
      toast.error('Could not save Focus settings / फोकस सेटिंग्स सेव नहीं हुईं');
    }
  }

  function activate() {
    const bridge = getNativeBridge();
    if (bridge?.isPermissionGranted && !bridge.isPermissionGranted()) {
      toast.error('Permission required / परमिशन चाहिए', { description: 'Allow StudySphere in Accessibility settings, then return here. / Accessibility में StudySphere की अनुमति दें।' });
      bridge.openPermissionSettings?.();
      return;
    }

    if (settings.youtubeMode === 'study' && bridge && !supportsYoutubeStudyMode()) {
      toast.warning('Study mode ke liye APK update karein');
    }

    const blockList = buildBlockList(settings);
    const packages = packagesForSettings(settings);
    const legacyStudyFallback = settings.youtubeMode === 'study' && bridge && !supportsYoutubeStudyMode();
    const effectivePackages = legacyStudyFallback
      ? packagesForSettings({ ...settings, youtubeMode: 'block' })
      : packages;

    const youtubeStudyOnly = settings.youtubeMode === 'study' && Boolean(bridge) && !legacyStudyFallback;
    if (blockList.length === 0 && effectivePackages.length === 0 && !youtubeStudyOnly) {
      toast.error('Select at least one app or site to block / कम से कम एक ऐप या साइट चुनें');
      return;
    }

    const end = Date.now() + settings.focusDurationMinutes * 60 * 1000;
    if (bridge && (effectivePackages.length > 0 || youtubeStudyOnly) && !startNativeShield(
      end,
      settings,
      () => toast.warning('Study mode ke liye APK update karein')
    )) {
      toast.error('Android shield could not start / Android shield शुरू नहीं हो पाया');
      return;
    }
    const protectedCount = blockList.length + effectivePackages.length + (youtubeStudyOnly ? 1 : 0);
    startSession(settings.focusDurationMinutes, protectedCount);
    broadcastFocusStart(blockList, end, settings.disableNotifications);
    toast.success('Focus Shield activated / फोकस शील्ड चालू');
  }

  function emergencyExit() {
    endSession();
    stopNativeShield();
    broadcastFocusStop();
    toast.message('Focus Shield deactivated / फोकस शील्ड बंद');
  }

  return (
    <div className={cn('space-y-6 animate-fade-in', active && settings.distractionFreeMode && 'mx-auto max-w-2xl')}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Focus Shield</h1>
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
            bridgeVersion !== null && bridgeVersion >= 4
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
          )}>
            {bridgeVersion === null ? (
              'APK update chahiye'
            ) : (
              <>
                APK bridge v{bridgeVersion}
                {bridgeVersion >= 4 && <span aria-label="Study mode ready">✓ Study mode ready</span>}
              </>
            )}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Distractions block करें और focus session protect करें. / पढ़ाई के दौरान ध्यान बनाए रखें।</p>
      </div>

      {nativePermission === false && (
        <GlassCard className="border-primary/30 bg-primary/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Android protection permission required / Android परमिशन चाहिए</p>
              <p className="text-sm text-muted-foreground">Allow StudySphere Accessibility access to protect selected distraction apps during Focus Shield sessions.</p>
            </div>
            <Button variant="gradient" onClick={() => getNativeBridge()?.openPermissionSettings?.()}>Grant permission</Button>
          </div>
        </GlassCard>
      )}

      {active ? (
        <GlassCard className="flex flex-col items-center gap-4 py-10 text-center">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <p className="text-lg font-semibold">Shield is active / शील्ड चालू है</p>
          <p className="text-sm text-muted-foreground">Blocking {buildBlockList(settings).length + packagesForSettings(settings).length} item(s){endsAt && ` until ${new Date(endsAt).toLocaleTimeString()}`}.</p>
          <Button variant="destructive" onClick={emergencyExit}><ShieldOff className="h-4 w-4" /> Emergency exit / बंद करें</Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-4">
            <div>
              <h2 className="font-semibold">YouTube</h2>
              <p className="text-xs text-muted-foreground">Focus session में YouTube कैसे handle हो / चुनें कि YouTube पूरा बंद हो या study-only रहे।</p>
            </div>

            <div className="space-y-2">
              <YoutubeRadio
                checked={settings.youtubeMode === 'block'}
                title="YouTube poora block / पूरा बंद"
                description="Current behavior: Focus session में पूरा YouTube बंद रहेगा।"
                onChange={() => {
                  setStudyDisclosureOpen(false);
                  patch({ youtubeMode: 'block' });
                }}
              />
              <YoutubeRadio
                checked={settings.youtubeMode === 'study'}
                title="Study YouTube / सिर्फ पढ़ाई वाले चैनल (Shorts बंद)"
                description="Shorts बंद रहेंगे और केवल आपकी study channel list वाले channels चलेंगे।"
                onChange={() => {
                  if (settings.youtubeMode !== 'study') setStudyDisclosureOpen(true);
                }}
              />
            </div>

            {studyDisclosureOpen && settings.youtubeMode !== 'study' && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm font-medium">छोटा disclosure / एक जरूरी बात</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Is mode mein StudySphere sirf focus session ke dauraan YouTube ki screen padhta hai. Kuch save ya send nahi hota.
                  <br />
                  इस मोड में StudySphere केवल फोकस सेशन के दौरान YouTube की स्क्रीन पढ़ता है। कुछ सेव या भेजा नहीं जाता।
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="gradient" onClick={() => {
                    patch({ youtubeMode: 'study' });
                    setStudyDisclosureOpen(false);
                  }}>Continue / चालू करें</Button>
                  <Button size="sm" variant="outline" onClick={() => setStudyDisclosureOpen(false)}>Cancel / रद्द</Button>
                </div>
              </div>
            )}

            {settings.youtubeMode === 'study' && (
              <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div>
                  <p className="text-sm font-semibold">Study channel list / स्टडी चैनल लिस्ट</p>
                  <p className="mt-1 text-xs text-muted-foreground">सिर्फ इन्हीं channels को YouTube watch page पर allow किया जाएगा।</p>
                </div>

                <div className="flex gap-2">
                  <input
                    value={channelInput}
                    maxLength={60}
                    onChange={(e) => setChannelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addStudyChannel(channelInput);
                      }
                    }}
                    placeholder="Channel name / चैनल नाम"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
                  />
                  <Button type="button" variant="outline" onClick={() => addStudyChannel(channelInput)} disabled={!channelInput.trim()}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add / जल्दी जोड़ें</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_YOUTUBE_CHANNELS.map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => addStudyChannel(channel)}
                        className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                      >
                        + {channel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings.studyChannels.map((channel, index) => (
                    <span key={`${channel}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs text-primary">
                      {channel}
                      <button type="button" onClick={() => removeStudyChannel(index)} className="rounded-full p-0.5 hover:bg-primary/15" aria-label={`Remove ${channel}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {settings.studyChannels.length === 0 && (
                    <p className="text-xs text-muted-foreground">Abhi koi channel nahi hai / अभी कोई चैनल नहीं जोड़ा गया।</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">Channel ka naam YouTube par jaisa dikhta hai waisa likhein.</p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="space-y-1">
            <h2 className="mb-2 font-semibold">Presets</h2>
            <Toggle label="Block Instagram Reels / रील्स बंद" checked={settings.blockReels} onChange={(v) => patch({ blockReels: v })} />
            <Toggle label="Block Facebook Reels / रील्स बंद" checked={settings.blockFacebookReels} onChange={(v) => patch({ blockFacebookReels: v })} />
            <Toggle label="Disable notifications / नोटिफिकेशन बंद" checked={settings.disableNotifications} onChange={(v) => patch({ disableNotifications: v })} />
            <Toggle label="Distraction-free mode / distraction-free" checked={settings.distractionFreeMode} onChange={(v) => patch({ distractionFreeMode: v })} />
          </GlassCard>

          {isAndroidApp && (
            <GlassCard className="space-y-1 lg:col-span-2">
              <h2 className="mb-1 font-semibold">Apps to block / ब्लॉक करने वाले ऐप्स</h2>
              <p className="mb-2 text-xs text-muted-foreground">YouTube ऊपर अलग mode से controlled है. बाकी selected apps Focus Shield session में पूरे block होंगे।</p>
              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {FOCUS_APPS.filter((app) => app.id !== 'youtube').map((app) => (
                  <Toggle
                    key={app.id}
                    label={`${app.label} / ${app.labelHi}`}
                    checked={packagesForSettings(settings).includes(app.packageName)}
                    onChange={(v) => {
                      const current = new Set(settings.blockedApps ?? []);
                      if (v) current.add(app.id); else current.delete(app.id);
                      const presetOff: Partial<Settings> = {};
                      if (!v && app.id === 'instagram') presetOff.blockReels = false;
                      if (!v && app.id === 'facebook') presetOff.blockFacebookReels = false;
                      patch({ blockedApps: Array.from(current), ...presetOff });
                    }}
                  />
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="space-y-4">
            <h2 className="font-semibold">Custom block list / कस्टम ब्लॉक लिस्ट</h2>
            <BlockListEditor items={settings.customBlockList} onChange={(customBlockList) => patch({ customBlockList })} />
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Duration / अवधि</label>
              <input type="range" min={5} max={120} step={5} value={settings.focusDurationMinutes} onChange={(e) => patch({ focusDurationMinutes: Number(e.target.value) })} className="flex-1" />
              <span className="w-12 text-right text-sm font-semibold">{settings.focusDurationMinutes}m</span>
            </div>
          </GlassCard>
        </div>
      )}

      {!active && (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={persist}>Save settings / सेव करें</Button>
          <Button variant="gradient" onClick={activate}><ShieldCheck className="h-4 w-4" /> Activate Focus Shield / चालू करें</Button>
        </div>
      )}

      {settings.youtubeMode === 'study' && (
        <GlassCard>
          <button
            type="button"
            onClick={() => setDebugOpen((open) => !open)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={debugOpen}
          >
            <span className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-primary" />
              <span className="font-semibold">YouTube detection debug</span>
            </span>
            {debugOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {debugOpen && (
            <div className="mt-3">
              {!isAndroidApp ? (
                <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Debug data is available in the Android APK only. / Debug data केवल Android APK में उपलब्ध है।</p>
              ) : (
                <pre className="max-h-72 overflow-auto rounded-xl bg-black/70 p-3 text-[11px] leading-5 text-emerald-300">
                  {JSON.stringify(youtubeDebug.slice(-20), null, 2)}
                </pre>
              )}
            </div>
          )}
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">Browser extension</h2>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', extensionConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
            {extensionConnected ? '● Extension connected' : '○ Extension not detected'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Website blocking is enforced by the companion extension. Android APK selected apps के लिए native Accessibility protection देता है।</p>
      </GlassCard>
    </div>
  );
}
