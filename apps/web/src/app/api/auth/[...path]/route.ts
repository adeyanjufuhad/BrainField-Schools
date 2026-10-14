import { NextRequest, NextResponse } from "next/server";
import { getNeonAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const auth = getNeonAuth();
  if (!auth) return NextResponse.json({ error: "School authentication is not configured yet." }, { status: 503, headers: { "Cache-Control": "no-store" } });

  // School accounts are provisioned through a later invitation workflow.
  if (request.nextUrl.pathname.includes("/sign-up")) {
    return NextResponse.json({ error: "Please contact the school for an account." }, { status: 403 });
  }
  const handlers = auth.handler();
  return request.method === "POST" ? handlers.POST(request, context) : handlers.GET(request, context);
}

export const GET = handle;
export const POST = handle;
