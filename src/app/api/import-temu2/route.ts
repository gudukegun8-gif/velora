import { NextResponse } from "next/server";
// Retired one-time import route (batch 2 done 2026-10-02). Keep as 410 to avoid leaking secrets.
export async function GET() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}
