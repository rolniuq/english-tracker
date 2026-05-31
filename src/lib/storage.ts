import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";
import type { Session, SessionWithAttachments, Attachment } from "./types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const SESSIONS_KEY = "sessions";

export async function getAllSessions(): Promise<Session[]> {
  const sessions = await redis.hgetall<Record<string, Session>>(SESSIONS_KEY);
  if (!sessions) return [];
  return Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getSessionByDate(date: string): Promise<SessionWithAttachments | null> {
  const session = await redis.hget<Session>(SESSIONS_KEY, date);
  if (!session) return null;

  const attachments = await getAttachmentsByDate(date);
  return { ...session, attachments };
}

export async function createOrUpdateSession(
  date: string,
  attended: number = 0,
  isOff: number = 0,
  notes: string = ""
): Promise<Session> {
  const existing = await redis.hget<Session>(SESSIONS_KEY, date);
  const now = new Date().toISOString();

  const session: Session = {
    date,
    attended,
    is_off: isOff,
    notes,
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  await redis.hset(SESSIONS_KEY, { [date]: session });
  return session;
}

export async function deleteSession(date: string): Promise<void> {
  await redis.hdel(SESSIONS_KEY, date);
  await redis.del(`attachments:${date}`);
}

async function getAttachmentsByDate(date: string): Promise<Attachment[]> {
  const attachments = await redis.hgetall<Record<string, Attachment>>(`attachments:${date}`);
  if (!attachments) return [];
  return Object.values(attachments);
}

export async function createAttachment(
  date: string,
  filename: string,
  fileContent: string,
  mimetype: string,
  size: number
): Promise<Attachment> {
  const attachment: Attachment = {
    id: uuidv4(),
    session_date: date,
    filename,
    filepath: fileContent,
    mimetype,
    size,
    uploaded_at: new Date().toISOString(),
  };

  await redis.hset(`attachments:${date}`, { [attachment.id]: attachment });
  return attachment;
}

export async function getAttachmentById(id: string): Promise<Attachment | null> {
  const keys = await redis.keys("attachments:*");
  for (const key of keys) {
    const attachments = await redis.hgetall<Record<string, Attachment>>(key);
    if (attachments) {
      const found = Object.values(attachments).find((a) => a.id === id);
      if (found) return found;
    }
  }
  return null;
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const keys = await redis.keys("attachments:*");
  for (const key of keys) {
    const attachments = await redis.hgetall<Record<string, Attachment>>(key);
    if (attachments && attachments[id]) {
      await redis.hdel(key, id);
      return true;
    }
  }
  return false;
}

export async function getAttachmentFileContent(id: string): Promise<string | null> {
  const attachment = await getAttachmentById(id);
  if (!attachment) return null;
  return attachment.filepath;
}
