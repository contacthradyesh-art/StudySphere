'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { findMyRooms, listFollowing, sendRoomInvite } from '@/lib/community/study-room-service';
import type { CommunityProfile } from '@/lib/firestore/community-schema';

type RoomSummary = {
  id: string;
  name: string;
  exam?: string | null;
};

export default function FollowingPage() {
  const { user } = useAuth();
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    if (!user) return;
    listFollowing(user.uid).then(setPeople).catch(() => setPeople([]));
    findMyRooms(user.uid).then(setRooms).catch(() => setRooms([]));
  }, [user]);

  async function invite(uid: string) {
    if (!user) return;
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;
    try {
      await sendRoomInvite(
        {
          uid: user.uid,
          displayName: user.displayName || 'Student',
          photoURL: user.photoURL || null,
          state: null,
          exam: room.exam || null,
          subjects: [],
          isOnline: true,
          lastSeenAt: null,
        },
        uid,
        room.id,
        room.name,
      );
      toast.success('Invitation sent');
    } catch {
      toast.error('Could not send invitation');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-primary">Study Together / Connections</p>
        <h1 className="text-2xl font-black">My study connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Students you chose to keep connected with.
        </p>
      </div>

      {people.length > 0 && (
        <GlassCard>
          <div className="flex flex-wrap items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Invite a connection to your room</span>
            <select
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className="h-9 min-w-48 rounded-lg border border-input bg-background/60 px-2 text-xs"
            >
              <option value="">Choose your room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
        </GlassCard>
      )}

      {people.length === 0 ? (
        <GlassCard>
          <UserPlus className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold">No connections yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Join a room and connect with students preparing for the same exam.
          </p>
          <Link
            href="/dashboard/community"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            Find students <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {people.map((person) => (
            <GlassCard key={person.uid}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-brand font-bold text-white">
                  {(person.displayName?.[0] || 'S').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{person.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.exam || 'Student'} · {person.state || 'India'}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {person.bio || 'Focused student on StudySphere.'}
              </p>
              {roomId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => void invite(person.uid)}
                >
                  <Send className="h-3.5 w-3.5" />
                  Invite to room
                </Button>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
