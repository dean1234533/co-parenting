import React from 'react';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-heading font-bold mb-3">{title}</h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <SEO path="/terms" title="Terms & Conditions" description="Read the Js-Grw-Up Terms and Conditions. Understand your rights and responsibilities when using our co-parenting app." noIndex={false} />
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
        <h1 className="text-3xl font-heading font-bold mb-2">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using the Js-Grw-Up app, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.</p>
          <p>These terms apply to all users of Js-Grw-Up, including co-parents who have linked their accounts and any other users who access the service.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>Js-Grw-Up is a private communication and coordination platform designed to help separated or divorced parents manage co-parenting responsibilities. The app provides messaging, calendar sharing, expense tracking, incident reporting, and other tools.</p>
          <p>Js-Grw-Up is not a legal service and does not provide legal advice. Nothing in the app constitutes legal documentation unless exported and verified by a qualified legal professional.</p>
        </Section>

        <Section title="3. Eligibility">
          <p>You must be at least 18 years old to use Js-Grw-Up. By registering, you confirm that you are 18 or older and have the legal capacity to enter into these terms.</p>
        </Section>

        <Section title="4. Account Responsibility">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account.</p>
          <p>You agree to notify us immediately of any unauthorised use of your account. Js-Grw-Up is not liable for any loss resulting from unauthorised use of your account.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree to use Js-Grw-Up only for lawful co-parenting communication and coordination. You must not use the app to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Harass, threaten, or abuse the other parent or any third party</li>
            <li>Send obscene, offensive, or inappropriate content</li>
            <li>Share false or misleading information</li>
            <li>Attempt to gain unauthorised access to another user's account</li>
            <li>Use the service for any illegal purpose</li>
            <li>Violate any applicable local, national, or international law</li>
          </ul>
          <p>Js-Grw-Up uses an automated profanity and abuse filter. Messages that violate these standards will be blocked. Repeated violations may result in account suspension.</p>
        </Section>

        <Section title="6. Partner Linking">
          <p>When you link your account with another user's account, you agree to share certain data — including messages, calendar events, expenses, and records — with that linked user. Linking is voluntary and can be undone at any time from the Settings page.</p>
          <p>You are responsible for only linking with individuals you trust and consent to share data with.</p>
        </Section>

        <Section title="7. Content">
          <p>You retain ownership of any content you create within Js-Grw-Up. By using the app, you grant Js-Grw-Up a limited licence to store and display that content to you and your linked co-parent as necessary to provide the service.</p>
          <p>You are solely responsible for the accuracy and legality of content you post. Js-Grw-Up does not verify the accuracy of user-submitted information.</p>
        </Section>

        <Section title="8. Subscriptions and Billing">
          <p>Js-Grw-Up offers a free plan and a Premium subscription billed monthly. Payments are processed securely by Stripe — we do not receive or store your card details.</p>
          <p>Premium subscriptions renew automatically each month until cancelled. You can cancel at any time from Settings; your Premium features remain active until the end of the current billing period, after which your account reverts to the Free plan. Fees already paid are non-refundable except where required by law.</p>
        </Section>

        <Section title="9. Data and Privacy">
          <p>Your use of Js-Grw-Up is also governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
        </Section>

        <Section title="10. Account Deletion">
          <p>You may delete your account at any time from the Settings page. Upon deletion, your profile, linked family data, and associated records are removed from our systems as described in our Privacy Policy.</p>
        </Section>

        <Section title="11. Disclaimers">
          <p>Js-Grw-Up is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that data will never be lost.</p>
          <p>Js-Grw-Up is not a substitute for legal advice, mediation, or court-ordered parenting plans. Always consult a qualified legal professional for matters involving custody or parental rights.</p>
        </Section>

        <Section title="12. Limitation of Liability">
          <p>To the fullest extent permitted by law, Js-Grw-Up and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app, including loss of data, relationship disputes, or legal proceedings.</p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>We may update these Terms from time to time. Continued use of the app after changes are posted constitutes your acceptance of the revised Terms.</p>
        </Section>

        <Section title="14. Contact">
          <p>If you have any questions about these Terms, please contact us through the app.</p>
        </Section>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <Link to="/privacy" className="text-primary hover:underline mr-4">Privacy Policy</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
