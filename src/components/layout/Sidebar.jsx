import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare, CalendarDays, GraduationCap,
  PoundSterling, FileText, BookOpen, ClipboardCheck,
  Home, Menu, X, ChevronRight, Heart, NotebookPen, Bell, BellOff, BellRing, UserPlus, Settings, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from '@/lib/AuthContext';
import InvitePartner from '@/components/InvitePartner';

// Incidents and Receipts are removed for the v1 launch — see App.jsx.
const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/chat", label: "Messages", icon: MessageSquare },
  { path: "/requests", label: "Requests", icon: ClipboardCheck },
  { path: "/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/progress", label: "Progress", icon: GraduationCap },
  { path: "/finances", label: "Finances", icon: PoundSterling },
  { path: "/daily-log", label: "Daily Log", icon: NotebookPen },
  { path: "/rules", label: "Rules", icon: BookOpen },
  { path: "/export", label: "Export PDF", icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const { permission, requestPermission } = usePushNotifications();
  const { profile } = useAuth();

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-72 bg-sidebar z-40 flex flex-col transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-96x96.png" alt="Js-Grw-Up" className="w-10 h-10 rounded-xl" />
            <div className="min-w-0">
              <h1 className="text-lg font-heading font-bold text-sidebar-foreground">Js-Grw-Up</h1>
              {profile?.displayName && (
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {profile.displayName}
                  {profile.partnerName && <span> & {profile.partnerName}</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {/* Invite co-parent or show linked partner */}
          {!profile?.partnerId && (
            <button
              onClick={() => setShowInvite(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <UserPlus className="h-4 w-4 text-primary" />
              Invite co-parent
            </button>
          )}
          {profile?.partnerName && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50">
              <Heart className="h-4 w-4 text-pink-400" />
              Linked with {profile.partnerName}
            </div>
          )}
          {/* Push notification toggle */}
          {permission !== 'granted' && permission !== 'denied' && (
            <button
              onClick={requestPermission}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Bell className="h-4 w-4 text-primary" />
              Enable notifications
            </button>
          )}
          {permission === 'granted' && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50">
              <BellRing className="h-4 w-4 text-green-500" />
              Notifications on
            </div>
          )}
          {permission === 'denied' && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/40">
              <BellOff className="h-4 w-4" />
              Notifications blocked
            </div>
          )}
          <a
            href="https://wa.me/447752300937"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Help &amp; Support
          </a>
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings &amp; Account
          </Link>
          <p className="text-xs text-sidebar-foreground/40 text-center">
            Keeping it civil, for the kids
          </p>
          <p className="text-xs text-sidebar-foreground/30 text-center">
            Created by{" "}
            <a
              href="https://dean-da-dev.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-foreground/60 transition-colors"
            >
              Dean Da Dev
            </a>
          </p>
        </div>
      </aside>
      {showInvite && <InvitePartner onClose={() => setShowInvite(false)} />}

    </>
  );
}