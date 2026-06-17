import { useAuth } from '@/lib/AuthContext';

/**
 * Returns { isPaid, isLoading }
 * isPaid = true  → user has an active subscription
 * isPaid = false → user is on the free tier
 */
export function useSubscription() {
  const { profile, isLoadingAuth } = useAuth();
  const isPaid = profile?.isAdmin === true || profile?.subscriptionStatus === 'active';
  return { isPaid, isAdmin: profile?.isAdmin === true, isLoading: isLoadingAuth };
}

/** Paid-only features — used for paywall checks */
export const PAID_FEATURES = [
  'incidents',
  'progress',
  'finances',
  'receipts',
  'daily-log',
  'rules',
  'export',
  'google-calendar',
];
