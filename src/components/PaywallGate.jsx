import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Wrap any page/section in <PaywallGate> to restrict it to paid users.
 * Free users see an upgrade prompt instead of the children.
 */
export default function PaywallGate({ children, feature = 'this feature' }) {
  const { isPaid, isLoading } = useSubscription();

  if (isLoading) return null;
  if (isPaid) return children;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-heading font-bold mb-3">Premium feature</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        {feature} is available on the Js-Grw-Up Premium plan. Upgrade for just <strong className="text-foreground">£5/month</strong> to unlock everything.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="gap-2">
          <Link to="/subscribe">
            <Sparkles className="h-4 w-4" /> Upgrade to Premium
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-6">Cancel anytime. No hidden fees.</p>
    </div>
  );
}
