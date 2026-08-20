import { toast } from 'sonner';
import type { User } from 'firebase/auth'; // ya jo bhi type aapke useAuth se aata hai

export function requireAuth(user: User | null | undefined): user is User {
  if (!user) {
    toast.error('Please log in again');
    return false;
  }
  return true;
}