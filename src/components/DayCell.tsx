"use client";

import type { Session } from "@/lib/types";
import { STUDY_DAYS } from "@/lib/config";

interface DayCellProps {
  date: string;
  day: number;
  session: Session | null;
  isCurrentMonth: boolean;
  onClick: (date: string) => void;
}

export function DayCell({
  date,
  day,
  session,
  isCurrentMonth,
  onClick,
}: DayCellProps) {
  const isLearned = session?.attended === 1;
  const isSwitched = session?.is_switched === 1;
  const isOff = session?.is_off === 1;
  const hasData = session && session.notes;
  const dateObj = new Date(date + "T00:00:00");
  const isStudyDay = STUDY_DAYS.includes(dateObj.getDay());

  let className = "day-cell";
  if (!isCurrentMonth) {
    className += " other-month";
  } else if (isLearned) {
    className += " learned";
  } else if (isSwitched) {
    className += " switched";
  } else if (isOff) {
    className += " off";
  } else if (hasData) {
    className += " has-data";
  } else if (isStudyDay) {
    className += " study-day";
  }

  return (
    <button className={className} onClick={() => onClick(date)}>
      <span className="day-number">{day}</span>
      {isLearned && <span className="day-label learned-label">Learned</span>}
      {isSwitched && <span className="day-label switched-label">Switched</span>}
      {isOff && <span className="day-label off-label">Off</span>}
    </button>
  );
}
