'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BadgeCheck, BellRing, KeyRound, Palette, ShieldAlert, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import {
  changePassword,
  deleteAccount,
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const googleAccount = isGoogleAccount();

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  useEffect(() => {
    setNotifPermission(notificationsSupported() ? Notification.permission : 'unsupported');
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
          <Button variant="gradient" size="sm" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      {!googleAccount && (
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
