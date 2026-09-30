'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, UserPlus, Radio } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { useAuth } from '@/hooks/use-auth';
import { markCommunityNotificationRead, subscribeCommunityNotifications } from '@/lib/community/study-room-service';
import type { CommunityNotification } from '@/lib/firestore/community-schema';

export default function CommunityNotificationsPage(){
  const {user}=useAuth(); const [items,setItems]=useState<CommunityNotification[]>([]);
  useEffect(()=>{if(!user)return subscribeCommunityNotifications(user.uid,setItems);},[user]);
  const icon=(type:CommunityNotification['type'])=>type==='roomInvite'?<Radio className="h-4 w-4 text-primary"/>:<UserPlus className="h-4 w-4 text-primary"/>;
  return <div className="space-y-5"><div><p className="text-xs text-primary">Study Together</p><h1 className="text-2xl font-black">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Connections and study-room invitations.</p></div>
    <GlassCard>{items.length===0?<div className="py-10 text-center"><Bell className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-3 font-semibold">You’re all caught up</p></div>:<div className="space-y-2">{items.map(n=><div key={n.id} className={n.read?'rounded-2xl border border-white/[0.05] p-3':'rounded-2xl border border-primary/20 bg-primary/5 p-3'}><div className="flex items-start gap-3">{icon(n.type)}<div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="mt-1 text-xs text-muted-foreground">{n.body}</p>{n.type==='roomInvite'&&n.roomId&&<Link href={`/dashboard/community/${n.roomId}`} className="mt-2 inline-block text-xs font-semibold text-primary">Open room →</Link>}</div>{!n.read&&<button title="Mark read" onClick={()=>user&&void markCommunityNotificationRead(user.uid,n.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5"><Check className="h-4 w-4"/></button>}</div></div>)}</div>}</GlassCard>
  </div>;
}
