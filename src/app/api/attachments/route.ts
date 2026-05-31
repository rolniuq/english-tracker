import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  createAttachment,
  deleteAttachment,
} from "@/lib/storage";

const UPLOADS_DIR = path.join(process.cwd(), "data", "attachments");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const date = formData.get("date") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const dateDir = path.join(UPLOADS_DIR, date);
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filepath = path.join(dateDir, filename);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(bytes));

    const attachment = createAttachment(
      date,
      file.name,
      filename,
      file.type,
      file.size
    );

    return NextResponse.json(attachment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = deleteAttachment(id);
    if (!deleted) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
