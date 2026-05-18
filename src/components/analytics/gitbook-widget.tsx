"use client";

import Script from "next/script";

export function GitBookWidget() {
  return (
    <Script
      src="https://guide.signalor.ai/~gitbook/embed/script.js"
      strategy="afterInteractive"
      onLoad={() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gb = (window as any).GitBook;
        if (typeof gb === "function") {
          gb("configure", {
            button: { label: "Ask AI", icon: "assistant" },
          });
        }
      }}
    />
  );
}
