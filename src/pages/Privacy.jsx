import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-heading font-bold mb-3">{title}</h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold">Js-Grw-Up</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-heading font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

        <Section title="1. Introduction">
          <p>Js-Grw-Up ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.</p>
          <p>By using Js-Grw-Up you agree to the collection and use of information as described in this policy.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong className="text-foreground">Account information:</strong> When you register, we collect your name, email address, and a hashed password.</p>
          <p><strong className="text-foreground">Profile information:</strong> Your display name and any information you add to your profile.</p>
          <p><strong className="text-foreground">Communication data:</strong> Messages, calendar events, requests, incident reports, daily logs, expenses, and other content you create within the app.</p>
          <p><strong className="text-foreground">Device information:</strong> We may collect a device push notification token to send you notifications. This is stored securely and only used to deliver notifications from your linked co-parent.</p>
          <p><strong className="text-foreground">Usage data:</strong> Basic technical information such as the time of actions within the app, used to maintain service reliability. We do not sell this data.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and operate the Js-Grw-Up service</li>
            <li>To share data between linked co-parent accounts</li>
            <li>To send push notifications when your co-parent sends a message or request</li>
            <li>To enforce our Terms and Conditions, including the profanity filter</li>
            <li>To maintain the security and integrity of the platform</li>
          </ul>
          <p>We do not use your data for advertising, profiling, or sale to third parties.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p><strong className="text-foreground">With your linked co-parent:</strong> When you link accounts, certain data is shared between you — including messages, calendar events, requests, expenses, and records. This is the core function of the app.</p>
          <p><strong className="text-foreground">Service providers:</strong> We use Firebase (Google) for authentication, database storage, and push notifications. Google's privacy policy applies to their infrastructure. We use Cloudflare for hosting. No other third parties have access to your personal data.</p>
          <p><strong className="text-foreground">Legal requirements:</strong> We may disclose information if required by law or to protect the rights and safety of users or the public.</p>
        </Section>

        <Section title="5. Data Storage and Security">
          <p>Your data is stored in Google Firebase, which provides encrypted storage and secure access controls. Data is protected in transit using TLS encryption.</p>
          <p>Access to your data is restricted by Firestore security rules — only you and your linked co-parent can access your shared records.</p>
          <p>While we take reasonable precautions to protect your data, no system is completely secure. We cannot guarantee absolute security.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>Your data is retained for as long as your account is active. If you delete your account, your profile is removed immediately. Shared content (such as messages and calendar records) may remain in the shared family space and be accessible to your co-parent.</p>
          <p>You may request deletion of specific shared records by contacting us through the app.</p>
        </Section>

        <Section title="7. Push Notifications">
          <p>If you grant notification permission, we store a push notification token on your device and in our database. This token is used solely to deliver notifications from your linked co-parent's activity. You can revoke notification permission at any time from your device settings or from within the Js-Grw-Up app sidebar.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>Js-Grw-Up is intended for adults (18+) only. We do not knowingly collect data from children. If you believe a child has created an account, please contact us so we can delete it.</p>
        </Section>

        <Section title="9. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and personal data</li>
            <li>Object to processing of your data</li>
            <li>Data portability (export of your data)</li>
          </ul>
          <p>To exercise these rights, delete your account from Settings or contact us through the app.</p>
        </Section>

        <Section title="10. Cookies and Local Storage">
          <p>Js-Grw-Up uses browser local storage to remember your name for the login greeting and to maintain your authentication session. We do not use advertising cookies or tracking cookies.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date. Continued use of the app constitutes acceptance of the revised policy.</p>
        </Section>

        <Section title="12. Contact">
          <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us through the app.</p>
        </Section>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <Link to="/terms" className="text-primary hover:underline mr-4">Terms and Conditions</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
