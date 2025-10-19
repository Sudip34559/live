// app/privacy-policy/page.tsx
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#1c1917]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#c0aafd] hover:text-[#a78bfa] text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <span>←</span> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#e0e7ff] mb-2">
            Privacy Policy
          </h1>
          <p className="text-[#9ca3af]">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 mb-6 border border-[#3f324a]">
          <p className="text-[#d1d5db] leading-relaxed">
            At Edusathi, we value your privacy and are committed to protecting
            your personal information. This Privacy Policy explains how we
            collect, use, and safeguard your data when you use our platform,
            ensuring a secure and transparent experience.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              1. Information Collection
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              We may collect information that you provide during registration,
              including your name, email address, and other relevant details.
              Additionally, we may collect usage data, such as meeting activity,
              device information, and interactions on the platform, to improve
              our services.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#7c3aed]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              2. Use of Information
            </h2>
            <p className="text-[#d1d5db] leading-relaxed mb-3">
              The information collected is used to:
            </p>
            <ul className="space-y-2 text-[#d1d5db]">
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] mt-1">•</span>
                <span>Provide and maintain our services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] mt-1">•</span>
                <span>Manage your subscription and billing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] mt-1">•</span>
                <span>Improve platform functionality and features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] mt-1">•</span>
                <span>Communicate updates, offers, or support information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] mt-1">•</span>
                <span>Ensure security and prevent unauthorized access</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              3. Data Sharing
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              We do not sell, trade, or rent your personal information to third
              parties. We may share information with trusted service providers
              who help us operate the platform, subject to strict
              confidentiality agreements.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#7c3aed]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              4. Data Security
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Edusathi employs appropriate technical and organizational measures
              to protect your data from unauthorized access, loss, or misuse.
              While we strive to safeguard your information, no method of
              transmission over the Internet is completely secure.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              5. User Rights
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              You have the right to access, update, or request deletion of your
              personal data. For any requests regarding your data, please
              contact us at{" "}
              <a
                href="mailto:edumeet.info@gmail.com"
                className="text-[#c0aafd] hover:text-[#a78bfa] underline transition-colors"
              >
                edumeet.info@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#7c3aed]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              6. Policy Updates
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes
              in our practices or legal requirements. Users will be notified of
              significant changes through the platform or via email.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-[#3f324a] rounded-xl border border-[#4a3d5a]">
          <p className="text-[#d1d5db] text-center">
            For any questions or concerns regarding your privacy or data on
            Edusathi, contact us anytime at{" "}
            <a
              href="mailto:edumeet.info@gmail.com"
              className="text-[#c0aafd] hover:text-[#a78bfa] underline font-medium transition-colors"
            >
              edumeet.info@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
