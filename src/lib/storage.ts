import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Session, SessionWithAttachments, Attachment } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const ATTACHMENTS_DIR = path.join(DATA_DIR, "attachments");

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ATTACHMENTS_DIR)) {
    fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
  }
}

function readSessionsFile(): Record<string, Session> {
  ensureDirectories();
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, "{}", "utf-8");
    return {};
  }
  const content = fs.readFileSync(SESSIONS_FILE, "utf-8");
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function writeSessionsFile(sessions: Record<string, Session>): void {
  ensureDirectories();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

export function getAllSessions(): Session[] {
  const sessions = readSessionsFile();
  return Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date));
}

export function getSessionByDate(date: string): SessionWithAttachments | null {
  const sessions = readSessionsFile();
  const session = sessions[date];
  if (!session) return null;

  const attachments = getAttachmentsByDate(date);
  return { ...session, attachments };
}

export function createOrUpdateSession(
  date: string,
  attended: number = 0,
  isOff: number = 0,
  notes: string = ""
): Session {
  const sessions = readSessionsFile();
  const now = new Date().toISOString();

  const existing = sessions[date];
  const session: Session = {
    date,
    attended,
    is_off: isOff,
    notes,
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  sessions[date] = session;
  writeSessionsFile(sessions);
  return session;
}

export function deleteSession(date: string): void {
  const sessions = readSessionsFile();
  delete sessions[date];
  writeSessionsFile(sessions);

  const attachmentsDir = path.join(ATTACHMENTS_DIR, date);
  if (fs.existsSync(attachmentsDir)) {
    fs.rmSync(attachmentsDir, { recursive: true, force: true });
  }
}

function getAttachmentsByDate(date: string): Attachment[] {
  const dateDir = path.join(ATTACHMENTS_DIR, date);
  if (!fs.existsSync(dateDir)) return [];

  const indexFile = path.join(dateDir, "index.json");
  if (!fs.existsSync(indexFile)) return [];

  try {
    const content = fs.readFileSync(indexFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveAttachmentsForDate(date: string, attachments: Attachment[]): void {
  const dateDir = path.join(ATTACHMENTS_DIR, date);
  ensureDirectories();
  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }
  const indexFile = path.join(dateDir, "index.json");
  fs.writeFileSync(indexFile, JSON.stringify(attachments, null, 2), "utf-8");
}

export function createAttachment(
  date: string,
  filename: string,
  filepath: string,
  mimetype: string,
  size: number
): Attachment {
  const attachments = getAttachmentsByDate(date);
  const attachment: Attachment = {
    id: uuidv4(),
    session_date: date,
    filename,
    filepath,
    mimetype,
    size,
    uploaded_at: new Date().toISOString(),
  };

  attachments.push(attachment);
  saveAttachmentsForDate(date, attachments);
  return attachment;
}

export function getAttachmentById(id: string): Attachment | null {
  const dates = fs.readdirSync(ATTACHMENTS_DIR);
  for (const date of dates) {
    const attachments = getAttachmentsByDate(date);
    const found = attachments.find((a) => a.id === id);
    if (found) return found;
  }
  return null;
}

export function deleteAttachment(id: string): boolean {
  const dates = fs.readdirSync(ATTACHMENTS_DIR);
  for (const date of dates) {
    const attachments = getAttachmentsByDate(date);
    const index = attachments.findIndex((a) => a.id === id);
    if (index !== -1) {
      const attachment = attachments[index];
      const filePath = path.join(ATTACHMENTS_DIR, date, attachment.filepath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      attachments.splice(index, 1);
      saveAttachmentsForDate(date, attachments);
      return true;
    }
  }
  return false;
}

export function getAttachmentFilePath(id: string): string | null {
  const attachment = getAttachmentById(id);
  if (!attachment) return null;
  const filePath = path.join(ATTACHMENTS_DIR, attachment.session_date, attachment.filepath);
  return fs.existsSync(filePath) ? filePath : null;
}
