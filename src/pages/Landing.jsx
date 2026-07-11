import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, CalendarDays, FileText, ShieldCheck, Receipt, BookOpen,
  ChevronRight, Heart, Lock, Users, Check, Sparkles, Star, Menu, X,
  TrendingUp, ScrollText, FileDown, Clock, ShieldAlert, UserPlus,
  LayoutDashboard, Quote, ArrowRight,
} from 'lucide-react';
import SEO from '@/components/SEO';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import {
  Carousel, CarouselContent, CarouselItem,
} from '@/components/ui/carousel';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const problems = [
  { icon: MessageCircle, title: 'Missed messages', desc: 'Important texts get buried or lost across different apps and phones.' },
  { icon: CalendarDays, title: 'Unclear schedules', desc: 'Pickup times and holidays get mixed up when calendars aren’t shared.' },
  { icon: ShieldAlert, title: 'Arguments over requests', desc: 'Changes to plans turn into disputes with no clear record of what was agreed.' },
  { icon: Receipt, title: 'Forgotten expenses', desc: 'Shared costs slip through the cracks without a simple way to log them.' },
  { icon: ScrollText, title: 'No written records', desc: 'It’s hard to recall what was said or agreed when nothing is written down.' },
  { icon: Heart, title: 'Stress around communication', desc: 'Every conversation can feel tense without a calm, structured space to have it.' },
];

