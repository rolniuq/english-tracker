import { NextRequest, NextResponse } from "next/server";
import { getAttachmentById, getAttachmentFileContent, deleteAttachment } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachment = await getAttachmentById(id);

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const base64Content = await getAttachmentFileContent(id);
    if (!base64Content) {
      return NextResponse.json({ error: "File content not found" }, { status: 404 });
    }

    const fileBuffer = Buffer.from(base64Content, "base64");
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
    const deleted = await deleteAttachment(id);

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
