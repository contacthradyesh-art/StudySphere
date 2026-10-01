'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, UserPlus, Radio } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { markCommunityNotificationRead, subscribeCommunityNotifications } from '@/lib/community/study-room-service';
import type { CommunityNotification } from '@/lib/firestore/community-schema';

export default function CommunityNotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CommunityNotification[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => { if (!user) return; return subscribeCommunityNotifications(user.uid, setItems); }, [user]);
  const icon = (type: CommunityNotification['type']) => type === 'roomInvite' ? <Radio className="h-4 w-4 text-primary"/> : <UserPlus className="h-4 w-4 text-primary"/>;
  return <div className="space-y-5">
    <div><p className="text-xs text-primary">Study Together</p><h1 className="text-2xl font-black">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Connections and study-room invitations.</p></div>
    <GlassCard>{items.length===0?<div className="py-10 text-center"><Bell className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-3 font-semibold">You’re all caught up</p></div>:<div className="space-y-2">{items.map(notification=><div key={notification.id} className={notification.read?'rounded-2xl border border-white/[0.05] p-3':'rounded-2xl border border-primary/20 bg-primary/5 p-3'}><div className="flex items-start gap-3">{icon(notification.type)}<div className="min-w-0 flex-1"><p className="text-sm font-semibold">{notification.title}</p><p className="mt-1 text-xs text-muted-foreground">{notification.body}</p>{notification.type==='roomInvite'&&notification.roomId&&<Link href={`/dashboard/community/${notification.roomId}`} className="mt-2 inline-block text-xs font-semibold text-primary">Open room →</Link>}</div>{!notification.read&&<button type="button" title="Mark read" onClick={()=>{if(user)void markCommunityNotificationRead(user.uid,notification.id);}} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5"><Check className="h-4 w-4"/></button>}</div></div>)}</div>}</GlassCard>
  </div>;
}