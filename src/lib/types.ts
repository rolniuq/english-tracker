export interface Session {
  date: string;
  attended: number;
  is_off: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithAttachments extends Session {
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  session_date: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploaded_at: string;
}
