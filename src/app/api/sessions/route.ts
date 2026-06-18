import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Session {
  date: string;
  attended: number;
  is_off: number;
  notes: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "sessions.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readSessions(): Session[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

export async function GET() {
  const sessions = readSessions();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const sessions: Session[] = await request.json();
  writeSessions(sessions);
  return NextResponse.json({ success: true });
}
