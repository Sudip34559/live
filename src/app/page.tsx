"use client";
import { BentoGridSection } from "@/components/BentoGridSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import { InfiniteMovingCardsDemo } from "@/components/InfiniteMovingCardsSection";
import BlurLayout from "@/components/layout/blur-layout";
import { LayoutGridSection } from "@/components/LayoutGridSection";
import { MacbookScrollDemo } from "@/components/MacbookScroll";
import { PlusSymbol } from "@/components/PlusSymbol";
import { SparklesPreview } from "@/components/SparklesPreview";
import StickyGlobeLayout from "@/components/StickyGlobeLayout";
import PageLoader from "@/components/ui/page-loader";
import { Suspense } from "react";

function Home() {
  return (
    <BlurLayout>
      <div className="font-sans  min-h-screen flex flex-col items-center px-3">
        <div className=" h-full w-full max-w-[1280px] min-w-[480px] border border-t-0 border-border ">
          <Hero />
          <div className="w-full h-[100px] border-b boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px]" />
            <PlusSymbol className="top-[-12px] right-[-12px]" />
            <PlusSymbol className="bottom-[-18px] left-[-12px]" />
            <PlusSymbol className="bottom-[-18px] right-[-12px]" />
          </div>
          <div className="w-full overflow-hidden lg:h-[1130px] md:h-[800px] h-[600px]">
            <MacbookScrollDemo />
          </div>
          <div className="w-full h-[100px] border-y boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px]" />
            <PlusSymbol className="top-[-12px] right-[-12px]" />
            <PlusSymbol className="bottom-[-18px] left-[-12px]" />
            <PlusSymbol className="bottom-[-18px] right-[-12px]" />
          </div>
          <BentoGridSection />
          <div className="w-full h-[100px] border-b boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px]" />
            <PlusSymbol className="top-[-12px] right-[-12px]" />
            <PlusSymbol className="bottom-[-18px] left-[-12px]" />
            <PlusSymbol className="bottom-[-18px] right-[-12px]" />
          </div>
          <FeaturesSection />
          <div className="w-full h-[100px] border-b boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px] z-50" />
            <PlusSymbol className="top-[-12px] right-[-12px] z-50" />
            <PlusSymbol className="bottom-[-18px] left-[-12px]" />
            <PlusSymbol className="bottom-[-18px] right-[-12px]" />
          </div>
          <StickyGlobeLayout />
          <div className="w-full h-[100px] border-b boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px]" />
            <PlusSymbol className="top-[-12px] right-[-12px]" />
            <PlusSymbol className="bottom-[-18px] left-[-12px]" />
            <PlusSymbol className="bottom-[-18px] right-[-12px]" />
          </div>
          <InfiniteMovingCardsDemo />
          <div className="w-full h-[100px] border-y boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px]" />
            <PlusSymbol className="top-[-12px] right-[-12px]" />
            <PlusSymbol className="bottom-[-18px] left-[-12px] z-50" />
            <PlusSymbol className="bottom-[-18px] right-[-12px] z-50" />
          </div>
          <LayoutGridSection />
          <div className="w-full  border-y boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px] z-50" />
            <PlusSymbol className="top-[-12px] right-[-12px] z-50" />
            <PlusSymbol className="bottom-[-18px] left-[-12px] " />
            <PlusSymbol className="bottom-[-18px] right-[-12px] " />
            <SparklesPreview />
          </div>
          <Footer />
          <div className="w-full h-[100px] border-t boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px] z-50" />
            <PlusSymbol className="top-[-12px] right-[-12px] z-50" />
            <PlusSymbol className="bottom-[-18px] left-[-12px] " />
            <PlusSymbol className="bottom-[-18px] right-[-12px] " />
          </div>
        </div>
      </div>
    </BlurLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Home />
    </Suspense>
  );
}
