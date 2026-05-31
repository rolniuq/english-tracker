import { NextRequest, NextResponse } from "next/server";
import { getAllSessions, createOrUpdateSession } from "@/lib/storage";

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, attended, is_off, notes } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const session = await createOrUpdateSession(date, attended || 0, is_off || 0, notes || "");
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}
