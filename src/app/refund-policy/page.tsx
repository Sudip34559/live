// app/cancel-refund/page.tsx
import Link from "next/link";

export default function RefundPolicy() {
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
            Refund Policy
          </h1>
          <p className="text-[#9ca3af]">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#8b5cf6]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              1. General Policy
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              All subscription fees for monthly or annual plans are billed in
              advance. Payments are generally non-refundable except where
              required by law.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#8b5cf6]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              2. Cancellation
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Users may cancel their subscription at any time. Paid features
              will remain accessible until the end of the current billing
              period. No partial refunds will be issued for remaining days.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#8b5cf6]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              3. Plan Upgrades and Downgrades
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              Upgrading a plan grants immediate access to additional features,
              with billing adjusted accordingly. Downgrades will take effect
              from the next billing cycle.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#8b5cf6]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              4. Exceptional Cases
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              In rare cases, such as technical issues or billing errors,
              Edusathi may issue a refund at its discretion. Users must contact
              support with details of the issue.
            </p>
          </div>

          <div className="bg-[#2d2535] rounded-xl shadow-lg p-6 border-l-4 border-[#8b5cf6]">
            <h2 className="text-2xl font-semibold text-[#e0e7ff] mb-3">
              5. Contact Support
            </h2>
            <p className="text-[#d1d5db] leading-relaxed">
              For any refund-related queries or requests, please email{" "}
              <a
                href="mailto:edumeet.info@gmail.com"
                className="text-[#c0aafd] hover:text-[#a78bfa] underline transition-colors"
              >
                edumeet.info@gmail.com
              </a>{" "}
              with your account information and a brief description of the
              issue.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#8b5cf6] to-[#c0aafd] rounded-xl text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-2 text-[#1c1917]">
            Need Help with Refunds or Billing?
          </h3>
          <p className="mb-6 text-[#2d2535]">
            For support or queries regarding refunds, subscription, or billing,
            contact us anytime.
          </p>
          <a
            href="mailto:edumeet.info@gmail.com"
            className="inline-block bg-[#1c1917] text-[#c0aafd] px-8 py-3 rounded-lg font-semibold hover:bg-[#2d2535] transition-colors shadow-md"
          >
            Contact Support
          </a>
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
