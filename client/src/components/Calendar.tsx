import { useMemo, useState } from 'react';
import { Session } from '../types';
import { DayCell } from './DayCell';

interface CalendarProps {
  sessions: Session[];
  onDayClick: (date: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function Calendar({ sessions, onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const sessionMap = useMemo(() => {
    const map = new Map<string, Session>();
    sessions.forEach(s => map.set(s.date, s));
    return map;
  }, [sessions]);

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysArray: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      daysArray.push({
        date: formatDate(prevMonthYear, prevMonth, daysInPrevMonth - i),
        day: daysInPrevMonth - i,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({
        date: formatDate(year, month, i),
        day: i,
        isCurrentMonth: true
      });
    }

    const remaining = 42 - daysArray.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remaining; i++) {
      daysArray.push({
        date: formatDate(nextMonthYear, nextMonth, i),
        day: i,
        isCurrentMonth: false
      });
    }

    return daysArray;
  }, [year, month]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={goToPrevMonth}>&lt; Prev</button>
        <h2>{MONTHS[month]} {year}</h2>
        <button onClick={goToNextMonth}>Next &gt;</button>
      </div>
      <button className="today-btn" onClick={goToToday}>Today</button>
      <div className="calendar-weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="calendar-grid">
        {days.map(({ date, day, isCurrentMonth }) => (
          <DayCell
            key={date}
            date={date}
            day={day}
            session={sessionMap.get(date) || null}
            isCurrentMonth={isCurrentMonth}
            onClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}