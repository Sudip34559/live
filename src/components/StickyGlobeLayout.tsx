"use client";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import dynamic from "next/dynamic";
import {
  Code,
  Database,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Users,
  Rocket,
} from "lucide-react";
import GlassIcons from "./GlassIcons";
import { PlusSymbol } from "./PlusSymbol";
// Your existing Globe component
const World = dynamic(() => import("./ui/Globe").then((m) => m.Globe), {
  ssr: false,
});
const StickyGlobeLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Scrolling content */}
      <div className="flex-1 flex flex-col">
        {featuresArray.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-7 p-4 w-full h-[200px] border-b border-border"
          >
            <div className="h-full flex items-center text-neutral-600 dark:text-neutral-400 ">
              <GlassIcons
                item={{
                  icon: <item.icon size={32} />,
                  color: "purple",
                  label: item.title,
                }}
              />
            </div>
            <div className="  mb-2 z-10 px-2 flex-1 h-full flex flex-col gap-2 justify-center">
              <span className="group-hover/feature:translate-x-2 font-bold transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
                {item.title}
              </span>
              <p className="text-sm text-neutral-600 w-full dark:text-neutral-300  relative z-10 px-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right side - Sticky globe */}
      <div className=" w-1/2 border-l border-b border-border hidden lg:block relative">
        <PlusSymbol className="top-[-12px] left-[-12px]" />
        <PlusSymbol className="bottom-[-18px] left-[-12px]" />
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <World className="drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};
const featuresArray = [
  {
    title: "Full-Stack Development",
    icon: Code,
    description:
      "Build complete web applications from frontend to backend with modern technologies and best practices.",
  },
  {
    title: "Database Integration",
    icon: Database,
    description:
      "Seamlessly connect and manage data with MongoDB, PostgreSQL, and other database solutions.",
  },
  {
    title: "Global Deployment",
    icon: Globe,
    description:
      "Deploy your applications worldwide with CDN support and optimized performance across regions.",
  },
  {
    title: "Mobile Responsive",
    icon: Smartphone,
    description:
      "Create responsive designs that work perfectly on all devices, from mobile to desktop.",
  },
  {
    title: "Security First",
    icon: Shield,
    description:
      "Implement robust authentication, authorization, and security measures to protect your applications.",
  },
  {
    title: "High Performance",
    icon: Zap,
    description:
      "Optimize for speed and efficiency with server-side rendering, caching, and modern frameworks.",
  },
  {
    title: "Team Collaboration",
    icon: Users,
    description:
      "Built-in features for team management, role-based access control, and collaborative workflows.",
  },
  {
    title: "Rapid Deployment",
    icon: Rocket,
    description:
      "Launch your projects quickly with automated CI/CD pipelines and containerized deployments.",
  },
];
export default StickyGlobeLayout;
