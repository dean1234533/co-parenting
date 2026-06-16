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

// Layout
import AppLayout from "@/components/layout/AppLayout";

// Pages
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
import Children from "@/pages/Children";
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

  // Show name setup if logged in but no proper displayName set
  if (isAuthenticated && profile && !profile.displayName) {
    return <ProfileSetup />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invite/:token" element={<AcceptInvite />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/children" element={<Children />} />
          <Route path="/export" element={<ExportPDF />} />
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
