"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getMyCreatorProfile, type CreatorMeResponse } from "@/lib/api/partners-program";

interface CreatorContextValue {
  profile: CreatorMeResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CreatorContext = createContext<CreatorContextValue | null>(null);

export function CreatorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<CreatorMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshEmail = session?.user?.email;
  const refresh = useCallback(async () => {
    if (!refreshEmail) return;
    try {
      const data = await getMyCreatorProfile(refreshEmail);
      setProfile(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        // Auth'd but no Partner row — push them through apply.
        router.replace("/creators-program/apply");
      }
    }
  }, [refreshEmail, router]);

  const userEmail = session?.user?.email;
  useEffect(() => {
    if (isPending) return;
    if (!userEmail) {
      router.replace("/creator/sign-in");
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyCreatorProfile(userEmail)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          // Guard against bouncing with /creators-program/apply: if we've
          // already redirected to apply once this tab and somehow ended up
          // back here, stop instead of looping.
          const flagKey = "signalor:creator-bounce";
          if (typeof window !== "undefined" && sessionStorage.getItem(flagKey)) return;
          try {
            sessionStorage.setItem(flagKey, "1");
          } catch {
            /* ignore */
          }
          router.replace("/creators-program/apply");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, userEmail, router]);

  return (
    <CreatorContext.Provider value={{ profile, loading, refresh }}>
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator(): CreatorContextValue {
  const ctx = useContext(CreatorContext);
  if (!ctx) throw new Error("useCreator must be used inside CreatorProvider");
  return ctx;
}
