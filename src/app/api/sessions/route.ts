import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { Session } from "@/lib/types";

const KV_KEY = "sessions";

async function readSessions(): Promise<Session[]> {
  try {
    const data = await kv.get<Session[]>(KV_KEY);
    return data ?? [];
  } catch {
    return [];
  }
}

async function writeSessions(sessions: Session[]) {
  await kv.set(KV_KEY, sessions);
}

export async function GET() {
  const sessions = await readSessions();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const sessions: Session[] = await request.json();
  await writeSessions(sessions);
  return NextResponse.json({ success: true });
}
