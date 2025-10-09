"use client";

import { PAYMENT_FREQUENCIES } from "@/config";
import { useEffect, useState } from "react";
import { PricingHeader } from "./pricing-header";
import { getPlans } from "@/apis/api";
import { Skeleton } from "./ui/skeleton";
import { PlusSymbol } from "./PlusSymbol";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const PricingCard = dynamic(
  () => import("./pricing-card").then((mod) => mod.PricingCard),
  {
    loading: () => <Skeleton className="h-[484px] w-[267px] rounded-2xl" />,
    ssr: false,
  }
);

export const Pricing = () => {
  const [selectedPaymentFreq, setSelectedPaymentFreq] = useState(
    PAYMENT_FREQUENCIES[0]
  );

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlans().then((res) => {
      if (res.data.success) {
        setPlans(res.data.data);
      }
    });
  }, []);

  return (
    <section className="flex flex-col items-center">
      {/* Section Header */}
      <div className=" h-full w-full max-w-[1280px] min-w-[480px] border border-y-0 border-border flex flex-col items-center gap-10 pt-24  pb-10">
        <PricingHeader
          title="Plans and Pricing"
          subtitle="Receive unlimited credits when you pay yearly, and save on your plan."
          frequencies={PAYMENT_FREQUENCIES}
          selectedFrequency={selectedPaymentFreq}
          onFrequencyChange={setSelectedPaymentFreq}
        />

        {/* Pricing Cards */}
        <div className="w-full pb-10 flex justify-center border-b border-border relative">
          <PlusSymbol className="bottom-[-18px] left-[-12px]" />
          <PlusSymbol className="bottom-[-18px] right-[-12px]" />
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
        </div>
      </div>
    </section>
  );
};
