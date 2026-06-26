import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

/**
 * Returns { isPaid, isLoading }
 * isPaid = true  → user or their linked partner has an active subscription
 * isPaid = false → user is on the free tier
 */
export function useSubscription() {
  const { profile, isLoadingAuth } = useAuth();

  const { data: partnerProfile, isLoading: partnerLoading } = useQuery({
    queryKey: ['partner-profile', profile?.partnerId],
    queryFn: async () => {
      const snap = await getDoc(doc(firestore, 'users', profile.partnerId));
      return snap.exists() ? snap.data() : null;
    },
    enabled: !!profile?.partnerId,
    staleTime: 5 * 60 * 1000,
  });

  const isPaid = profile?.isAdmin === true
    || profile?.subscriptionStatus === 'active'
    || partnerProfile?.isAdmin === true
    || partnerProfile?.subscriptionStatus === 'active';

  return { isPaid, isAdmin: profile?.isAdmin === true, isLoading: isLoadingAuth || (!!profile?.partnerId && partnerLoading) };
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
