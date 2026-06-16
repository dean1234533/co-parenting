import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBanner from "@/components/NotificationBanner";
import RetentionNotice from "@/components/RetentionNotice";

export default function AppLayout() {
  return (
    <div className="min-h-screen min-h-dvh bg-background overflow-x-hidden">
      <Sidebar />
      <NotificationBanner />
      <RetentionNotice />
      <main className="lg:ml-72 min-h-screen min-h-dvh overflow-x-hidden">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}