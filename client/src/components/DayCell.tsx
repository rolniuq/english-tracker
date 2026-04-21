import { Session } from '../types';

interface DayCellProps {
  date: string;
  day: number;
  session: Session | null;
  isCurrentMonth: boolean;
  onClick: (date: string) => void;
}

export function DayCell({ date, day, session, isCurrentMonth, onClick }: DayCellProps) {
  const isLearned = session?.attended === 1;
  const isOff = session?.is_off === 1;
  const hasData = session && (session.notes || (session as any).attachments?.length > 0);

  let className = 'day-cell';
  if (!isCurrentMonth) {
    className += ' other-month';
  } else if (isLearned) {
    className += ' learned';
  } else if (isOff) {
    className += ' off';
  } else if (hasData) {
    className += ' has-data';
  }

  return (
    <button className={className} onClick={() => onClick(date)}>
      <span className="day-number">{day}</span>
      {isLearned && <span className="day-label learned-label">Learned</span>}
      {isOff && <span className="day-label off-label">Off</span>}
    </button>
  );
}