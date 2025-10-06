"use client";
import Hero from "@/components/hero";
import BlurLayout from "@/components/layout/blur-layout";
import { PlusSymbol } from "@/components/PlusSymbol";

import { Eye, PackageSearch, Settings } from "lucide-react";

export default function Home() {
  const data = [
    {
      id: 1,
      title: "1. Choose a Component",
      content:
        "Select the component that best suits your needs from Eldora UI's versatile collection, designed to simplify and enhance your development process.",
      image:
        "https://i.pinimg.com/736x/ca/aa/49/caaa49d386d84f2d037d0abcc919778f.jpg",
      icon: PackageSearch,
      badge: "Step 1",
      link: "https://example.com/components",
    },
    {
      id: 2,
      title: "2. Add Utility Helpers",
      content:
        "Enhance functionality by incorporating utility helpers that align with the selected component, ensuring seamless integration and customization.",
      image:
        "https://i.pinimg.com/736x/a5/dc/0a/a5dc0af50d185b7f9111949b17e17e1a.jpg",
      icon: Settings,
      badge: "Step 2",
      link: "https://example.com/utilities",
    },
    {
      id: 3,
      title: "3. Copy and Paste the Code",
      content:
        "Simply copy and paste the provided code into your project, making the process quick and hassle-free. You're now ready to see the magic in action!",
      image:
        "https://i.pinimg.com/736x/b1/b9/c2/b1b9c230143fb0d8540eabe5b74adf27.jpg",
      icon: Eye,
      badge: "Step 3",
      link: "https://example.com/copy-paste",
    },
  ];

  const handleCardClick = (feature: any) => {
    console.log("Card clicked:", feature.title);
  };

  return (
    <BlurLayout>
      <div className="font-sans h-[2000px] min-h-screen flex flex-col items-center px-3">
        <div className=" h-full w-full max-w-[1280px] min-w-[480px] border border-t-0 border-border ">
          <Hero />
          <div className="w-full h-[100px] border-b boder-border relative">
            <PlusSymbol className="top-[-12px] left-[-12px]" />
            <PlusSymbol className="bottom-[-18px] left-[-12px]" />
            <PlusSymbol className="top-[-12px] right-[-12px]" />
            <PlusSymbol className="bottom-[-18px] right-[-12px]" />
          </div>
        </div>
      </div>
    </BlurLayout>
  );
}
