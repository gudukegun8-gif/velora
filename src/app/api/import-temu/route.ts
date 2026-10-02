import { NextResponse } from "next/server";
// This one-time route has been retired.
export async function GET() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}
