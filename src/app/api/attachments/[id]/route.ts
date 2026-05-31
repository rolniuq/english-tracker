import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getAttachmentById, getAttachmentFilePath, deleteAttachment } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachment = getAttachmentById(id);

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const filePath = getAttachmentFilePath(id);
    if (!filePath) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const response = new NextResponse(fileBuffer);

    response.headers.set("Content-Type", attachment.mimetype || "application/octet-stream");
    response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(attachment.filename)}"`);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
