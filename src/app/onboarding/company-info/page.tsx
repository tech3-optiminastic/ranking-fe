"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization } from "@/lib/api/organizations";
import { startAnalysis } from "@/lib/api/analyzer";
import { getSubscriptionStatus, getUsage } from "@/lib/api/payments";
import { getShopifyAuthUrl, connectWordPress } from "@/lib/api/integrations";
import { createApiKey } from "@/lib/api/api-keys";
import { getOrFetchOnboardingToken } from "@/lib/api/onboarding-security";
import { TurnstileWidget } from "@/components/onboarding/turnstile-widget";
import { OnboardingStepper } from "@/components/auth/onboarding-stepper";
import { config, routes, signalorWpPlugin } from "@/lib/config";
import { ONBOARDING_DRAFT_KEY, storePendingAnalysisAfterPayment } from "@/lib/internal-nav";
import axios from "axios";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Plus,
  X,
  Pencil,
  Rocket,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
} from "@/components/icons";

type Platform = "shopify" | "wordpress" | "webflow" | "framer" | "nextjs";
type Step = "company" | "platform" | "url" | "install" | "prompts" | "analytics" | "launch";

const STEP_ORDER: Step[] = [
  "company",
  "platform",
  "url",
  "install",
  "prompts",
  "analytics",
  "launch",
];

/** Nested panels inside the main card (install blocks, prompts list, etc.) */
const PANEL =
  "rounded-xl border border-black/8 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.045)] isolate";

const ERR_BOX =
  "rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] font-medium text-destructive";

const STATUS_BOX =
  "flex items-center gap-2 rounded-md border border-black/6 bg-muted/35 px-3 py-2 text-[12px] text-muted-foreground";

function fmtErr(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Something went wrong. Please try again.";
  const d = err.response?.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const o = d as Record<string, unknown>;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
    if (typeof o.detail === "string" && o.detail.trim()) return o.detail;
  }
  if (err.code === "ERR_NETWORK" || err.code === "ECONNREFUSED")
    return "Cannot reach the server. Make sure the backend is running.";
  if (err.response?.status === 403) return "Subscription required or project limit.";
  return "Failed. Please try again.";
}

type Draft = {
  v: 5;
  email: string;
  step: Step;
  companyName: string;
  platform: Platform;
  siteUrl: string;
  shopDomain: string;
  storePassword: string;
  wpSiteUrl: string;
  wpApiKey: string;
  wpStep: number;
  orgId: number | null;
  prompts: string[];
  appInstalled: boolean;
};

const PLATFORM_META: Record<Platform, { logo: string; starBg: string; label: string }> = {
  shopify: {
    logo: "/logos/shopify.svg",
    starBg:
      "conic-gradient(from 22.5deg, rgba(150,191,72,0.22), rgba(150,191,72,0.04), rgba(150,191,72,0.22), rgba(150,191,72,0.04), rgba(150,191,72,0.22), rgba(150,191,72,0.04), rgba(150,191,72,0.22), rgba(150,191,72,0.04))",
    label: "Shopify",
  },
  wordpress: {
    logo: "/logos/wordpress.svg",
    starBg:
      "conic-gradient(from 22.5deg, rgba(33,117,155,0.24), rgba(33,117,155,0.04), rgba(33,117,155,0.24), rgba(33,117,155,0.04), rgba(33,117,155,0.24), rgba(33,117,155,0.04), rgba(33,117,155,0.24), rgba(33,117,155,0.04))",
    label: "WordPress",
  },
  webflow: {
    logo: "/logos/webflow.svg",
    starBg:
      "conic-gradient(from 22.5deg, rgba(20,110,245,0.22), rgba(20,110,245,0.04), rgba(20,110,245,0.22), rgba(20,110,245,0.04), rgba(20,110,245,0.22), rgba(20,110,245,0.04), rgba(20,110,245,0.22), rgba(20,110,245,0.04))",
    label: "Webflow",
  },
  framer: {
    logo: "/logos/framer.svg",
    starBg:
      "conic-gradient(from 22.5deg, rgba(0,85,255,0.22), rgba(0,85,255,0.04), rgba(0,85,255,0.22), rgba(0,85,255,0.04), rgba(0,85,255,0.22), rgba(0,85,255,0.04), rgba(0,85,255,0.22), rgba(0,85,255,0.04))",
    label: "Framer",
  },
  nextjs: {
    logo: "/logos/nextjs.svg",
    starBg:
      "conic-gradient(from 22.5deg, rgba(0,0,0,0.10), rgba(0,0,0,0.02), rgba(0,0,0,0.10), rgba(0,0,0,0.02), rgba(0,0,0,0.10), rgba(0,0,0,0.02), rgba(0,0,0,0.10), rgba(0,0,0,0.02))",
    label: "Next.js",
  },
};

const SIGNALOR_STAR_BG =
  "conic-gradient(from 22.5deg, rgba(220,50,30,0.13), rgba(220,50,30,0.02), rgba(220,50,30,0.13), rgba(220,50,30,0.02), rgba(220,50,30,0.13), rgba(220,50,30,0.02), rgba(220,50,30,0.13), rgba(220,50,30,0.02))";

function IntegrationConnectBanner({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform];
  return (
    <div className="mb-5 flex items-center justify-center gap-3">
      {/* Platform logo — left */}
      <div
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        style={{ background: meta.starBg }}
      >
        <img src={meta.logo} alt={meta.label} className="h-9 w-9 object-contain" />
      </div>

      <div className="flex items-center gap-1 text-muted-foreground/40">
        <span className="block h-px w-5 border-t-2 border-dashed border-current" />
        <span className="block h-1.5 w-1.5 rounded-full bg-current" />
        <span className="block h-px w-5 border-t-2 border-dashed border-current" />
      </div>

      {/* Signalor logo — right */}
      <div
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        style={{ background: SIGNALOR_STAR_BG }}
      >
        <img src="/icon.svg" alt="Signalor" className="h-9 w-9 object-contain" />
      </div>
    </div>
  );
}

