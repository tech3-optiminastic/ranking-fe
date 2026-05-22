import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { ScreenHR } from "@/components/ui/intersection-diamonds";

export function LandingCreatorsProgram() {
  return (
    <section
      className="relative overflow-hidden bg-transparent"
      aria-labelledby="landing-creators-program-heading"
    >
      <ScreenHR />

      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-12 text-center lg:px-8 lg:py-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ creators program ]
        </p>

        <h2
          id="landing-creators-program-heading"
          className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
        >
          Ready to share{" "}
          <span className="relative whitespace-nowrap text-primary">
            Signalor
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
          ?
        </h2>

        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-neutral-500">
          Get your link in 30 seconds. Your audience saves 10% — you earn 20% per signup.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/creator/sign-up?returnTo=%2Fcreators-program%2Fapply"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Join the program
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/creators-program"
            className="inline-flex h-11 items-center rounded-md border border-black/12 bg-white px-5 text-[13px] font-semibold text-foreground transition hover:bg-neutral-50"
          >
            Learn more
          </Link>
        </div>
      </div>

      <ScreenHR />
    </section>
  );
}
