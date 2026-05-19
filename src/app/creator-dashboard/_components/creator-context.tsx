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

  const refresh = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const data = await getMyCreatorProfile(session.user.email);
      setProfile(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        // Auth'd but no Partner row — push them through apply.
        router.replace("/creators-program/apply");
      }
    }
  }, [session, router]);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user?.email) {
      router.replace("/creator/sign-in");
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyCreatorProfile(session.user.email)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          router.replace("/creators-program/apply");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, session, router]);

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
