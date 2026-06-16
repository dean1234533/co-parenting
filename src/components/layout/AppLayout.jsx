import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBanner from "@/components/NotificationBanner";
import RetentionNotice from "@/components/RetentionNotice";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <NotificationBanner />
      <RetentionNotice />
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}