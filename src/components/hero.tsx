"use client";
import React from "react";
import RippleGrid from "./RippleGrid";

import TextType from "./TextType";
import SplitText from "./SplitText";
import AnimatedButton from "./ui/AnimatedButton";
import { useRouter } from "next/navigation";

export default function Hero() {
  const navigate = useRouter();
  return (
    <section className="w-full h-[700px] relative  border-b border-border  ">
      <div className="absolute w-full h-full top-0 flex flex-col item-center justify-center z-30 pb-[200px]">
        <div className="w-[70%] h-[3 00px] mx-auto flex flex-col items-center justify-center gap-6">
          <SplitText
            text="Connect. Learn. Grow with EduMeets"
            className="text-3xl font-semibold text-center text-[#3f324a] dark:text-[#c0aafd] "
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <TextType
            className="text-center text-lg text-[#BDCBDF]"
            text={[
              "Host interactive classes and meetings in one smart platform—simple, reliable, and built for learning.",
              "Seamless video classes and real-time collaboration—powering the future of online education.",
              "From classrooms to conferences, EduMeets connects people with effortless video and meaningful sessions.",
            ]}
            typingSpeed={100}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
          <AnimatedButton
            onClick={() => navigate.push("/pricing")}
            text="Lets Go"
            className="w-48 "
          />
        </div>
      </div>
      <RippleGrid
        enableRainbow={false}
        gridColor="#c0aafd"
        rippleIntensity={0.05}
        gridSize={20}
        gridThickness={15}
        mouseInteraction={false}
        mouseInteractionRadius={1.2}
        opacity={0.8}
      />
    </section>
  );
}
