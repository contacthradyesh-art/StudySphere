'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BadgeCheck, BellRing, KeyRound, Palette, ShieldAlert, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { GlassCard } from '@/components/shared/glass-card';
import { useFocusShieldState } from '@/hooks/use-focus-shield-state';
import { getFocusSettings, saveFocusSettings } from '@/lib/pomodoro/session-service';
import { DEFAULT_FOCUS_SETTINGS, type FocusSettings } from '@/lib/firestore/pomodoro-schema';
import { buildBlockList, broadcastFocusStart, broadcastFocusStop } from '@/lib/focus/extension-contract';
import { useAuth } from '@/hooks/use-auth';
import {
  changePassword,
  deleteAccount,
  hasPasswordProvider,
  linkEmailPassword,
  isGoogleAccount,
  resendVerification,
  updateUserProfile
} from '@/lib/auth/service';
import {
  notificationsSupported,
  requestNotificationPermission
} from '@/lib/notifications/reminders';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  type ShieldSettings = Omit<FocusSettings, 'updatedAt'>;
  const [focusSettings, setFocusSettings] = useState<ShieldSettings>(DEFAULT_FOCUS_SETTINGS);
  const [savingFocus, setSavingFocus] = useState(false);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [nativePermission, setNativePermission] = useState<boolean | null>(null);
  const { active: focusActive, endsAt: focusEndsAt, startSession: startFocusSession, endSession: endFocusSession } = useFocusShieldState();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState('');
  const [linkingPassword, setLinkingPassword] = useState(false);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const googleAccount = isGoogleAccount();

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    if (user?.email) setPasswordEmail(user.email);
  }, [user]);

  useEffect(() => {
    setNotifPermission(notificationsSupported() ? Notification.permission : 'unsupported');
  }, []);

  useEffect(() => {
    if (!user) return;
    getFocusSettings(user.uid).then(setFocusSettings).catch(() => setFocusSettings(DEFAULT_FOCUS_SETTINGS));
  }, [user]);

  useEffect(() => {
    function checkPermission() {
      if (typeof window === 'undefined') return;
      const bridge = getNativeBridge();
      setNativePermission(bridge?.isPermissionGranted ? Boolean(bridge.isPermissionGranted()) : null);
    }
    checkPermission();
    document.addEventListener('visibilitychange', checkPermission);
    return () => document.removeEventListener('visibilitychange', checkPermission);
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

  if (!loading && !user) {
    router.replace('/login');
    return null;
  }

  async function saveProfile() {
    if (!displayName.trim()) return;
    setSavingProfile(true);
    try {
      await updateUserProfile(displayName.trim());
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function sendVerification() {
    try {
      await resendVerification();
      toast.success('Verification email sent — check your inbox');
    } catch {
      toast.error('Could not send verification email');
    }
  }

  async function submitPasswordChange() {
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setChangingPassword(false);
    }
  }

  function patchFocus(patch: Partial<ShieldSettings>) {
    setFocusSettings((current) => ({ ...current, ...patch }));
  }

  async function saveFocus() {
    if (!user) return;
    setSavingFocus(true);
    try {
      await saveFocusSettings(user.uid, focusSettings);
      toast.success('Focus Shield settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save Focus Shield settings');
    } finally {
      setSavingFocus(false);
    }
  }

  function activateFocusShield() {
    const bridge = getNativeBridge();
    if (bridge?.isPermissionGranted && !bridge.isPermissionGranted()) {
      toast.error('Permission required', { description: 'Allow StudySphere Accessibility access, then return here.' });
      bridge.openPermissionSettings?.();
      return;
    }
    const blockList = buildBlockList(focusSettings);
    const end = Date.now() + focusSettings.focusDurationMinutes * 60 * 1000;
    startFocusSession(focusSettings.focusDurationMinutes, blockList.length);
    bridge?.setShieldActive?.(true);
    broadcastFocusStart(blockList, end, focusSettings.disableNotifications);
    toast.success('Focus Shield activated');
  }

  function stopFocusShield() {
    endFocusSession();
    getNativeBridge()?.setShieldActive?.(false);
    broadcastFocusStop();
    toast.message('Focus Shield deactivated');
  }

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === 'granted') toast.success('Study reminders enabled');
    else if (result === 'denied') toast.error('Notifications blocked — enable them in your browser settings');
  }

  async function confirmDelete() {
    if (deleteConfirmText !== 'DELETE') return;
    if (!googleAccount && !deletePassword) {
      toast.error('Enter your password to confirm');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(googleAccount ? undefined : deletePassword);
      toast.success('Account deleted');
      router.replace('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete account');
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, security, and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><UserIcon className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Input value={user?.email ?? ''} disabled />
              {user?.emailVerified ? (
                <span className="flex items-center gap-1 whitespace-nowrap text-xs text-emerald-500">
                  <BadgeCheck className="h-4 w-4" /> Verified
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={sendVerification}>Verify</Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="gradient" size="sm" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/community/profile')}>Public study profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Focus Shield */}
      <GlassCard>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" /> Focus Shield</h2>
            <p className="mt-1 text-sm text-muted-foreground">Quick controls for distraction blocking and focus sessions.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/focus')}>Open full Focus Shield</Button>
        </div>
        {nativePermission === false && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="text-sm font-medium">Android protection permission required</p>
            <p className="mt-1 text-xs text-muted-foreground">Enable Accessibility access so StudySphere can block selected distraction apps during sessions.</p>
            <Button className="mt-3" variant="gradient" size="sm" onClick={() => getNativeBridge()?.openPermissionSettings?.()}>Grant permission</Button>
          </div>
        )}
        {!focusActive ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"><span>Block YouTube Shorts</span><input type="checkbox" checked={focusSettings.blockShorts} onChange={(e) => patchFocus({ blockShorts: e.target.checked })} /></label>
              <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"><span>Block Instagram Reels</span><input type="checkbox" checked={focusSettings.blockReels} onChange={(e) => patchFocus({ blockReels: e.target.checked })} /></label>
              <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"><span>Block Facebook Reels</span><input type="checkbox" checked={focusSettings.blockFacebookReels} onChange={(e) => patchFocus({ blockFacebookReels: e.target.checked })} /></label>
              <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"><span>Distraction-free mode</span><input type="checkbox" checked={focusSettings.distractionFreeMode} onChange={(e) => patchFocus({ distractionFreeMode: e.target.checked })} /></label>
              <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"><span>Disable study notifications</span><input type="checkbox" checked={focusSettings.disableNotifications} onChange={(e) => patchFocus({ disableNotifications: e.target.checked })} /></label>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm"><span className="shrink-0">Duration</span><input className="flex-1" type="range" min={5} max={120} step={5} value={focusSettings.focusDurationMinutes} onChange={(e) => patchFocus({ focusDurationMinutes: Number(e.target.value) })} /><span className="w-12 text-right font-semibold">{focusSettings.focusDurationMinutes}m</span></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => void saveFocus()} disabled={savingFocus}>{savingFocus ? 'Saving…' : 'Save Focus settings'}</Button>
              <Button variant="gradient" size="sm" onClick={activateFocusShield}><ShieldCheck className="h-4 w-4" /> Activate</Button>
            </div>
            <p className="text-xs text-muted-foreground">Browser extension: {extensionConnected ? 'connected' : 'not detected'} · Android protection: {nativePermission === true ? 'enabled' : nativePermission === false ? 'permission needed' : 'not available'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold">Focus Shield is active</p><p className="text-xs text-muted-foreground">Blocking {buildBlockList(focusSettings).length} pattern(s){focusEndsAt ? ` until ${new Date(focusEndsAt).toLocaleTimeString()}` : ''}.</p></div>
            <Button variant="destructive" size="sm" onClick={stopFocusShield}><ShieldAlert className="h-4 w-4" /> End Shield</Button>
          </div>
        )}
      </GlassCard>

      {/* Password */}
      {hasPasswordProvider() ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" /> Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button variant="gradient" size="sm" onClick={submitPasswordChange} disabled={changingPassword || !currentPassword || !newPassword}>
              {changingPassword ? 'Changing...' : 'Change password'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" /> Add password login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add an email and password so you can also sign in without Google or mobile OTP.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="passwordEmail">Login email</Label>
              <Input id="passwordEmail" type="email" value={passwordEmail} onChange={(e) => setPasswordEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <Button
              variant="gradient"
              size="sm"
              onClick={async () => {
                if (!passwordEmail.trim() || newPassword.length < 8) {
                  toast.error('Enter a valid email and a password of at least 8 characters');
                  return;
                }
                setLinkingPassword(true);
                try {
                  await linkEmailPassword(passwordEmail, newPassword);
                  setNewPassword('');
                  toast.success('Password login added');
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Could not add password login');
                } finally {
                  setLinkingPassword(false);
                }
              }}
              disabled={linkingPassword || !passwordEmail.trim() || !newPassword}
            >
              {linkingPassword ? 'Adding...' : 'Add password login'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><BellRing className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifPermission === 'unsupported' && (
            <p className="text-sm text-muted-foreground">Not supported in this browser.</p>
          )}
          {notifPermission === 'granted' && (
            <p className="text-sm text-emerald-500">Study reminders are enabled.</p>
          )}
          {notifPermission === 'denied' && (
            <p className="text-sm text-muted-foreground">Blocked — enable notifications for this site in your browser settings.</p>
          )}
          {notifPermission === 'default' && (
            <Button variant="outline" size="sm" onClick={enableNotifications}>Enable study reminders</Button>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive"><ShieldAlert className="h-4 w-4" /> Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all your data (study plans, journal, notes, mock test results, flashcards, and more). This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete my account</Button>
          ) : (
            <div className="space-y-3 rounded-md border border-destructive/40 p-4">
              {!googleAccount && (
                <div className="space-y-1.5">
                  <Label htmlFor="deletePassword">Confirm your password</Label>
                  <Input id="deletePassword" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                <Input id="deleteConfirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={confirmDelete}
                  disabled={deleting || deleteConfirmText !== 'DELETE' || (!googleAccount && !deletePassword)}
                >
                  {deleting ? 'Deleting...' : 'Permanently delete'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
