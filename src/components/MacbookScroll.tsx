import React from "react";
import dynamic from "next/dynamic";

const MacbookScroll = dynamic(
  () =>
    import("@/components/ui/macbook-scroll").then((mod) => mod.MacbookScroll),
  {
    ssr: false,
  }
);

const ContainerScroll = dynamic(
  () =>
    import("./ui/container-scroll-animation").then(
      (mod) => mod.ContainerScroll
    ),
  {
    ssr: false,
  }
);

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
