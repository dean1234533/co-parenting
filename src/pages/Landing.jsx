import { Link } from 'react-router-dom';
import { MessageCircle, CalendarDays, FileText, ShieldCheck, Receipt, BookOpen, ChevronRight, Heart, Lock, Users, Check, Sparkles, Star } from 'lucide-react';
import SEO from '@/components/SEO';

const features = [
  { icon: MessageCircle, title: 'Private Messaging', desc: 'A dedicated chat channel just for co-parenting — separate from personal texts so nothing gets missed.', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800' },
  { icon: CalendarDays, title: 'Shared Calendar', desc: 'Pickups, drop-offs, school events and holidays in one shared view. Sync directly to Google Calendar.', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  { icon: FileText, title: 'Incident Reports', desc: 'Log and date-stamp incidents with supporting notes. Exportable to PDF for legal use.', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800' },
  { icon: Receipt, title: 'Expense Tracking', desc: 'Record shared costs, upload receipts and maintain a clear financial record for both parents.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  { icon: BookOpen, title: 'Daily Logs', desc: 'Keep daily notes on meals, mood, behaviour and milestones — always on record.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800' },
  { icon: ShieldCheck, title: 'Co-Parenting Rules', desc: 'Set agreed rules and reference them any time. Requests can only be denied with a valid written reason.', color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800' },
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

const stats = [
  { value: '100%', label: 'Private & encrypted' },
  { value: 'Free', label: 'To get started' },
  { value: '24/7', label: 'Always available' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEO
        path="/"
        title="Co-parenting App for Separated Parents"
        description="Js-Grw-Up is the private co-parenting app for separated parents. Shared calendar, safe messaging, incident reports, expense tracking and court-ready PDF export. Free to start."
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 shadow-lg shadow-violet-900/30 border-b-2 border-white/40">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-96x96.png" alt="Js-Grw-Up" className="w-9 h-9 rounded-xl ring-2 ring-white border-2 border-white bg-white shadow-md object-cover" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-heading font-black text-white tracking-wide uppercase">Js-Grw-Up</span>
              <span className="text-[10px] text-white/60 font-medium tracking-widest uppercase">Co‑Parenting App</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/80 hover:text-white font-medium transition-colors px-3 py-1.5">Log in</Link>
            <Link to="/register" className="text-sm bg-white text-violet-700 px-4 py-2 rounded-xl font-bold hover:bg-yellow-50 transition-colors shadow-md">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 opacity-90" />
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <img src="/icons/icon-192x192.png" alt="Js-Grw-Up" className="w-28 h-28 rounded-3xl mx-auto mb-8 shadow-2xl shadow-black/30 ring-2 ring-white border-2 border-white bg-white object-cover" />
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/30">
            <Heart className="h-3.5 w-3.5 text-pink-200" fill="currentColor" /> Built for the kids
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6 text-white">
            Co-parenting made<br />
            <span className="text-yellow-300">calmer and clearer</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            Js-Grw-Up is a private platform for separated parents to communicate, coordinate and keep records — all in one place, away from personal social media.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/register" className="bg-white text-violet-700 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
              Create free account <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors text-center backdrop-blur-sm">
              Log in
            </Link>
          </div>

          {/* Stats bar */}
          <div className="inline-flex items-center gap-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
            {stats.map(({ value, label }, i) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Star className="h-3 w-3" fill="currentColor" /> Features
          </div>
          <h2 className="text-3xl font-heading font-bold mb-3">Everything you need in one app</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Designed specifically for co-parents — not a generic messaging app adapted for parenting.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div key={title} className={`${bg} border ${border} rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-base">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Private &amp; secure</h4>
            <p className="text-sm text-white/80">Your data is encrypted and never shared. Only you and your linked co-parent can see your records.</p>
          </div>
          <div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Two accounts, one view</h4>
            <p className="text-sm text-white/80">Link accounts with a simple invite link. Both parents see the same calendar, messages and logs in real time.</p>
          </div>
          <div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Court-ready records</h4>
            <p className="text-sm text-white/80">Export a full PDF archive of all your records at any time — timestamped and formatted for legal use.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-b from-background to-violet-50 dark:to-violet-950/20">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3 w-3" /> Pricing
            </div>
            <h2 className="text-3xl font-heading font-bold mb-3">Simple, honest pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you need more. Cancel any time.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Free */}
            <div className="bg-card border-2 border-border rounded-2xl p-8">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Check className="h-3 w-3" /> Always free
              </div>
              <h3 className="text-2xl font-heading font-bold mb-1">Free</h3>
              <div className="text-5xl font-bold mb-6 text-foreground">£0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                {freePlan.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center border-2 border-border px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-muted transition-colors">
                Get started free
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl p-[3px] bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-2xl shadow-violet-500/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Sparkles className="h-3 w-3" /> Most popular
              </div>
              <div className="bg-card rounded-[14px] p-8 h-full">
                <div className="inline-flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  <Sparkles className="h-3 w-3" /> Premium
                </div>
                <h3 className="text-2xl font-heading font-bold mb-1">Premium</h3>
                <div className="text-5xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">£5<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {paidPlan.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block w-full text-center bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/30">
                  Start free, upgrade later
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">No credit card needed to start</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/30">
            <Heart className="h-3.5 w-3.5" fill="currentColor" /> Free to start
          </div>
          <h2 className="text-4xl font-heading font-bold mb-4 text-white">Ready to get started?</h2>
          <p className="text-white/80 mb-10 text-lg">Join families already using Js-Grw-Up. Free, private, and built for the kids.</p>
          <Link to="/register" className="bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-base hover:bg-yellow-50 transition-colors inline-flex items-center gap-2 shadow-xl">
            Create your free account <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-96x96.png" alt="Js-Grw-Up" className="w-6 h-6 rounded" />
            <span>© {new Date().getFullYear()} Js-Grw-Up. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
