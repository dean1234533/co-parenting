import { Link } from 'react-router-dom';
import { MessageCircle, CalendarDays, FileText, ShieldCheck, Receipt, BookOpen, ChevronRight, Heart, Lock, Users, Check, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';

const features = [
  { icon: MessageCircle, title: 'Private Messaging', desc: 'A dedicated chat channel just for co-parenting — separate from personal texts so nothing gets missed.' },
  { icon: CalendarDays, title: 'Shared Calendar', desc: 'Pickups, drop-offs, school events and holidays in one shared view. Sync directly to Google Calendar.' },
  { icon: FileText, title: 'Incident Reports', desc: 'Log and date-stamp incidents with supporting notes. Exportable to PDF for legal use.' },
  { icon: Receipt, title: 'Expense Tracking', desc: 'Record shared costs, upload receipts and maintain a clear financial record for both parents.' },
  { icon: BookOpen, title: 'Daily Logs', desc: 'Keep daily notes on meals, mood, behaviour and milestones — always on record.' },
  { icon: ShieldCheck, title: 'Co-Parenting Rules', desc: 'Set agreed rules and reference them any time. Requests can only be denied with a valid written reason.' },
];

const freePlan = [
  'Private messaging',
  'Shared calendar',
  'Requests & approvals',
  'Link with your co-parent',
];

const paidPlan = [
  'Everything in Free',
  'Incident reports (court-ready)',
  'Expense tracking & receipts',
  'Daily logs',
  'Progress tracking',
  'Co-parenting rules',
  'Export full PDF archive',
  'Google Calendar sync',
  'Priority support',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        path="/"
        title="Co-parenting App for Separated Parents"
        description="Js-Grw-Up is the private co-parenting app for separated parents. Shared calendar, safe messaging, incident reports, expense tracking and court-ready PDF export. Free to start."
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-96x96.png" alt="Js-Grw-Up" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-heading font-bold text-primary">Js-Grw-Up</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
          <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <img src="/icons/icon-192x192.png" alt="Js-Grw-Up" className="w-24 h-24 rounded-2xl mx-auto mb-8 shadow-lg" />
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Heart className="h-3.5 w-3.5" /> Built for the kids
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
          Co-parenting made<br />
          <span className="text-primary">calmer and clearer</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Js-Grw-Up is a private platform for separated parents to communicate, coordinate and keep records — all in one place, away from personal social media.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            Create free account <ChevronRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="border border-border px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-muted transition-colors text-center">
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-heading font-bold text-center mb-3">Everything you need in one app</h2>
        <p className="text-muted-foreground text-center mb-12">Designed specifically for co-parents — not a generic messaging app adapted for parenting.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-heading font-bold text-center mb-3">Simple, honest pricing</h2>
          <p className="text-muted-foreground text-center mb-12">Start free. Upgrade when you need more. Cancel any time.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold mb-1">Free</h3>
              <div className="text-4xl font-bold mb-6">£0<span className="text-base font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                {freePlan.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center border border-border px-6 py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors">
                Get started free
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-card border-2 border-primary rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Most popular
              </div>
              <h3 className="text-xl font-heading font-bold mb-1">Premium</h3>
              <div className="text-4xl font-bold mb-6">£5<span className="text-base font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                {paidPlan.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                Start free, upgrade later
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-3">No credit card needed to start</p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <Lock className="h-6 w-6 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-1">Private &amp; secure</h4>
            <p className="text-sm text-muted-foreground">Your data is encrypted and never shared. Only you and your linked co-parent can see your records.</p>
          </div>
          <div>
            <Users className="h-6 w-6 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-1">Two accounts, one view</h4>
            <p className="text-sm text-muted-foreground">Link accounts with a simple invite link. Both parents see the same calendar, messages and logs in real time.</p>
          </div>
          <div>
            <FileText className="h-6 w-6 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-1">Court-ready records</h4>
            <p className="text-sm text-muted-foreground">Export a full PDF archive of all your records at any time — timestamped and formatted for legal use.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8">Free to use. No credit card required.</p>
        <Link to="/register" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          Create your free account <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Js-Grw-Up. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
