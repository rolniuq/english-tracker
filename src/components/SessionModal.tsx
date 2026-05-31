"use client";

import { useState, useRef } from "react";
import type { SessionWithAttachments, Attachment } from "@/lib/types";

interface SessionModalProps {
  date: string;
  session: SessionWithAttachments | null;
  onClose: () => void;
  onSave: (attended: number, isOff: number, notes: string) => void;
  onRefresh: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function SessionModal({
  date,
  session,
  onClose,
  onSave,
  onRefresh,
}: SessionModalProps) {
  const [attended, setAttended] = useState(session?.attended === 1);
  const [isOff, setIsOff] = useState(session?.is_off === 1);
  const [notes, setNotes] = useState(session?.notes || "");
  const [attachments, setAttachments] = useState<Attachment[]>(
    session?.attachments || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = () => {
    onSave(attended ? 1 : 0, isOff ? 1 : 0, notes);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("date", date);

      const res = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const attachment = await res.json();
      setAttachments((prev) => [...prev, attachment]);
      onRefresh();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/attachments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete attachment");

      setAttachments((prev) => prev.filter((a) => a.id !== id));
      onRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formatDate(date)}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="attendance-section">
            <label>Status:</label>
            <div className="attendance-buttons">
              <button
                className={`attended-btn ${attended ? "active" : ""}`}
                onClick={() => {
                  setAttended(!attended);
                  if (!attended) setIsOff(false);
                }}
              >
                Learned
              </button>
              <button
                className={`off-btn ${isOff ? "active" : ""}`}
                onClick={() => {
                  setIsOff(!isOff);
                  if (!isOff) setAttended(false);
                }}
              >
                Off
              </button>
            </div>
          </div>

          <div className="notes-section">
            <label>Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
            />
          </div>

          <div className="attachments-section">
            <label>Attachments:</label>
            <div className="attachments-list">
              {attachments.map((file) => (
                <div key={file.id} className="attachment-item">
                  <a
                    href={`/api/attachments/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-link"
                  >
                    {file.filename} ({formatFileSize(file.size)})
                  </a>
                  <button
                    className="delete-file-btn"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {attachments.length === 0 && (
                <p className="no-attachments">No attachments</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <span>Uploading...</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
