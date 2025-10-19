"use client";
import PageLoader from "@/components/ui/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Hero = dynamic(
  () => import("@/components/hero").then((mod) => mod.default),
  {
    loading: () => <Skeleton className="h-[700px] w-full bg-[#1c1917]" />,
    ssr: false,
  }
);

const BentoGridSection = dynamic(() =>
  import("@/components/BentoGridSection").then((mod) => mod.BentoGridSection)
);

const FeaturesSection = dynamic(() =>
  import("@/components/FeaturesSection").then((mod) => mod.FeaturesSection)
);

const Footer = dynamic(() => import("@/components/footer"), {
  loading: () => <Skeleton className="h-[700px] w-full bg-[#1c1917]" />,
  ssr: false, // optional — skip SSR if client-only
});

const InfiniteMovingCardsDemo = dynamic(() =>
  import("@/components/InfiniteMovingCardsSection").then(
    (mod) => mod.InfiniteMovingCardsDemo
  )
);

const BlurLayout = dynamic(() => import("@/components/layout/blur-layout"), {
  ssr: false,
});

const LayoutGridSection = dynamic(
  () =>
    import("@/components/LayoutGridSection").then(
      (mod) => mod.LayoutGridSection
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[700px] w-full bg-[#1c1917]" />,
  }
);

const MacbookScrollDemo = dynamic(() =>
  import("@/components/MacbookScroll").then((mod) => mod.MacbookScrollDemo)
);

const PlusSymbol = dynamic(() =>
  import("@/components/PlusSymbol").then((mod) => mod.PlusSymbol)
);

const SparklesPreview = dynamic(() =>
  import("@/components/SparklesPreview").then((mod) => mod.SparklesPreview)
);

const StickyGlobeLayout = dynamic(() =>
  import("@/components/StickyGlobeLayout").then((mod) => mod.default)
);

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
