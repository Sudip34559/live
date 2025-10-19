import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Linkedin,
  Twitter,
  Youtube,
  MessageCircle,
  Mail,
  MapPin,
  Heart,
} from "lucide-react";
import dynamic from "next/dynamic";
const Boxes = dynamic(
  () => import("./ui/background-boxes").then((mod) => mod.Boxes),
  {
    ssr: false,
  }
);
export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden  flex flex-col items-center justify-center rounded-lg">
      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none" />

      <Boxes />
      <div className=" w-full z-40 pointer-events-none py-5">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-5 pointer-events-none">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">EduMeets</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Simplifying virtual learning for everyone.
              </p>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                Built with{" "}
                <Heart className="w-3 h-3 text-red-500 fill-current" /> by Sudip
                Tunga.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 ">
            <h4 className="text-sm font-semibold text-foreground">
              Navigation
            </h4>
            <ul className="space-y-2">
              {["Home", "About", "Features", "Pricing", "Blog", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4 ">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Refund Policy",
                "Cookie Policy",
                "Disclaimer",
              ].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Stay Connected
            </h4>
            <p className="text-sm text-muted-foreground">
              Join our community — get the latest updates and resources.
            </p>

            {/* Newsletter Signup */}
            <div className="flex space-x-2 pointer-events-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-9"
              />
              <Button size="sm" className="h-9">
                Subscribe
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:edumeet.info@gmail.com"
                  className="hover:text-foreground transition-colors pointer-events-auto"
                >
                  edumeet.info@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Kolkata, India</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-5 pointer-events-none">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Follow us on</span>
            <div className="flex gap-3">
              {[
                { icon: Github, href: "https://github.com", label: "GitHub" },
                {
                  icon: Linkedin,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                {
                  icon: Twitter,
                  href: "https://twitter.com",
                  label: "Twitter",
                },
                {
                  icon: Youtube,
                  href: "https://youtube.com",
                  label: "YouTube",
                },
                {
                  icon: MessageCircle,
                  href: "https://discord.com",
                  label: "Discord",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p className="flex items-center justify-center md:justify-end gap-1">
              © 2025 EduMeets. Crafted with{" "}
              <Heart className="w-3 h-3 text-red-500 fill-current" /> by Sudip
              Tunga.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
