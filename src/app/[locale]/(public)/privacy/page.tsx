import type { Metadata } from "next";
import { PublicNav } from "@/components/layout/public-nav";

export const metadata: Metadata = {
  title: "Privacy Policy — MediaLinkPro",
  description: "Learn how MediaLinkPro collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: May 18, 2026</p>

        <div className="space-y-10 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              MediaLinkPro (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed
              to protecting your personal data. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform. Please read this
              policy carefully. If you disagree with its terms, please discontinue use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information in the following ways:</p>
            <h3 className="text-base font-semibold text-white/90 mb-2">
              Information you provide directly
            </h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Account details: name, email address, password</li>
              <li>Profile information: bio, job title, skills, location, profile photo</li>
              <li>Organisation and product details you create</li>
              <li>Messages and communications sent through the Service</li>
              <li>Payment information (processed securely by our payment provider)</li>
            </ul>
            <h3 className="text-base font-semibold text-white/90 mb-2">
              Information collected automatically
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Log data: IP address, browser type, pages visited, timestamps</li>
              <li>Device information: hardware model, operating system, unique device identifiers</li>
              <li>Usage data: features used, clicks, session duration</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide, operate, and maintain the Service</li>
              <li>Create and manage your account</li>
              <li>Process transactions and send related notices</li>
              <li>Send administrative information, updates, and security alerts</li>
              <li>Respond to your comments and support requests</li>
              <li>Analyse usage trends to improve the Service</li>
              <li>Detect and prevent fraudulent or unauthorised activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Sharing Your Information</h2>
            <p className="mb-3">
              We do not sell your personal data. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-white">Service providers</strong> who assist us in operating
                the platform (hosting, analytics, payment processing, email delivery)
              </li>
              <li>
                <strong className="text-white">Other users</strong> as part of normal platform
                functionality (e.g. your public profile is visible to other members)
              </li>
              <li>
                <strong className="text-white">Legal authorities</strong> when required by law, court
                order, or to protect the rights, property, or safety of MediaLinkPro or others
              </li>
              <li>
                <strong className="text-white">Successors</strong> in connection with a merger,
                acquisition, or sale of assets, provided the acquirer agrees to honour this policy
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain sessions, remember your
              preferences, and analyse how the Service is used. You can instruct your browser to
              refuse all cookies or to indicate when a cookie is being sent. However, some features
              of the Service may not function properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to
              provide the Service. You may request deletion of your account and associated data at
              any time by contacting us. We may retain certain information for legitimate business
              purposes or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Security</h2>
            <p>
              We implement industry-standard technical and organisational measures to protect your
              data against unauthorised access, alteration, disclosure, or destruction. However, no
              method of transmission over the internet or electronic storage is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p className="mb-3">
              Depending on your location, you may have the following rights regarding your personal
              data:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-white">Access</strong> — request a copy of the data we hold
                about you
              </li>
              <li>
                <strong className="text-white">Correction</strong> — request correction of inaccurate
                or incomplete data
              </li>
              <li>
                <strong className="text-white">Deletion</strong> — request erasure of your personal
                data
              </li>
              <li>
                <strong className="text-white">Portability</strong> — request transfer of your data
                in a machine-readable format
              </li>
              <li>
                <strong className="text-white">Objection</strong> — object to certain types of
                processing
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@medialinkpro.net" className="text-[var(--brand)] hover:underline">
                privacy@medialinkpro.net
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children&rsquo;s Privacy</h2>
            <p>
              The Service is not directed to individuals under the age of 18. We do not knowingly
              collect personal data from children. If we become aware that a child has provided us
              with personal data, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. International Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We
              ensure appropriate safeguards are in place for such transfers in accordance with
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on this page and updating the &ldquo;Last
              updated&rdquo; date. Your continued use of the Service after changes are posted
              constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices,
              please contact us at{" "}
              <a href="mailto:privacy@medialinkpro.net" className="text-[var(--brand)] hover:underline">
                privacy@medialinkpro.net
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
