export interface Session {
  id: number;
  date: string;
  attended: number;
  is_off: number;
  notes: string;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  session_id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploaded_at: string;
}

export interface SessionWithAttachments extends Session {
  attachments: Attachment[];
}