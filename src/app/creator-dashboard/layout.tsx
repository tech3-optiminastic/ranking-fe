"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DashboardAppFrame,
  type DashboardAppSection,
} from "@/app/dashboard/[slug]/_components/dashboard-app-frame";
import { CreatorProvider, useCreator } from "./_components/creator-context";
import { authClient, useSession } from "@/lib/auth-client";
import { UserAvatar } from "@/components/ui/user-avatar";
import LogoComp from "@/components/LogoComp";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  Sparkles,
  type LucideIcon,
} from "@/components/icons";
import { OverviewIcon } from "@/components/icons/nav";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/creator-dashboard", icon: OverviewIcon },
  { label: "Profile & payout", href: "/creator-dashboard/settings", icon: Settings },
];

function sectionFor(pathname: string): DashboardAppSection {
  if (pathname.startsWith("/creator-dashboard/settings")) {
    return {
      title: "Profile & payout",
      hint: "Update how you appear and how we pay you.",
    };
  }
  return {
    title: "Creator overview",
    hint: "Your link, earnings, and recent commissions.",
  };
}

function CreatorSidebarBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoComp
        size={22}
        compact
        animated={false}
        className="text-sm font-bold tracking-tight text-foreground"
      />
      <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
        Creator
      </span>
    </Link>
  );
}

function CreatorSidebarNav() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1 p-2">
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/creator-dashboard"
              ? pathname === "/creator-dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function CreatorShareCard() {
  const { profile } = useCreator();
  if (!profile) return null;
  return (
    <div className="m-2 rounded-md border border-orange-200/60 bg-orange-50/40 p-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-orange-600" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">
          Your code
        </p>
      </div>
      <p className="mt-1 font-mono text-[14px] font-bold tracking-wider text-foreground">
        {profile.code}
      </p>
      <p className="mt-0.5 text-[10px] text-neutral-500">
        {profile.commission_percent}% commission · 10% off for visitors
      </p>
    </div>
  );
}

function CreatorSidebarBottom() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleSignOut() {
    await authClient.signOut();
    router.replace("/creator/sign-in");
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Creator";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;

  return (
    <div className="shrink-0 space-y-3 border-t border-border/40 px-3 pt-3 pb-1">
      <CreatorShareCard />
      <div className="relative" ref={menuRef}>
        {open ? (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 border border-border bg-card p-2.5 shadow-lg">
            <div className="mb-2 flex items-center gap-3 border-b border-border px-1 pb-2.5">
              <UserAvatar src={userImage} initials={userInitials} size={36} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-foreground">{userName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 transition hover:bg-muted"
        >
          <UserAvatar src={userImage} initials={userInitials} size={30} />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-medium text-foreground">{userName}</p>
          </div>
          {open ? (
            <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

function CreatorFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const section = sectionFor(pathname);
  return (
    <DashboardAppFrame
      section={section}
      breadcrumbs={[]}
      sidebarBrand={<CreatorSidebarBrand />}
      sidebarBelowHeaderRow={null}
      sidebarNav={<CreatorSidebarNav />}
      sidebarBottom={<CreatorSidebarBottom />}
      brandHref="/creator-dashboard"
    >
      <div className="animate-enter">{children}</div>
    </DashboardAppFrame>
  );
}

export default function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorProvider>
      <CreatorFrame>{children}</CreatorFrame>
    </CreatorProvider>
  );
}
