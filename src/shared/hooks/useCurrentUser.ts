import { useAuth } from '@/shared/hooks/useAuth';

export function useCurrentUser() {
  const { user } = useAuth();
  const currentUser = user?.account_type;

  return {
    userPath:
      currentUser === 'buyer' ? '/dashboard/buyer' : '/dashboard/seller',
    currentUser,
  };
}
