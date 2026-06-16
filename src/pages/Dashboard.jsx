import db from '@/api/db';

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, ClipboardCheck, AlertTriangle, GraduationCap,
  PoundSterling, CalendarDays, ArrowRight, Clock
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { format } from "date-fns";

export default function Dashboard() {
  // Dashboard queries use no orderBy so Firestore only needs auto-created
  // single-field indexes — no manual composite index setup required.
  const byDateDesc = (a, b) => (b.created_date || '').localeCompare(a.created_date || '');

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const all = await db.entities.ChatMessage.list();
      return all.sort(byDateDesc).slice(0, 5);
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests-pending"],
    queryFn: async () => {
      const all = await db.entities.Request.list();
      return all.filter(r => r.status === 'pending').sort(byDateDesc).slice(0, 10);
    },
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents-recent"],
    queryFn: async () => {
      const all = await db.entities.IncidentReport.list();
      return all.sort((a, b) => (b.incident_date || '').localeCompare(a.incident_date || '')).slice(0, 5);
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events-upcoming"],
    queryFn: async () => {
      const all = await db.entities.CalendarEvent.list();
      return all.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your co-parenting activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Messages"
          value={messages.length}
          icon={MessageSquare}
          color="bg-primary"
          subtitle="Recent conversations"
        />
        <StatCard
          title="Pending Requests"
          value={requests.length}
          icon={ClipboardCheck}
          color="bg-warning"
          subtitle="Awaiting response"
        />
        <StatCard
          title="Incidents"
          value={incidents.length}
          icon={AlertTriangle}
          color="bg-destructive"
          subtitle="Recent reports"
        />
        <StatCard
          title="Upcoming Events"
          value={events.length}
          icon={CalendarDays}
          color="bg-accent"
          subtitle="On the calendar"
        />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-heading">Pending Requests</CardTitle>
            <Link to="/requests" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{req.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.type?.replace("_", " ")} • by {req.requester_name || "Unknown"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-heading">Recent Messages</CardTitle>
            <Link to="/chat" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{msg.sender_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {msg.created_date && format(new Date(msg.created_date), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-heading">Recent Incidents</CardTitle>
            <Link to="/incidents" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No incidents reported</p>
            ) : (
              <div className="space-y-3">
                {incidents.slice(0, 3).map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{inc.child_name} — {inc.injury_type}</p>
                      <p className="text-xs text-muted-foreground">{inc.description?.slice(0, 60)}</p>
                    </div>
                    <Badge variant={inc.severity === "serious" ? "destructive" : "outline"} className="capitalize">
                      {inc.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-heading">Upcoming Events</CardTitle>
            <Link to="/calendar" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{evt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {evt.date && format(new Date(evt.date), "MMM d, yyyy")} {evt.time && `at ${evt.time}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {evt.event_type?.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}