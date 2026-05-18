import type { Metadata } from "next";
import { PublicNav } from "@/components/layout/public-nav";

export const metadata: Metadata = {
  title: "Terms of Service — MediaLinkPro",
  description: "Read the Terms of Service governing your use of MediaLinkPro.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: May 18, 2026</p>

        <div className="space-y-10 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MediaLinkPro (&ldquo;the Service&rdquo;), you agree to be bound
              by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to all of these
              Terms, do not use the Service. These Terms apply to all visitors, users, and others
              who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              MediaLinkPro is a professional networking platform connecting media professionals,
              organisations, and product vendors. The Service includes profile creation, product
              listings, event management, messaging, and related features. We reserve the right to
              modify, suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility</h2>
            <p>
              You must be at least 18 years old and capable of forming a binding contract to use the
              Service. By using the Service, you represent and warrant that you meet these
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Account Registration</h2>
            <p>
              You must provide accurate, current, and complete information during registration and
              keep your account information updated. You are responsible for safeguarding your
              password and for all activity that occurs under your account. You must notify us
              immediately of any unauthorised use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. User Content</h2>
            <p className="mb-3">
              You retain ownership of content you submit to the Service. By posting content, you
              grant MediaLinkPro a worldwide, non-exclusive, royalty-free licence to use, reproduce,
              modify, and display that content solely to operate and improve the Service.
            </p>
            <p>You agree not to post content that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Is unlawful, harmful, threatening, or defamatory</li>
              <li>Infringes any intellectual property or privacy rights</li>
              <li>Contains spam, malware, or deceptive material</li>
              <li>Impersonates any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, or harvest data without our written permission</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Use the Service to transmit unsolicited commercial communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Subscriptions and Billing</h2>
            <p>
              Certain features require a paid subscription. Subscriptions are billed in advance on a
              monthly or annual basis and are non-refundable except where required by law. We reserve
              the right to change pricing with 30 days&rsquo; notice. Failure to pay may result in
              suspension or termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain
              the exclusive property of MediaLinkPro and its licensors. You may not copy, modify,
              distribute, sell, or lease any part of the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Third-Party Services</h2>
            <p>
              The Service may contain links to third-party websites or services. We are not
              responsible for the content or practices of those services and encourage you to review
              their terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Disclaimers and Limitation of Liability
            </h2>
            <p className="mb-3">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND. TO THE
              MAXIMUM EXTENT PERMITTED BY LAW, MEDIALINKPRO DISCLAIMS ALL WARRANTIES, EXPRESS OR
              IMPLIED.
            </p>
            <p>
              IN NO EVENT SHALL MEDIALINKPRO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE, EVEN IF WE
              HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Termination</h2>
            <p>
              We may terminate or suspend your account at our sole discretion, without notice, for
              conduct that we believe violates these Terms or is harmful to other users, us, or third
              parties. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the
              jurisdiction in which MediaLinkPro is incorporated, without regard to conflict of law
              principles. Any disputes shall be resolved exclusively in the courts of that
              jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. We will notify you of material
              changes by posting the new Terms on this page and updating the &ldquo;Last
              updated&rdquo; date. Continued use of the Service after changes constitutes acceptance
              of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@medialinkpro.net"
                className="text-[#C6A85E] hover:underline"
              >
                legal@medialinkpro.net
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
