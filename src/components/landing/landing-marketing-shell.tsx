"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LandingMegaNav } from "@/components/landing/LandingMegaNav";
import LogoComp from "@/components/LogoComp";
import { CornerDiamonds } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

export function LandingMarketingShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-screen font-sans text-foreground antialiased selection:bg-orange-100 selection:text-orange-900">
      <div className="relative z-10 mx-auto w-full max-w-7xl border-x border-black/6 bg-transparent">
        <header
          className={cn(
            "relative sticky top-0 z-100 rounded-sm transition-[background-color,backdrop-filter,box-shadow] duration-300",
            scrolled
              ? "bg-white/70 backdrop-blur-md backdrop-saturate-150 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
              : "bg-transparent",
          )}
        >
          <CornerDiamonds bottom />
          <div className="relative flex w-full items-center justify-between gap-4 px-6 py-3.5 lg:px-10">
            <div className="shrink-0">
              <Link href="/" className="transition-opacity hover:opacity-90">
                <LogoComp />
              </Link>
            </div>
            <LandingMegaNav />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-black/8"
          />
        </header>
        {children}
      </div>
    </main>
  );
}
