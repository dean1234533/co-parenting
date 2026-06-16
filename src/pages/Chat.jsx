import db from '@/api/db';
import { sendPartnerNotification } from '@/lib/notify';

import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, ShieldAlert, AlertCircle } from "lucide-react";
import { containsProfanity, getBlockedWord } from "@/lib/profanityFilter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const { profile, user } = useAuth();

  // Real-time Firestore listener — no polling
  useEffect(() => {
    const familyId = profile?.familyId || user?.id;
    if (!familyId) {
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);

    const q = query(
      collection(firestore, 'chatMessages'),
      where('familyId', '==', familyId),
      orderBy('created_date', 'asc'),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingMessages(false);
      },
      (error) => {
        console.error('Chat snapshot error:', error);
        setLoadingMessages(false);
      }
    );

    return () => unsub();
  }, [profile?.familyId, user?.id]);

  const sendMutation = useMutation({
    mutationFn: (data) => db.entities.ChatMessage.create(data),
    onSuccess: (_, variables) => {
      setMessage("");
      setWarning("");
      const senderName = profile?.displayName || variables.sender_name || 'Your co-parent';
      sendPartnerNotification({
        title: senderName,
        body: `${senderName} sent you a message`,
        data: { type: 'chat' },
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    if (containsProfanity(message)) {
      const blocked = getBlockedWord(message);
      setWarning(`Message blocked — inappropriate language detected ("${blocked}"). Please keep communication respectful.`);
      return;
    }

    sendMutation.mutate({
      content: message.trim(),
      sender_name: profile?.displayName || "Unknown",
      familyId: profile?.familyId,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Live typing filter warning
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    if (val && containsProfanity(val)) {
      setWarning("Your message contains inappropriate language and won't be sent.");
    } else {
      setWarning("");
    }
  };

  return (
    <div className="flex flex-col" style={{height: 'calc(100dvh - 6rem)'}}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-heading font-bold">Messages</h1>
        <div className="flex items-center gap-2 mt-1">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            Respectful communication only — inappropriate language is automatically blocked
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start a conversation.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.created_by_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs font-semibold",
                          isMe ? "text-primary-foreground/80" : "text-foreground/70"
                        )}>
                          {msg.sender_name || "Unknown"}
                        </span>
                        <span className={cn(
                          "text-xs",
                          isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                        )}>
                          {msg.created_date && format(new Date(msg.created_date), "h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Warning */}
        <AnimatePresence>
          {warning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4"
            >
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{warning}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMutation.isPending || !!warning}
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}