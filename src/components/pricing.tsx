"use client";

import { PAYMENT_FREQUENCIES } from "@/config";
import { useEffect, useState } from "react";
import { PricingHeader } from "./pricing-header";
import { PricingCard } from "./pricing-card";
import { getPlans } from "@/apis/api";

export const Pricing = () => {
  const [selectedPaymentFreq, setSelectedPaymentFreq] = useState(
    PAYMENT_FREQUENCIES[0]
  );

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getPlans().then((res) => {
      setPlans(res.data.data);
    });
  }, []);

  return (
    <section className="flex flex-col items-center gap-10 py-10">
      {/* Section Header */}
      <PricingHeader
        title="Plans and Pricing"
        subtitle="Receive unlimited credits when you pay yearly, and save on your plan."
        frequencies={PAYMENT_FREQUENCIES}
        selectedFrequency={selectedPaymentFreq}
        onFrequencyChange={setSelectedPaymentFreq}
      />

      {/* Pricing Cards */}
      <div className="grid w-full max-w-6xl gap-6 sm:grid-cols-2 xl:grid-cols-4 items-start">
        {plans.map((tier, i) => (
          <PricingCard
            key={i}
            tier={tier}
            cardIndex={i}
            isHighlighted={i === 3}
            paymentFrequency={selectedPaymentFreq}
          />
        ))}
      </div>
    </section>
  );
};
