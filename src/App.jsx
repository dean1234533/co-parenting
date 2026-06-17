import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import OfflineIndicator from "@/components/OfflineIndicator";
import InstallPrompt from "@/components/InstallPrompt";
import ProfileSetup from "@/components/ProfileSetup";

// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AcceptInvite from "@/pages/AcceptInvite";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

// Layout
import AppLayout from "@/components/layout/AppLayout";
import PaywallGate from "@/components/PaywallGate";

// Pages
import Landing from "@/pages/Landing";
import Subscribe from "@/pages/Subscribe";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Requests from "@/pages/Requests";
import Incidents from "@/pages/Incidents";
import Progress from "@/pages/Progress";
import Finances from "@/pages/Finances";
import Receipts from "@/pages/Receipts";
import CalendarPage from "@/pages/Calendar";
import Rules from "@/pages/Rules";
import ExportPDF from "@/pages/ExportPDF";
import DailyLog from "@/pages/DailyLog";
import Settings from "@/pages/Settings";

const AuthenticatedApp = () => {
  const { isLoadingAuth, authChecked, isAuthenticated, profile } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show name setup if logged in but no proper displayName set, or if it looks like an email
  const nameNeedsSetup = !profile?.displayName || profile.displayName.includes('@');
  if (isAuthenticated && profile && nameNeedsSetup) {
    return <ProfileSetup />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invite/:token" element={<AcceptInvite />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/incidents" element={<PaywallGate feature="Incident reports"><Incidents /></PaywallGate>} />
          <Route path="/progress" element={<PaywallGate feature="Progress tracking"><Progress /></PaywallGate>} />
          <Route path="/finances" element={<PaywallGate feature="Expense tracking"><Finances /></PaywallGate>} />
          <Route path="/receipts" element={<PaywallGate feature="Receipts"><Receipts /></PaywallGate>} />
          <Route path="/rules" element={<PaywallGate feature="Co-parenting rules"><Rules /></PaywallGate>} />
          <Route path="/daily-log" element={<PaywallGate feature="Daily logs"><DailyLog /></PaywallGate>} />
          <Route path="/export" element={<PaywallGate feature="PDF export"><ExportPDF /></PaywallGate>} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <OfflineIndicator />
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
          <InstallPrompt />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