const features = [
  { icon: MessageCircle, title: 'Private Messaging', desc: 'A dedicated chat channel just for co-parenting — separate from personal texts so nothing gets missed.', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800' },
  { icon: CalendarDays, title: 'Shared Calendar', desc: 'Pickups, drop-offs, school events and holidays in one shared view — always in sync.', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  { icon: Check, title: 'Requests & Approvals', desc: 'Propose schedule changes and get a clear yes or no, with a reason recorded either way.', color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800' },
  { icon: Receipt, title: 'Expense Tracking', desc: 'Record shared costs and split them fairly, with a clear running total for both parents.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  { icon: BookOpen, title: 'Daily Logs', desc: 'Keep daily notes on meals, mood, behaviour and milestones — always on record.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'See patterns over time across logs, requests and milestones in one clear view.', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800' },
  { icon: ShieldCheck, title: 'Co-parenting Rules', desc: 'Set agreed rules and reference them any time. Requests can only be denied with a valid written reason.', color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800' },
  { icon: FileText, title: 'Exportable PDF Records', desc: 'Export a full, timestamped archive of messages, logs and requests whenever you need it.', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800' },
  { icon: UserPlus, title: 'Secure Account Linking', desc: 'Invite your co-parent with a simple, private link — no shared logins or awkward group chats.', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800' },
];

const trustPoints = [
  { icon: Lock, title: 'Private & Secure', desc: 'Your data is encrypted and never shared. Only you and your linked co-parent can see your records.' },
  { icon: Users, title: 'Two Accounts, One Shared View', desc: 'Link accounts with a simple invite link. Both parents see the same calendar, messages and logs in real time.' },
  { icon: FileText, title: 'Exportable Records', desc: 'Keep a clear, organised record you can export as a PDF any time you need it.' },
  { icon: FileDown, title: 'Exportable PDF Archive', desc: 'Export your full history at any time — messages, logs, requests and expenses in one document.' },
  { icon: Clock, title: 'Timestamped Communication', desc: 'Every message, request and log entry is time-stamped automatically, with nothing to edit after the fact.' },
  { icon: Heart, title: 'Designed to Reduce Conflict', desc: 'Clear structure and written records help keep conversations calm, factual and focused on the kids.' },
];

const steps = [
  { number: '01', title: 'Create your free account', desc: 'Sign up in a couple of minutes — no credit card required.' },
  { number: '02', title: 'Invite your co-parent', desc: 'Send a private invite link so you’re both connected to the same shared space.' },
  { number: '03', title: 'Start managing everything', desc: 'Messages, calendars, requests, expenses and records — all in one organised place.' },
];

const planFeatures = [
  'Private messaging',
  'Shared calendar',
  'Requests & approvals',
  'Link with your co-parent',
  'Daily logs',
  'Progress tracking',
  'Expense tracking',
  'Co-parenting rules',
  'PDF export',
];

const useCases = [
  { icon: Users, title: 'Separated Parents', desc: 'A calmer way to communicate and coordinate without relying on personal messaging apps.' },
  { icon: CalendarDays, title: 'Co-parents With Shared Schedules', desc: 'Keep pickups, drop-offs and holidays clear and synced across both households.' },
  { icon: Receipt, title: 'Parents Managing Expenses', desc: 'Track shared costs so nothing gets forgotten or disputed later.' },
  { icon: ScrollText, title: 'Parents Needing Clear Records', desc: 'Build a reliable, timestamped history for peace of mind or future reference.' },
  { icon: Heart, title: 'Families Wanting Less Conflict', desc: 'Structured tools that encourage clear, respectful communication between parents.' },
];

const benefits = [
  { icon: ShieldCheck, title: 'Reduce misunderstandings', desc: 'Clear, written communication leaves less room for confusion.' },
  { icon: LayoutDashboard, title: 'Keep everything in one place', desc: 'No more piecing things together across texts, emails and notebooks.' },
  { icon: CalendarDays, title: 'Stay organised', desc: 'Shared calendars and requests keep both parents on the same page.' },
  { icon: MessageCircle, title: 'Make communication clearer', desc: 'A dedicated space designed for calm, focused conversations.' },
  { icon: ScrollText, title: 'Track important decisions', desc: 'Requests and approvals are recorded with reasons, not just outcomes.' },
  { icon: FileText, title: 'Create a reliable record', desc: 'Everything is timestamped and exportable whenever you need it.' },
];

const testimonials = [
  { initials: 'SM', name: 'Sarah M.', rating: 5, quote: 'Having everything in one place made communication much easier and reduced the number of arguments about dates and arrangements.' },
  { initials: 'DR', name: 'Daniel R.', rating: 5, quote: 'The shared calendar alone has saved us so many mix-ups. It just feels calmer knowing everything is written down.' },
  { initials: 'PT', name: 'Priya T.', rating: 5, quote: 'Being able to export a clear record gave me real peace of mind. It’s simple to use and doesn’t feel complicated or cold.' },
  { initials: 'JL', name: 'James L.', rating: 4, quote: 'We stopped arguing about who said what. Requests are logged with reasons, so everything stays fair and clear.' },
];

const faqs = [
  { q: 'Is JS-GRW-UP free to start?', a: 'Yes. You can create a free account and use core features like private messaging, the shared calendar and requests without paying anything.' },
  { q: 'Can both parents access the same calendar?', a: 'Yes. Once you link accounts with your co-parent, you both see the same shared calendar, messages and logs in real time.' },
  { q: 'Can I export records?', a: 'Yes. You can export a full, timestamped PDF of your messages, logs, requests and expenses whenever you need it.' },
  { q: 'Is my data private?', a: 'Yes. Your data is encrypted and only visible to you and your linked co-parent — it’s never shared or sold.' },
  { q: 'Do I need a credit card?', a: 'No. You can create a free account and start using JS-GRW-UP without entering any payment details.' },
  { q: 'Can I use it on mobile?', a: 'Yes. JS-GRW-UP is designed mobile-first, so it works smoothly on your phone, tablet or desktop.' },
  { q: 'Is this legal advice?', a: 'No. JS-GRW-UP helps you communicate, stay organised and keep records. It does not provide legal advice, and you should consult a qualified professional for legal matters.' },
];

const stats = [
  { value: '100%', label: 'Private & encrypted' },
  { value: 'Free', label: 'To get started' },
  { value: '24/7', label: 'Always available' },
];

function SectionBadge({ icon: Icon, children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 ${className}`}>
      {Icon && <Icon className="h-3 w-3" fill="currentColor" />} {children}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700'}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ initials, name, rating, quote }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full">
      <Quote className="h-6 w-6 text-violet-300 dark:text-violet-700 mb-3" />
      <StarRating rating={rating} />
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-3 mb-5">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initials}
        </div>
        <span className="text-sm font-semibold">{name}</span>
      </div>
    </div>
  );
}

function TestimonialCarousel({ items }) {
  const [api, setApi] = useState(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on('select', onSelect);
    return () => api.off('select', onSelect);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [api]);

  return (
    <div className="max-w-xl mx-auto">
      <Carousel setApi={setApi} opts={{ loop: true, align: 'start' }}>
        <CarouselContent>
          {items.map((t) => (
            <CarouselItem key={t.name} className="basis-full">
              <TestimonialCard {...t} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center justify-center gap-2 mt-6">
        {items.map((t, i) => (
          <button
            key={t.name}
            type="button"
            aria-label={`Go to testimonial ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all ${i === selected ? 'w-6 bg-violet-600' : 'w-2 bg-violet-200 dark:bg-violet-800'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <SEO
        path="/"
        title="Co-parenting App for Separated Parents"
        description="JS-GRW-UP is the private co-parenting app for separated parents. Shared calendar, safe messaging, expense tracking and exportable PDF records. Free to start."
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-violet-100 dark:border-violet-900/40 shadow-sm">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <img src="/icons/icon-96x96.png" alt="JS-GRW-UP" className="w-9 h-9 rounded-xl ring-1 ring-violet-200 dark:ring-violet-800 shadow-sm object-cover" />
            <div className="flex flex-col leading-none">
              <span className="text-base font-heading font-black bg-gradient-to-r from-violet-700 to-pink-600 bg-clip-text text-transparent tracking-wide">JS-GRW-UP</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Co-Parenting Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 font-medium transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 font-medium transition-colors px-3 py-2">Log in</Link>
            <Link to="/register" className="text-sm bg-gradient-to-r from-violet-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md shadow-violet-500/25">
              Get started free
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 -mr-2 text-slate-700 dark:text-slate-200"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-violet-100 dark:border-violet-900/40 bg-white dark:bg-slate-950 px-5 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-slate-700 dark:text-slate-200 font-medium py-3 border-b border-slate-100 dark:border-slate-800"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-center text-sm border border-slate-200 dark:border-slate-700 rounded-xl py-3 font-semibold text-slate-700 dark:text-slate-200">
                Log in
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-center text-sm bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl py-3 font-semibold shadow-md shadow-violet-500/25">
                Get started free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative [overflow-x:clip]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950/30" />
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-violet-300/30 dark:bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-teal-200/30 dark:bg-teal-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-200/20 dark:bg-amber-800/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="text-center lg:text-left">
              <SectionBadge icon={Heart} className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                Built for calmer co-parenting
              </SectionBadge>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-heading font-bold leading-[1.1] mb-6 text-slate-900 dark:text-white">
                Co-parenting made{' '}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  calmer, clearer, and more organised.
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                JS-GRW-UP helps separated parents communicate, share calendars, manage requests, track expenses and keep important records — all in one secure, private place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link to="/register" className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25">
                  Create Free Account <ChevronRight className="h-4 w-4" />
                </Link>
                <a href="#how-it-works" className="border-2 border-violet-200 dark:border-violet-800 text-slate-700 dark:text-slate-200 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors text-center">
                  See How It Works
                </a>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-teal-600" /> 100% private &amp; encrypted</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-teal-600" /> Free to get started</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-teal-600" /> Available 24/7</span>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="relative mx-auto max-w-md w-full">
              <div className="absolute -inset-4 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-violet-900/10 border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">This week</span>
                  <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full font-semibold">Synced</span>
                </div>

                <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl p-3.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">New message</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">"Can we swap Friday pickup?"</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-3.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">School pickup</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Thursday, 3:30pm</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl p-3.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">Request approved</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Weekend swap confirmed</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">Daily log added</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">"Great day at school today"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-violet-100 dark:border-violet-900/40 rounded-2xl px-8 py-5 max-w-xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <div className="text-center mb-14">
          <SectionBadge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
            The challenge
          </SectionBadge>
          <h2 className="text-3xl font-heading font-bold mb-3">Co-parenting comes with real challenges</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Most separated parents face the same everyday friction — here’s what tends to get in the way.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="font-bold mb-2 text-base">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <SectionBadge icon={Sparkles} className="bg-white/15 text-white border border-white/25">
            The solution
          </SectionBadge>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-5 text-white">One clear, private place for everything</h2>
          <p className="text-white/85 text-lg leading-relaxed max-w-2xl mx-auto">
            JS-GRW-UP brings messaging, calendars, requests, expenses and records together in a single secure platform — so both parents always know what’s happening, and nothing gets lost along the way.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <div className="text-center mb-16">
          <SectionBadge icon={Star} className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
            Features
          </SectionBadge>
          <h2 className="text-3xl font-heading font-bold mb-3">Everything you need in one app</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Designed specifically for co-parents — not a generic messaging app adapted for parenting.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div key={title} className={`${bg} border ${border} rounded-2xl p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200`}>
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
      <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionBadge className="bg-white/15 text-white border border-white/25">
              Security &amp; trust
            </SectionBadge>
            <h2 className="text-3xl font-heading font-bold mb-3 text-white">Built to keep communication clear and safe</h2>
            <p className="text-white/85 max-w-xl mx-auto">Every part of JS-GRW-UP is designed to keep things organised, recordable, and calm.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustPoints.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center sm:text-left">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto sm:mx-0 mb-4">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="font-bold text-white text-lg mb-2">{title}</h4>
                <p className="text-sm text-white/80 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <div className="text-center mb-16">
          <SectionBadge icon={Sparkles} className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            How it works
          </SectionBadge>
          <h2 className="text-3xl font-heading font-bold mb-3">Get started in three simple steps</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">No complicated setup — just a few minutes and you’re both connected.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map(({ number, title, desc }, i) => (
            <div key={number} className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 text-white flex items-center justify-center mx-auto mb-5 font-heading font-bold text-xl shadow-lg shadow-violet-500/25">
                {number}
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-violet-300 dark:text-violet-700" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gradient-to-b from-background to-violet-50 dark:to-violet-950/20">
        <div className="max-w-md mx-auto px-6 py-20 lg:py-24">
          <div className="text-center mb-16">
            <SectionBadge icon={Sparkles} className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
              Pricing
            </SectionBadge>
            <h2 className="text-3xl font-heading font-bold mb-3">Free during early access</h2>
            <p className="text-muted-foreground">Every feature, free while we're getting started. No credit card needed.</p>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-8">
            <SectionBadge icon={Check} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              Free
            </SectionBadge>
            <h3 className="text-2xl font-heading font-bold mb-1">Everything included</h3>
            <div className="text-5xl font-bold mb-6 text-foreground">£0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-3 mb-8">
              {planFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block w-full text-center bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/30">
              Get Started Free
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8">No credit card needed to start.</p>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <div className="text-center mb-14">
          <SectionBadge className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
            Who it’s for
          </SectionBadge>
          <h2 className="text-3xl font-heading font-bold mb-3">Built for every co-parenting situation</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Whatever your arrangement looks like, JS-GRW-UP adapts to how your family communicates.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/40 dark:to-pink-900/40 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-bold mb-2 text-base">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <div className="text-center mb-14">
            <SectionBadge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              Benefits
            </SectionBadge>
            <h2 className="text-3xl font-heading font-bold mb-3">What changes when everything is in one place</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <div className="text-center mb-14">
          <SectionBadge icon={Star} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            Testimonials
          </SectionBadge>
          <h2 className="text-3xl font-heading font-bold mb-3">Trusted by parents who wanted things calmer</h2>
        </div>
        <TestimonialCarousel items={testimonials} />
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-24">
          <div className="text-center mb-12">
            <SectionBadge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
              FAQ
            </SectionBadge>
            <h2 className="text-3xl font-heading font-bold mb-3">Frequently asked questions</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-6 shadow-sm">
            <Accordion type="single" collapsible>
              {faqs.map(({ q, a }, i) => (
                <AccordionItem key={q} value={`item-${i}`} className={i === faqs.length - 1 ? 'border-b-0' : ''}>
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline">{q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            JS-GRW-UP provides tools for organisation and communication only, and does not offer legal advice. Please consult a qualified professional for legal matters.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-20 lg:py-24 text-center">
          <SectionBadge icon={Heart} className="bg-white/15 text-white border border-white/25">
            Free to start
          </SectionBadge>
          <h2 className="text-4xl font-heading font-bold mb-4 text-white">Make co-parenting clearer, calmer, and easier to manage.</h2>
          <p className="text-white/85 mb-10 text-lg">Join parents already using JS-GRW-UP to stay organised, communicate clearly, and keep reliable records.</p>
          <Link to="/register" className="bg-white text-violet-700 px-10 py-4 rounded-xl font-bold text-base hover:bg-yellow-50 transition-colors inline-flex items-center gap-2 shadow-xl">
            Create Free Account <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Contact / support */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h3 className="text-xl font-heading font-bold mb-2">Need a hand? We’re here to help.</h3>
        <p className="text-muted-foreground mb-4">Reach out any time and our support team will get back to you.</p>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <div className="font-semibold text-foreground">JS-GRW-UP</div>
          <div>Email: <a href="mailto:support@js-grw-up.com" className="text-violet-600 dark:text-violet-400 hover:underline">support@js-grw-up.com</a></div>
          <div>Website: <span className="text-violet-600 dark:text-violet-400">js-grw-up.com</span></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/icons/icon-96x96.png" alt="JS-GRW-UP" className="w-7 h-7 rounded-lg" />
                <span className="font-heading font-black text-sm bg-gradient-to-r from-violet-700 to-pink-600 bg-clip-text text-transparent">JS-GRW-UP</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calmer, clearer co-parenting for separated families.</p>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">How it works</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">FAQ</a></li>
                <li><a href="mailto:support@js-grw-up.com" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} JS-GRW-UP. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-foreground transition-colors cursor-default">Twitter</span>
              <span className="hover:text-foreground transition-colors cursor-default">Instagram</span>
              <span className="hover:text-foreground transition-colors cursor-default">Facebook</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-6 max-w-2xl mx-auto leading-relaxed">
            JS-GRW-UP is a demonstration project. Content, pricing, testimonials, and contact information are for demo purposes only. This website does not provide legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
