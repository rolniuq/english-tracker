"use client";

import type { Session } from "@/lib/types";

interface StatsPanelProps {
  sessions: Session[];
}

export function StatsPanel({ sessions }: StatsPanelProps) {
  const learned = sessions.filter((s) => s.attended === 1).length;
  const switched = sessions.filter((s) => s.is_switched === 1).length;
  const off = sessions.filter((s) => s.is_off === 1).length;

  return (
    <div className="stats-panel">
      <div className="stat stat-learned">
        <span className="stat-icon">&#10003;</span>
        <span className="stat-value">{learned}</span>
        <span className="stat-label">Learned</span>
      </div>
      <div className="stat stat-switched">
        <span className="stat-icon">&#8631;</span>
        <span className="stat-value">{switched}</span>
        <span className="stat-label">Switched</span>
      </div>
      <div className="stat stat-off">
        <span className="stat-icon">&#10007;</span>
        <span className="stat-value">{off}</span>
        <span className="stat-label">Off</span>
      </div>
    </div>
  );
}
