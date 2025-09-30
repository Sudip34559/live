
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { ArrowRight, BadgeCheck, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { IPlan } from "@/types/types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrencyFromIP } from "@/apis/api";

export const PricingCard = ({
  tier,
  paymentFrequency,
  isHighlighted,
  cardIndex, // Add unique identifier for each card
}: {
  tier: IPlan;
  paymentFrequency: string;
  isHighlighted: boolean;
  cardIndex: number; // New prop to make each card unique
}) => {
  // console.log("............", tier);

  const [isExpanded, setIsExpanded] = useState(false);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    getCurrencyFromIP().then((currency) => {
      setCurrency(currency);
      console.log("Detected currency:", currency);
    });
  }, [tier]);

  const isPopular = tier.isRecomended;
  const pric = Object.entries(tier.pricing).find((t) => t[0] === currency);
  const price =
    paymentFrequency === "monthly"
      ? pric?.[1].monthly.amount || 0
      : pric?.[1].yearly.amount || 0;

  // Convert features object to array for easier manipulation
  const featuresArray = Object.entries(tier.features).filter(
    ([_, value]) => value
  );
  const visibleFeatures = featuresArray.slice(0, 5);
  const hiddenFeatures = featuresArray.slice(5);
  const hasMoreFeatures = hiddenFeatures.length > 0;

  const toggleExpansion = (id: number) => {
    // console.log("clicked", isExpanded);
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "w-full flex justify-center",
        cardIndex % 2 != 0 ? "sm:justify-start" : "sm:justify-end"
      )}
    >
      <div
        className={cn(
          "relative flex flex-col gap-8 rounded-2xl border  p-6 shadow transition-all duration-700 self-start min-h-[484px] max-w-[270px]",
          isHighlighted
            ? "bg-[#2d2535] text-background dark:bg-[#ffffff]"
            : "bg-[#ffffff] text-foreground dark:bg-[#2d2535]",
          isPopular && "outline outline-[rgba(120,119,198)]"
        )}
        style={{
          // Remove any overflow hidden that might cause layout issues
          overflow: "visible",
        }}
      >
        {/* Background Decoration */}
        {isHighlighted && <HighlightedBackground />}
        {isPopular && <PopularBackground />}

        {/* Card Header */}
        <div className="flex-shrink-0">
          <h2 className="flex items-center gap-3 text-xl font-medium capitalize">
            {tier.name}
            {isPopular && (
              <Badge className="mt-1 bg-[#fca5a5] px-1 py-0 text-black ">
                🔥 Most Popular
              </Badge>
            )}
          </h2>
        </div>

        {/* Price Section */}
        <div className="relative h-12 flex-shrink-0">
          {price != 0 ? (
            <>
              <NumberFlow
                format={{
                  style: "currency",
                  currency,
                  trailingZeroDisplay: "stripIfInteger",
                }}
                value={price}
                className="text-4xl font-medium"
              />
              <p className="-mt-2 text-xs font-medium">Per month/user</p>
            </>
          ) : (
            <h1 className="text-4xl font-medium">
              {price == 0 && cardIndex == 0 ? "Free" : "Custom"}
            </h1>
          )}
        </div>

        {/* Features - This section will grow/shrink */}
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-medium flex-shrink-0">
            {tier.description}
          </h3>

          {/* Features Container */}
          <div className="space-y-2">
            {/* Always visible features */}
            <ul className="space-y-2">
              {visibleFeatures.map(([key, value], index) => (
                <FeatureItem
                  key={`visible-${cardIndex}-${index}`}
                  feature={key}
                  isHighlighted={isHighlighted}
                />
              ))}
            </ul>

            {/* Collapsible additional features */}
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div
                  key={`expanded-${cardIndex}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    transition: {
                      height: {
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.2,
                      },
                      opacity: {
                        duration: 0.25,
                        delay: 0.1,
                      },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      height: {
                        type: "spring",
                        duration: 0.3,
                        bounce: 0.2,
                      },
                      opacity: {
                        duration: 0.15,
                      },
                    },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <ul className="space-y-2 pt-2">
                    {hiddenFeatures.map(([key, value], index) => (
                      <motion.li
                        key={`hidden-${cardIndex}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: {
                            delay: index * 0.05,
                          },
                        }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <FeatureItem
                          feature={key}
                          isHighlighted={isHighlighted}
                        />
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show more/less button */}
            {hasMoreFeatures && (
              <motion.button
                key={`button-${cardIndex}`}
                onClick={() => toggleExpansion(cardIndex)}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-2 text-xs font-medium transition-all duration-200 hover:bg-opacity-50 mt-3",
                  isHighlighted
                    ? "border-background/30 text-background/80 hover:bg-background/10"
                    : "border-foreground/30 text-foreground/60 hover:bg-foreground/5"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MoreHorizontal size={16} />
                </motion.div>
                <span>
                  {isExpanded
                    ? `Show Less`
                    : `Show ${hiddenFeatures.length} More Feature${
                        hiddenFeatures.length !== 1 ? "s" : ""
                      }`}
                </span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Call to Action Button - Fixed at bottom */}
        <div className="flex-shrink-0 mt-auto">
          <Button
            variant="expandIcon"
            Icon={ArrowRight}
            iconPlacement="right"
            className={cn(
              "h-fit w-full rounded-lg",
              isHighlighted && "bg-accent text-foreground hover:bg-accent/95"
            )}
          >
            {"Get started"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Feature Item Component
const FeatureItem = ({
  feature,
  isHighlighted,
}: {
  feature: string;
  isHighlighted: boolean;
}) => (
  <li
    className={cn(
      "flex items-center gap-2 text-sm font-medium",
      isHighlighted ? "text-background" : "text-foreground/60"
    )}
  >
    <BadgeCheck strokeWidth={1} size={16} className="flex-shrink-0" />
    <span>{feature}</span>
  </li>
);

// Highlighted Background Component
const HighlightedBackground = () => (
  <div className="absolute rounded-2xl -z-20 inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] opacity-100 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:opacity-30" />
);

// Popular Background Component
const PopularBackground = () => (
  <div className="absolute -z-20 inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
);
