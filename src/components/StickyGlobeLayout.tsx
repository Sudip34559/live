"use client";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { Globe } from "./ui/Globe";
// Your existing Globe component

const StickyGlobeLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Scrolling content */}
      <div className="flex-1 pr-8 lg:pr-12">
        <div className="space-y-16 py-16">
          {/* Section 1 */}
          <section className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Welcome to Our Platform
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Discover how our innovative solutions can transform your business.
              We provide cutting-edge technology that adapts to your needs and
              scales with your growth.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our platform offers seamless integration, powerful analytics, and
              intuitive user experiences that drive results and exceed
              expectations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Global Reach
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Connect with customers worldwide through our global
              infrastructure. Our network spans across continents, ensuring
              reliable service wherever your business takes you.
            </p>
            <ul className="list-disc list-inside text-lg text-gray-600 space-y-2">
              <li>24/7 global support coverage</li>
              <li>Multi-region data centers</li>
              <li>Localized experiences</li>
              <li>Compliance with international standards</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Innovation & Technology
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Stay ahead of the curve with our latest technological innovations.
              We continuously invest in research and development to bring you
              the most advanced solutions in the market.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              From artificial intelligence to blockchain technology, we leverage
              the latest tools to create solutions that drive your success.
            </p>
          </section>

          {/* Section 4 */}
          <section className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Customer Success
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Our commitment to your success goes beyond just providing
              technology. We partner with you every step of the way to ensure
              you achieve your business objectives.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <blockquote className="text-lg italic text-gray-700">
                "This platform has revolutionized how we operate globally. The
                results speak for themselves."
              </blockquote>
              <cite className="block mt-4 text-sm text-gray-500">
                — CEO, Fortune 500 Company
              </cite>
            </div>
          </section>

          {/* Section 5 */}
          <section className="max-w-2xl pb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Get Started Today
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Ready to transform your business? Join thousands of companies
              worldwide who trust our platform to drive their success.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Start Your Journey
            </button>
          </section>
        </div>
      </div>

      {/* Right side - Sticky globe */}
      <div className=" lg:w-1/2 xl:w-2/5 border-l border-border">
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <Globe className="drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default StickyGlobeLayout;
