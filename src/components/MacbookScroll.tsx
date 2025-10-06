import React from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { ContainerScroll } from "./ui/container-scroll-animation";

export function MacbookScrollDemo() {
  return (
    <div className="w-full flex flex-col overflow-hidden ">
      <MacbookScroll
        title={
          <h1>
            This Macbook is built with Tailwindcss. <br /> No kidding.
          </h1>
        }
        src={`/macScroall.png`}
        showGradient={false}
      />

      <ContainerScroll
        titleComponent={
          <>
            <span className="text-3xl font-bold">
              This Macbook is built with Tailwindcss. <br /> No kidding.
            </span>
          </>
        }
      >
        <img
          src={`/macScroall.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
