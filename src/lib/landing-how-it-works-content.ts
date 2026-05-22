// 4-step "how it works" content for the landing page.
// Each step has a number, a short title, a one-line body, and a key for the
// matching mini-illustration inside `landing-how-it-works.tsx`.

export type HowItWorksStep = {
  n: number;
  title: string;
  body: string;
  illo: "connect" | "audit" | "track" | "ship";
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    n: 1,
    title: "Connect your site",
    body: "Paste your domain. Pick a market. Optionally link Shopify or WordPress. No code.",
    illo: "connect",
  },
  {
    n: 2,
    title: "Run a GEO audit",
    body: "Get a 0–100 score across six pillars: content, schema, E-E-A-T, technical, entity, and AI visibility.",
    illo: "audit",
  },
  {
    n: 3,
    title: "Track prompts & citations",
    body: "We run your prompts weekly on ChatGPT, Claude, Gemini, and Perplexity. Every cited URL is logged.",
    illo: "track",
  },
  {
    n: 4,
    title: "Ship the fix queue",
    body: "Get a ranked fix list. Auto-fix schema and meta on Shopify and WordPress, or hand it to your team.",
    illo: "ship",
  },
];