function BrandConnectBanner({ siteUrl }: { siteUrl: string }) {
  const [failed, setFailed] = useState(false);
  const domain = siteUrl
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/")[0];

  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        {domain && !failed ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt={domain}
            className="h-9 w-9 rounded-lg object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <Globe className="h-8 w-8 text-muted-foreground/30" />
        )}
      </div>

      <div className="flex items-center gap-1 text-muted-foreground/40">
        <span className="block h-px w-5 border-t-2 border-dashed border-current" />
        <span className="block h-1.5 w-1.5 rounded-full bg-current" />
        <span className="block h-px w-5 border-t-2 border-dashed border-current" />
      </div>

      <div
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        style={{ background: SIGNALOR_STAR_BG }}
      >
        <img src="/icon.svg" alt="Signalor" className="h-9 w-9 object-contain" />
      </div>
    </div>
  );
}

function SiteFavicon({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const domain = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/")[0];
  if (failed || !domain) {
    return <Globe className="inline-block size-3.5 shrink-0 text-muted-foreground/60" />;
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      width={14}
      height={14}
      className="inline-block size-3.5 shrink-0 rounded-[3px] object-contain align-middle"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Next.js install step — pnpm install + four code snippets + auto-minted
 * API key. Extracted from the main page render to keep the file
 * navigable; the parent owns the API-key minting and the continue
 * handlers, this component just renders.
 */
function NextJsInstall({
  apiKey,
  apiKeyError,
  minting,
  copied,
  onCopy,
  onBack,
  onSkip,
  onContinue,
}: {
  apiKey: string;
  apiKeyError: string;
  minting: boolean;
  copied: string | null;
  onCopy: (label: string, text: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  const blocks: { id: string; label: string; lang: string; code: string }[] = [
    {
      id: "install",
      label: "Install",
      lang: "bash",
      code: "pnpm add @signalor/nextjs",
    },
    {
      id: "env",
      label: ".env",
      lang: "ini",
      code: `SIGNALOR_API_KEY=${apiKey || "sk_live_…"}`,
    },
    {
      id: "middleware",
      label: "middleware.ts",
      lang: "ts",
      code: `export { signalorMiddleware as default } from "@signalor/nextjs/middleware";
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};`,
    },
    {
      id: "layout",
      label: "app/layout.tsx",
      lang: "tsx",
      code: `import { SignalorSchema } from "@signalor/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <head><SignalorSchema /></head>
      <body>{children}</body>
    </html>
  );
}`,
    },
    {
      id: "llms",
      label: "app/llms.txt/route.ts",
      lang: "ts",
      code: `export { GET } from "@signalor/nextjs/llms-txt";`,
    },
    {
      id: "deploy",
      label: "package.json",
      lang: "json",
      code: `{
  "scripts": {
    "postbuild": "signalor-deploy"
  }
}`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className={`${PANEL} p-4`}>
        <div className="space-y-2.5">
          {blocks.map((b, i) => (
            <div key={b.id}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
                  {i + 1}. {b.label}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(b.id, b.code)}
                  className="text-[10.5px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {copied === b.id ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground">
                <code>{b.code}</code>
              </pre>
            </div>
          ))}
        </div>

        {minting ? (
          <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Minting your API key…
          </p>
        ) : null}
        {apiKeyError ? <p className={`${ERR_BOX} mt-3`}>{apiKeyError}</p> : null}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          Skip for now
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          disabled={minting}
          className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
        >
          I&rsquo;ve installed it <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CompanyInfoPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const applied = useRef(false);
  const skipDraft = useRef(false);
  const [canPersist, setCanPersist] = useState(false);

  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [platform, setPlatform] = useState<Platform>("shopify");
  const [siteUrl, setSiteUrl] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpApiKey, setWpApiKey] = useState("");
  const [wpStep, setWpStep] = useState(1);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);
  // Framer install — plugin is install-only (no API key, no fetch).
  // We just track whether the plugin URL has been copied to the clipboard.
  const [framerUrlCopied, setFramerUrlCopied] = useState(false);
  // Next.js install — API key is minted on the spot so devs can paste it
  // into their .env without leaving onboarding.
  const [nextjsApiKey, setNextjsApiKey] = useState("");
  const [nextjsKeyError, setNextjsKeyError] = useState("");
  const [mintingNextjsKey, setMintingNextjsKey] = useState(false);
  const [nextjsCopied, setNextjsCopied] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  // Latest Cloudflare Turnstile token (when configured). Refreshes itself ~5min.
  // Forwarded to the backend on the very next onboarding-start call so the
  // minted token comes from a verified-human session.
  const turnstileTokenRef = useRef<string>("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [atLimitNotice, setAtLimitNotice] = useState<{ planLabel: string } | null>(null);
  const [shopDomainErr, setShopDomainErr] = useState("");
  const [wpUrlErr, setWpUrlErr] = useState("");

  const sessionEmailForGate = session?.user?.email;
  useEffect(() => {
    if (!isPending && !sessionEmailForGate) router.replace(routes.signIn);
  }, [isPending, sessionEmailForGate, router]);

  // When the user is already at their project limit, surface a banner so
  // they can't fill the form and hit a 403 on submit. We intentionally do
  // NOT redirect here — paid+at_limit and /pricing's returnTo would bounce
  // forever, and /dashboard sends them back to onboarding when the first
  // org has no runs. Unpaid+at_limit goes to /pricing once; the session
  // flag in /pricing prevents that path from re-bouncing.
  useEffect(() => {
    const email = session?.user?.email;
    if (isPending || !email) return;
    let cancelled = false;
    Promise.all([
      getUsage(email).catch(() => null),
      getSubscriptionStatus(email).catch(() => null),
    ]).then(([u, s]) => {
      if (cancelled) return;
      if (!u?.at_limit?.projects) {
        setAtLimitNotice(null);
        return;
      }
      if (s?.is_active) {
        setAtLimitNotice({ planLabel: s.plan_label || s.plan || "your" });
      } else {
        router.replace(`/pricing?returnTo=${encodeURIComponent(routes.onboardingCompanyInfo)}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isPending, session?.user?.email, router]);

  // Handle return from Shopify OAuth / app install
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email) return;
    const p = new URLSearchParams(window.location.search);

    // Return from Shopify app install. `installed` is the FE-set
    // in-progress marker (pre-OAuth); `connected` is the BE-set success
    // marker emitted by the Shopify callback after the token is stored.
    // `error` is the BE failure path — we surface the reason and let the
    // user retry instead of silently swallowing it.
    const shopifyParam = p.get("shopify");
    const isSuccess = shopifyParam === "installed" || shopifyParam === "connected";
    const isError = shopifyParam === "error";
    if (isSuccess || isError || p.get("resume") === "shopify") {
      if (isError) {
        const reason = p.get("reason") || "unknown";
        setError(`Shopify install failed (${reason}). Please try again.`);
        window.history.replaceState({}, "", "/onboarding/company-info");
        setCanPersist(true);
        return;
      }
      // The install completed (BE told us so via shopify=connected). Always
      // advance past the install step — never trap the user on the button
      // again. Field restoration is best-effort from sessionStorage; even
      // if both stores are empty, we still set step="prompts" so the user
      // can continue.
      skipDraft.current = true;
      setPlatform("shopify");
      setAppInstalled(true);
      setStep("prompts");
      try {
        let restored: {
          companyName?: string;
          orgId?: number | null;
          siteUrl?: string;
          shopDomain?: string;
          prompts?: unknown[];
        } | null = null;
        const installSnapshot = sessionStorage.getItem("signalor_onboarding");
        if (installSnapshot) {
          restored = JSON.parse(installSnapshot);
          sessionStorage.removeItem("signalor_onboarding");
        } else {
          const draft = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
          if (draft) restored = JSON.parse(draft);
        }
        if (restored) {
          setCompanyName(restored.companyName || "");
          setOrgId(restored.orgId ?? null);
          setSiteUrl(restored.siteUrl || "");
          setShopDomain(restored.shopDomain || "");
          if (!restored.prompts?.length) {
            genPrompts(restored.companyName ?? "", restored.siteUrl ?? "");
          }
        }
      } catch {
        /**/
      }
      window.history.replaceState({}, "", "/onboarding/company-info");
      setCanPersist(true);
      return;
    }

    if (skipDraft.current || applied.current) {
      setCanPersist(true);
      return;
    }
    applied.current = true;
    try {
      const raw = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) {
        setCanPersist(true);
        return;
      }
      const d = JSON.parse(raw);
      if (d.email !== session.user.email) {
        sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
        setCanPersist(true);
        return;
      }
      setStep(d.step ?? "company");
      setCompanyName(d.companyName ?? "");
      setPlatform(d.platform ?? "shopify");
      setSiteUrl(d.siteUrl ?? "");
      setShopDomain(d.shopDomain ?? "");
      setStorePassword(d.storePassword ?? "");
      setWpSiteUrl(d.wpSiteUrl ?? "");
      setWpApiKey(d.wpApiKey ?? "");
      setWpStep(d.wpStep ?? 1);
      setOrgId(d.orgId ?? null);
      setPrompts(Array.isArray(d.prompts) ? d.prompts : []);
      setAppInstalled(d.appInstalled ?? false);
    } catch {
      sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
    }
    setCanPersist(true);
  }, [session?.user?.email]);

  // Auto-mint a Signalor API key on landing in the Next.js install step.
  // Avoids forcing devs to context-switch to Settings → Developers just to
  // get a key for their .env.
  useEffect(() => {
    if (step !== "install" || platform !== "nextjs") return;
    if (!session?.user?.email || !orgId) return;
    if (nextjsApiKey || mintingNextjsKey) return;
    const email = session.user.email;
    setMintingNextjsKey(true);
    setNextjsKeyError("");
    createApiKey({ email, orgId, name: "Next.js SDK", environment: "live" })
      .then((res) => setNextjsApiKey(res.key))
      .catch(() =>
        setNextjsKeyError(
          "Couldn't generate an API key. Make sure the backend is running, or create one manually from Settings → Developers.",
        ),
      )
      .finally(() => setMintingNextjsKey(false));
  }, [step, platform, session?.user?.email, orgId, nextjsApiKey, mintingNextjsKey]);

  // Persist draft
  useEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email || !canPersist) return;
    const draft: Draft = {
      v: 5,
      email: session.user.email,
      step,
      companyName,
      platform,
      siteUrl,
      shopDomain,
      storePassword,
      wpSiteUrl,
      wpApiKey,
      wpStep,
      orgId,
      prompts,
      appInstalled,
    };
    try {
      sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /**/
    }
  }, [
    canPersist,
    session?.user?.email,
    step,
    companyName,
    platform,
    siteUrl,
    shopDomain,
    storePassword,
    wpSiteUrl,
    wpApiKey,
    wpStep,
    orgId,
    prompts,
    appInstalled,
  ]);

  function handleCompanyNext(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError("");
    setStep("platform");
  }

  function handlePlatformSelect(p: Platform) {
    setPlatform(p);
    setError("");
    setShopDomainErr("");
    setWpUrlErr("");
    setStep("url");
  }

  // Step 3: Save URL + create org, move to install step
  async function handleUrlNext(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setLoading(true);
    setError("");
    setStatusMsg("Setting up project...");
    const email = session.user.email;

    try {
      let url: string;
      if (platform === "shopify") {
        const domain = shopDomain
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")
          .trim();
        const domainInvalid =
          !domain ||
          !/^[a-zA-Z0-9][a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}$/.test(domain) ||
          !domain.includes(".");
        if (domainInvalid) {
          setError("Please use a valid domain (e.g. your-store.myshopify.com).");
          setLoading(false);
          setStatusMsg("");
          return;
        }
        url = `https://${domain}`;
      } else {
        url = wpSiteUrl.trim();
        if (!url.startsWith("http")) url = `https://${url}`;
        let urlInvalid = false;
        try {
          const parsed = new URL(url);
          if (!parsed.hostname.includes(".")) urlInvalid = true;
        } catch {
          urlInvalid = true;
        }
        if (urlInvalid) {
          setError("Please use a valid URL (e.g. yoursite.com).");
          setLoading(false);
          setStatusMsg("");
          return;
        }
      }
      setSiteUrl(url);

      // Create org
      let org;
      try {
        org = await createOrganization({ name: companyName.trim(), url, email });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) org = err.response.data;
        else throw err;
      }
      setOrgId(org?.id);

      if (
        platform === "shopify" ||
        platform === "wordpress" ||
        platform === "framer" ||
        platform === "nextjs"
      ) {
        // Shopify (OAuth), WordPress (plugin), Framer (paste plugin URL),
        // Next.js (npm install + env key) all have real install steps.
        // Webflow falls through to prompts for now — data-client not deployed.
        setStep("install");
      } else {
        if (prompts.length === 0) genPrompts(companyName.trim(), url);
        setStep("prompts");
      }
    } catch (err) {
      // Plan-limit 403 → bounce to /pricing so user can upgrade
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("");
        setStatusMsg("");
        setLoading(false);
        router.push(`/pricing?returnTo=${encodeURIComponent(routes.onboardingCompanyInfo)}`);
        return;
      }
      const msg = fmtErr(err);
      setError(
        msg === "Failed. Please try again."
          ? platform === "shopify"
            ? "Please use a valid Shopify domain (e.g. your-store.myshopify.com)."
            : "Please use a valid URL (e.g. yoursite.com)."
          : msg,
      );
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  }

  // Shopify: redirect to install app via OAuth
  async function handleShopifyInstall() {
    if (!session) return;
    setLoading(true);
    setError("");
    setStatusMsg("Redirecting to Shopify...");
    const email = session.user.email;
    const domain = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");

    try {
      // Save state before redirect
      sessionStorage.setItem(
        "signalor_onboarding",
        JSON.stringify({
          companyName: companyName.trim(),
          orgId,
          siteUrl,
          shopDomain: domain,
        }),
      );

      // Get OAuth URL from backend (this also creates the Integration)
      const resp = await getShopifyAuthUrl(
        email,
        domain,
        "/onboarding/company-info?shopify=installed",
        orgId ?? undefined,
        storePassword || undefined,
      );

      if (!resp.auth_url) {
        setError("No auth URL returned. Check backend configuration.");
        setLoading(false);
        setStatusMsg("");
        return;
      }

      window.location.href = resp.auth_url;
    } catch (err) {
      setError(fmtErr(err));
      setLoading(false);
      setStatusMsg("");
    }
  }

  // WordPress: connect after plugin installed
  async function handleWordPressConnect() {
    if (!session) return;
    setLoading(true);
    setError("");
    setStatusMsg("Connecting WordPress...");
    try {
      await connectWordPress(session.user.email, siteUrl, wpApiKey.trim(), "");
      setAppInstalled(true);
      setStep("prompts");
      if (prompts.length === 0) genPrompts(companyName.trim(), siteUrl);
    } catch (err) {
      setError(fmtErr(err));
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  }

  // Skip install step (user can install later)
  function handleSkipInstall() {
    setStep("prompts");
    if (prompts.length === 0) genPrompts(companyName.trim(), siteUrl);
  }

  async function genPrompts(brand: string, url: string) {
    setLoadingPrompts(true);
    try {
      const onboardingToken = await getOrFetchOnboardingToken(turnstileTokenRef.current);
      const r = await fetch(`${config.apiBaseUrl}/api/analyzer/generate-prompts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Onboarding-Token": onboardingToken,
        },
        body: JSON.stringify({ brand_name: brand, brand_url: url }),
      });
      if (r.ok) {
        const d = await r.json();
        setPrompts(d.prompts || []);
      } else
        setPrompts([
          `What are the best ${brand} alternatives?`,
          `Is ${brand} worth it?`,
          `Compare ${brand} with competitors`,
          `What do experts say about ${brand}?`,
          `Best tools similar to ${brand}`,
        ]);
    } catch {
      setPrompts([
        `What are the best ${brand} alternatives?`,
        `Is ${brand} worth it?`,
        `Compare ${brand} with competitors`,
        `What do experts say about ${brand}?`,
        `Best tools similar to ${brand}`,
      ]);
      setError("Couldn't auto-generate prompts — showing defaults. Edit or add your own.");
    } finally {
      setLoadingPrompts(false);
    }
  }

  function rmPrompt(i: number) {
    setPrompts((p) => p.filter((_, j) => j !== i));
  }
  function editPrompt(i: number) {
    setEditingIdx(i);
    setEditText(prompts[i]);
  }
  function saveEdit(i: number) {
    if (editText.trim()) {
      setPrompts((p) => p.map((v, j) => (j === i ? editText.trim() : v)));
    } else {
      setPrompts((p) => p.filter((_, j) => j !== i));
    }
    setEditingIdx(null);
    setEditText("");
  }

  async function handleLaunch() {
    if (!session || !orgId) return;
    const promptList = prompts.map((p) => p.trim()).filter(Boolean);
    if (promptList.length < 1) {
      setError("Add at least one tracking prompt.");
      setStep("prompts");
      return;
    }
    setLoading(true);
    setError("");
    setStatusMsg("Checking plan...");
    try {
      const sub = await getSubscriptionStatus(session.user.email);
      if (!sub.is_active) {
        storePendingAnalysisAfterPayment({
          url: siteUrl,
          run_type: "single_page",
          email: session.user.email,
          brand_name: companyName.trim(),
          org_id: orgId,
          prompts: promptList,
        });
        setStatusMsg("");
        setLoading(false);
        router.push(`/pricing?returnTo=${encodeURIComponent(routes.onboardingCompanyInfo)}`);
        return;
      }
      setStatusMsg("Starting analysis...");
      const a = await startAnalysis({
        url: siteUrl,
        run_type: "single_page",
        email: session.user.email,
        brand_name: companyName.trim(),
        org_id: orgId,
        verify_org_workspace: true,
        prompts: promptList,
      });
      try {
        sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch {
        /**/
      }

      // Fire-and-forget welcome email — don't block the redirect
      import("@/lib/api/client").then(({ apiClient }) => {
        apiClient
          .post("/email/welcome/", {
            email: session.user.email,
            first_name: (session.user.name ?? "").split(" ")[0],
            dashboard_slug: a.slug,
          })
          .catch(() => {});
      });

      router.push(routes.dashboardProject(a.slug));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        storePendingAnalysisAfterPayment({
          url: siteUrl,
          run_type: "single_page",
          email: session.user.email,
          brand_name: companyName.trim(),
          org_id: orgId,
          prompts: promptList,
        });
        setError("");
        setStatusMsg("");
        setLoading(false);
        router.push(`/pricing?returnTo=${encodeURIComponent(routes.onboardingCompanyInfo)}`);
        return;
      }
      setError(fmtErr(err));
      setStatusMsg("");
      setLoading(false);
    }
  }

  const totalSteps = STEP_ORDER.length;
  const sn = STEP_ORDER.indexOf(step) + 1;

  if (isPending || !session) {
    return (
      <div aria-busy="true" aria-live="polite">
        <div className="relative mb-5">
          <OnboardingStepper current={sn} total={totalSteps} />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground">
            {sn}/{totalSteps}
          </span>
        </div>
        <CardContent className="flex flex-col items-center justify-center gap-3 px-0 py-14">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-[12px] text-muted-foreground">One moment</p>
        </CardContent>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-5">
        <OnboardingStepper current={sn} total={totalSteps} />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground">
          {sn}/{totalSteps}
        </span>
      </div>
      <div className="mb-3 flex flex-col items-center gap-1.5">
        <TurnstileWidget
          onToken={(t) => {
            turnstileTokenRef.current = t;
          }}
        />
      </div>
      <CardContent className="space-y-4 px-0 pt-5">
        {atLimitNotice ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900">
            <p className="font-medium">
              You&rsquo;re at the project limit for {atLimitNotice.planLabel}.
            </p>
            <p className="mt-0.5 text-amber-800">
              Remove a project from{" "}
              <Link href={routes.dashboard} className="font-semibold underline hover:no-underline">
                your dashboard
              </Link>{" "}
              before adding a new one, or contact support to raise your cap.
            </p>
          </div>
        ) : null}

        {/* ── Step 1: Company ── */}
        {step === "company" && (
          <form onSubmit={handleCompanyNext} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-company" className="text-[12px] font-medium">
                Company name
              </Label>
              <Input
                id="onboarding-company"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                autoFocus
                className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
              />
            </div>
            {error ? <p className={ERR_BOX}>{error}</p> : null}
            <Button
              type="submit"
              disabled={!companyName.trim()}
              className="auth-cta-btn h-9 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* ── Step 2: Platform ── */}
        {step === "platform" && (
          <div className="space-y-3">
            <div className="space-y-3">
              {[
                {
                  id: "shopify" as Platform,
                  label: "Shopify",
                  desc: "Connect via app install",
                  icon: (
                    <img
                      src="/logos/shopify.svg"
                      alt="Shopify"
                      className="h-7 w-7 object-contain"
                    />
                  ),
                  wrap: "bg-[#96bf48]/10",
                },
                {
                  id: "wordpress" as Platform,
                  label: "WordPress",
                  desc: "Connect via plugin",
                  icon: (
                    <img
                      src="/logos/wordpress.svg"
                      alt="WordPress"
                      className="h-7 w-7 object-contain"
                    />
                  ),
                  wrap: "bg-[#21759b]/10",
                },
                {
                  id: "webflow" as Platform,
                  label: "Webflow",
                  desc: "Run analysis by URL",
                  icon: (
                    <img
                      src="/logos/webflow.svg"
                      alt="Webflow"
                      className="h-7 w-7 object-contain"
                    />
                  ),
                  wrap: "bg-[#146EF5]/10",
                },
                {
                  id: "framer" as Platform,
                  label: "Framer",
                  desc: "Run analysis by URL",
                  icon: (
                    <img src="/logos/framer.svg" alt="Framer" className="h-7 w-7 object-contain" />
                  ),
                  wrap: "bg-[#0055FF]/10",
                },
                {
                  id: "nextjs" as Platform,
                  label: "Next.js",
                  desc: "Install the SDK on your app",
                  icon: (
                    <img src="/logos/nextjs.svg" alt="Next.js" className="h-7 w-7 object-contain" />
                  ),
                  wrap: "bg-neutral-900/5",
                },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlatformSelect(p.id)}
                  className="flex w-full items-center gap-4 rounded-xl border border-black/8 bg-white p-4 text-left shadow-[0_2px_14px_rgba(0,0,0,0.045)] transition hover:border-black/12 hover:bg-neutral-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${p.wrap}`}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{p.label}</p>
                    <p className="text-[12px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-md border-neutral-200 bg-white text-[13px] font-medium"
              onClick={() => setStep("company")}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        )}

        {/* ── Step 3: Enter URL ── */}
        {step === "url" && platform === "shopify" && (
          <form onSubmit={handleUrlNext} className="space-y-5">
            <div>
              <IntegrationConnectBanner platform={platform} />
              <div className="text-center">
                <p className="text-[15px] font-semibold text-foreground">
                  Connect your Shopify store
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  Enter your store domain to start GEO analysis and enable auto-fixes.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                id="onboarding-shop-domain"
                placeholder="your-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => {
                  setShopDomain(e.target.value);
                  if (shopDomainErr) setShopDomainErr("");
                }}
                onBlur={() => {
                  const d = shopDomain
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "")
                    .trim();
                  if (!d.includes(".") || !/^[a-zA-Z0-9][a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}$/.test(d))
                    setShopDomainErr("Please use a valid domain (e.g. your-store.myshopify.com)");
                }}
                required
                autoFocus
                className={`h-9 rounded-md bg-white text-[13px] ${shopDomainErr ? "border-destructive focus-visible:ring-destructive/20" : "border-neutral-200"}`}
              />
              {shopDomainErr && <p className="text-[11px] text-destructive">{shopDomainErr}</p>}
              <Input
                id="onboarding-store-password"
                type="password"
                placeholder="Storefront password (optional)"
                value={storePassword}
                onChange={(e) => setStorePassword(e.target.value)}
                className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
              />
            </div>
            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("platform");
                  setOrgId(null);
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !shopDomain.trim()}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "url" && platform !== "shopify" && (
          <form onSubmit={handleUrlNext} className="space-y-5">
            <div>
              <IntegrationConnectBanner platform={platform} />
              <div className="text-center">
                <p className="text-[15px] font-semibold text-foreground">
                  {platform === "wordpress" && "Enter your WordPress URL"}
                  {platform === "webflow" && "Enter your Webflow URL"}
                  {platform === "framer" && "Enter your Framer site URL"}
                  {platform === "nextjs" && "Enter your Next.js site URL"}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {platform === "wordpress" &&
                    "We'll connect your site via the Signalor plugin after verifying your URL."}
                  {platform === "webflow" &&
                    "We'll run GEO analysis directly — no plugin required for Webflow."}
                  {platform === "framer" &&
                    "We'll verify your site before connecting via the Framer plugin."}
                  {platform === "nextjs" &&
                    "We'll verify your site before generating your SDK API key."}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                id="onboarding-wp-url"
                placeholder="yoursite.com"
                value={wpSiteUrl}
                onChange={(e) => {
                  setWpSiteUrl(e.target.value);
                  if (wpUrlErr) setWpUrlErr("");
                }}
                onBlur={() => {
                  const raw = wpSiteUrl.trim();
                  if (!raw) return;
                  const url = raw.startsWith("http") ? raw : `https://${raw}`;
                  let invalid = false;
                  try {
                    const parsed = new URL(url);
                    if (!parsed.hostname.includes(".")) invalid = true;
                  } catch {
                    invalid = true;
                  }
                  if (invalid) setWpUrlErr("Please use a valid URL (e.g. yoursite.com)");
                }}
                required
                autoFocus
                className={`h-9 rounded-md bg-white text-[13px] ${wpUrlErr ? "border-destructive focus-visible:ring-destructive/20" : "border-neutral-200"}`}
              />
              {wpUrlErr && <p className="text-[11px] text-destructive">{wpUrlErr}</p>}
            </div>
            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("platform");
                  setOrgId(null);
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !wpSiteUrl.trim()}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 4: Install App ── */}
        {step === "install" && platform === "shopify" && (
          <div className="space-y-4">
            <BrandConnectBanner siteUrl={shopDomain} />
            <div className="text-center">
              <p className="text-[15px] font-semibold text-foreground">
                Install Signalor on Shopify
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Connecting{" "}
                <span className="font-medium text-foreground">
                  {shopDomain.replace(/^https?:\/\//, "").replace(/\.myshopify\.com$/, "")}
                </span>{" "}
                — auto-fixes, schema injection &amp; AI meta tags.
              </p>
            </div>

            <div className={`${PANEL} p-5`}>
              <div className="mb-5 space-y-3">
                {[
                  "Auto-fix SEO & GEO issues directly on your store",
                  "Inject JSON-LD schema markup automatically",
                  "Add AI crawler meta tags for better visibility",
                  "Generate and serve llms.txt for AI discovery",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-[12px] text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={handleShopifyInstall}
                disabled={loading}
                className="auth-cta-btn flex h-9 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to Shopify…
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" /> Install on Shopify
                  </>
                )}
              </Button>
            </div>

            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  sessionStorage.removeItem("signalor_onboarding");
                  setStep("url");
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                onClick={handleSkipInstall}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {step === "install" && platform === "wordpress" && (
          <div className="space-y-4">
            <BrandConnectBanner siteUrl={wpSiteUrl} />
            <div className="text-center">
              <p className="text-[15px] font-semibold text-foreground">
                Install the Signalor plugin
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Three quick steps to connect your WordPress site.
              </p>
            </div>
            <div className="space-y-3">
              <div className={`${PANEL} p-4`}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-white">
                    1
                  </span>
                  <p className="text-[13px] font-medium text-foreground">Download the plugin</p>
                </div>
                <a
                  href={signalorWpPlugin.zipPath}
                  download
                  onClick={() => setTimeout(() => setWpStep(2), 500)}
                  className="flex w-full items-center justify-center gap-2 bg-muted py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/5"
                >
                  <Download className="h-3.5 w-3.5" /> Download signalor-geo.zip
                </a>
              </div>

              {wpStep >= 2 && (
                <div className={`${PANEL} p-4`}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-white">
                      2
                    </span>
                    <p className="text-[13px] font-medium text-foreground">
                      Upload & activate in WordPress
                    </p>
                  </div>
                  <a
                    href={`${siteUrl.replace(/\/$/, "")}/wp-admin/plugin-install.php?tab=upload`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setWpStep(3), 1000)}
                    className="flex w-full items-center justify-center gap-2 bg-muted py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open WP Plugin Upload
                  </a>
                </div>
              )}

              {wpStep >= 3 && (
                <div className={`${PANEL} p-4`}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-white">
                      3
                    </span>
                    <p className="text-[13px] font-medium text-foreground">Paste the API key</p>
                  </div>
                  <Input
                    type="text"
                    placeholder="API key from Settings > Signalor GEO"
                    value={wpApiKey}
                    onChange={(e) => setWpApiKey(e.target.value)}
                    className="h-9 rounded-md border-neutral-200 bg-white font-mono text-[13px]"
                  />
                </div>
              )}
            </div>

            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("url");
                  setError("");
                  setWpStep(1);
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {wpStep >= 3 && wpApiKey.trim() ? (
                <Button
                  type="button"
                  onClick={handleWordPressConnect}
                  disabled={loading}
                  className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
                    </>
                  ) : (
                    <>
                      Connect <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                  onClick={handleSkipInstall}
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "install" && platform === "framer" && (
          <div className="space-y-4">
            <BrandConnectBanner siteUrl={wpSiteUrl} />
            <div className="text-center">
              <p className="text-[15px] font-semibold text-foreground">Open the Signalor plugin</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Add the plugin URL in Framer to verify your site connection.
              </p>
            </div>
            <div className={`${PANEL} p-4`}>
              <ol className="mb-3 list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed text-muted-foreground">
                <li>
                  In Framer&rsquo;s main menu, open{" "}
                  <span className="font-medium text-foreground">Plugins</span> and enable{" "}
                  <span className="font-medium text-foreground">Developer Tools</span>.
                </li>
                <li>
                  From the project toolbar, open the{" "}
                  <span className="font-medium text-foreground">Plugins</span> menu →{" "}
                  <span className="font-medium text-foreground">Open Development Plugin</span>.
                </li>
                <li>Paste the URL below and accept the local certificate warning.</li>
              </ol>

              <div className="flex gap-2">
                <Input
                  readOnly
                  value={config.framerPluginInstallUrl}
                  className="h-9 flex-1 rounded-md border-neutral-200 bg-white font-mono text-[12px]"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-md border-neutral-200 bg-white px-3 text-[12px] font-medium"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(config.framerPluginInstallUrl);
                      setFramerUrlCopied(true);
                      setTimeout(() => setFramerUrlCopied(false), 2000);
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  {framerUrlCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </Button>
              </div>

              <a
                href="https://www.framer.com/developers/plugins-quick-start#opening-in-framer"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" /> Framer docs: opening a development plugin
              </a>
            </div>

            {error ? <p className={ERR_BOX}>{error}</p> : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("url");
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (prompts.length === 0) genPrompts(companyName.trim(), siteUrl);
                  setStep("prompts");
                }}
              >
                Skip for now
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setAppInstalled(true);
                  if (prompts.length === 0) genPrompts(companyName.trim(), siteUrl);
                  setStep("prompts");
                }}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                I&rsquo;ve installed it <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "install" && platform === "nextjs" && (
          <div className="space-y-4">
            <BrandConnectBanner siteUrl={wpSiteUrl} />
            <div className="text-center">
              <p className="text-[15px] font-semibold text-foreground">Install @signalor/nextjs</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Four files, zero runtime deps — schema injection, llms.txt &amp; deploy hooks.
              </p>
            </div>
            <NextJsInstall
              apiKey={nextjsApiKey}
              apiKeyError={nextjsKeyError}
              minting={mintingNextjsKey}
              copied={nextjsCopied}
              onCopy={(label, text) =>
                navigator.clipboard
                  .writeText(text)
                  .then(() => {
                    setNextjsCopied(label);
                    setTimeout(() => setNextjsCopied(null), 2000);
                  })
                  .catch(() => {})
              }
              onBack={() => {
                setStep("url");
                setError("");
              }}
              onSkip={() => {
                if (prompts.length === 0) genPrompts(companyName.trim(), siteUrl);
                setStep("prompts");
              }}
              onContinue={() => {
                setAppInstalled(true);
                if (prompts.length === 0) genPrompts(companyName.trim(), siteUrl);
                setStep("prompts");
              }}
            />
          </div>
        )}

        {/* ── Step 5: Prompts ── */}
        {step === "prompts" && (
          <div className="space-y-3">
            <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-muted-foreground">
              Brand
              {siteUrl && <SiteFavicon url={siteUrl} />}
              <span className="font-medium text-foreground">{companyName}</span>
            </p>

            {loadingPrompts ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-[12px] text-muted-foreground">Generating prompts…</p>
              </div>
            ) : (
              <>
                <div className={PANEL}>
                  {prompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className={[
                        "group relative h-[44px]",
                        idx === 0 ? "rounded-t-xl" : "border-t border-border",
                        idx === prompts.length - 1 ? "rounded-b-xl" : "",
                      ].join(" ")}
                    >
                      {editingIdx === idx ? (
                        /* Edit mode */
                        <div className="flex h-full items-center gap-2 px-4">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="h-8 flex-1 rounded-md border-neutral-200 bg-white text-[13px]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(idx);
                              if (e.key === "Escape") setEditingIdx(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            className="px-2 text-[12px] font-medium text-foreground hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Idle row, fixed height, single line with ellipsis */}
                          <div className="flex h-full items-center gap-3 px-4">
                            <span className="w-4 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                              {idx + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                              {prompt}
                            </span>
                          </div>

                          {/* Hover card, absolutely positioned, floats over rows, zero layout shift */}
                          <div
                            className={[
                              "absolute inset-x-0 top-0 z-20",
                              "flex items-start gap-3 px-4 py-3",
                              "rounded-xl border border-black/8 bg-white",
                              "shadow-[0_8px_24px_rgba(0,0,0,0.11)]",
                              "pointer-events-none opacity-0 scale-[0.96] origin-top",
                              "group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100",
                              "transition-[opacity,transform] duration-200 ease-out",
                            ].join(" ")}
                          >
                            <span className="mt-px w-4 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                              {idx + 1}
                            </span>
                            <span className="flex-1 text-[13px] leading-snug text-foreground">
                              {prompt}
                            </span>
                            <div className="flex shrink-0 gap-0">
                              <button
                                type="button"
                                onClick={() => editPrompt(idx)}
                                className="rounded p-1 transition hover:bg-muted"
                                aria-label="Edit prompt"
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button
                                type="button"
                                onClick={() => rmPrompt(idx)}
                                className="rounded p-1 transition hover:bg-red-50"
                                aria-label="Remove prompt"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={prompts.length >= 15}
                  onClick={() => {
                    if (prompts.length < 15) {
                      setPrompts((p) => [...p, ""]);
                      setEditingIdx(prompts.length);
                      setEditText("");
                    }
                  }}
                  className="mb-2 flex h-9 w-full items-center gap-2 rounded-md border-dashed border-neutral-200 bg-white text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" /> Add prompt
                </Button>
              </>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => setStep("install")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep("analytics")}
                disabled={loadingPrompts || prompts.filter(Boolean).length === 0}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 6: Google Analytics ── */}
        {step === "analytics" && (
          <div className="space-y-3">
            <div className={`${PANEL} p-5`}>
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                  <img
                    src="/logos/google-analytics.svg"
                    alt="Google Analytics"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-medium text-foreground">Google Analytics</p>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    See how much traffic AI engines send to your site. Track referrals from ChatGPT,
                    Gemini, Perplexity, and more.
                  </p>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                {[
                  "Track AI referral traffic (ChatGPT, Perplexity, etc.)",
                  "Measure organic vs AI-driven sessions",
                  "Monitor conversion impact from AI visibility",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-[12px] text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => {
                  // TODO: implement GA OAuth connect
                  setStep("launch");
                }}
                className="auth-cta-btn flex h-9 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                <ExternalLink className="h-4 w-4" /> Connect Google Analytics
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => setStep("prompts")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setStep("launch")}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 7: Launch ── */}
        {step === "launch" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <span>Site</span>
              <SiteFavicon url={siteUrl} />
              <span className="font-medium text-foreground">
                {siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </span>
            </div>

            <div className={`mb-2 overflow-hidden ${PANEL}`}>
              {[
                { k: "Brand", v: companyName },
                { k: "Platform", v: platform.charAt(0).toUpperCase() + platform.slice(1) },
                { k: "App Installed", v: appInstalled ? "Yes" : "Not yet" },
                { k: "Prompts", v: `${prompts.length} tracked` },
              ].map((r, i) => (
                <div
                  key={r.k}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="text-[12px] text-muted-foreground">{r.k}</span>
                  <span
                    className={`text-[12px] font-medium ${r.k === "App Installed" && !appInstalled ? "text-amber-500" : "text-foreground"}`}
                  >
                    {r.v}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-2 flex flex-wrap justify-center gap-2">
              {["Content", "Schema", "E-E-A-T", "Technical", "Entity", "AI Visibility"].map((n) => (
                <span
                  key={n}
                  className="rounded-md border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium tracking-tight text-muted-foreground"
                >
                  {n}
                </span>
              ))}
            </div>

            {error ? <p className={`${ERR_BOX} text-center`}>{error}</p> : null}
            {statusMsg ? (
              <p className={`${STATUS_BOX} justify-center`} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={handleLaunch}
              disabled={loading}
              className="auth-cta-btn h-10 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Launch analysis
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              className="h-9 w-full text-[13px] text-muted-foreground hover:text-foreground"
              onClick={() => setStep("analytics")}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-black/6 px-0 pb-0 pt-6">
        <p className="text-center text-[12px] text-muted-foreground">
          Different account?{" "}
          <Link
            href={routes.signIn}
            className="font-medium text-foreground underline decoration-neutral-300 underline-offset-2 hover:decoration-foreground"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </div>
  );
}
