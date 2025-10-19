// app/terms-of-service/page.tsx
import Link from "next/link";

export default function TermsOfService() {
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
            Terms & Conditions
          </h1>
          <p className="text-[#9ca3af]">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 mb-6 border border-[#3f324a]">
          <p className="text-[#d1d5db] leading-relaxed">
            By using Edusathi, you agree to register with accurate information
            and use the platform according to your selected subscription plan.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              1. Account & Access
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              By using Edusathi, you agree to register with accurate and
              complete information. Access to the platform is granted according
              to the subscription plan you select.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              2. Subscription & Payment
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Monthly and annual subscriptions are billed in advance. Payments
              are generally non-refundable, but users can upgrade or cancel
              their plans at any time.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              3. Usage Guidelines
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Users are responsible for all content shared during meetings and
              must comply with applicable laws. Sharing account credentials with
              others is strictly prohibited.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              4. Data & Privacy
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Edusathi respects your privacy and protects your data. Users
              retain ownership of their content, while Edusathi may store
              recordings for paid plans.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              5. Intellectual Property
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              All software, logos, and branding of Edusathi remain the property
              of Edusathi. Users may not copy, modify, or distribute Edusathi
              assets without permission.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              6. Support & Service
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Support is provided according to your subscription plan. For
              assistance, you can contact us at{" "}
              <a
                href="mailto:edumeet.info@gmail.com"
                className="text-[#c0aafd] hover:text-[#a78bfa] underline transition-colors"
              >
                edumeet.info@gmail.com
              </a>
              . Edusathi may update features, pricing, or policies at any time.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Edusathi is not liable for indirect, incidental, or consequential
              damages arising from the use of the platform.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#c0aafd]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              8. Governing Law
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              These terms are governed by Indian law, and any disputes will be
              subject to the courts in Kolkata, West Bengal.
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
