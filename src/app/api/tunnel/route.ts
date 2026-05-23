import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const envelope = await req.text();
  const pieces = envelope.split("\n");
  const header = JSON.parse(pieces[0]);
  const dsn = new URL(header.dsn);
  const projectId = dsn.pathname.replace("/", "");

  const sentryUrl = `https://${dsn.host}/api/${projectId}/envelope/`;

  const response = await fetch(sentryUrl, {
    method: "POST",
    body: envelope,
    headers: { "Content-Type": "application/x-sentry-envelope" },
  });

  return new NextResponse(await response.text(), { status: response.status });
}
