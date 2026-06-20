# Study Days Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a config file defining scheduled study days (Mon/Fri/Sat) and show them with a distinct subtle color on the calendar.

**Architecture:** Static config in `src/lib/config.ts` is imported directly by `DayCell.tsx`. No prop threading needed — Calendar.tsx requires no changes. A new CSS class `.day-cell.study-day` renders a light purple background day cells whose day-of-week matches the config and that have no other state (learned/off/data).

**Tech Stack:** TypeScript, Next.js, Tailwind CSS + Custom CSS

## Global Constraints

- Study days color must be subtle and overrideable by learned/off/has-data states
- Config format: array of `getDay()` integers (0=Sun … 6=Sat)

---

### Task 1: Config file + CSS styles

**Files:**
- Create: `src/lib/config.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `STUDY_DAYS: number[]` exported from `src/lib/config.ts`
- Produces: `.day-cell.study-day` CSS class

- [ ] **Step 1: Create `src/lib/config.ts`**

```typescript
export const STUDY_DAYS = [1, 5, 6]; // Mon=1, Fri=5, Sat=6
```

- [ ] **Step 2: Add study-day CSS to `src/app/globals.css`** (after existing `.day-cell.has-data` block)

```css
.day-cell.study-day {
  background: #f3e8ff;
  border-color: #d8b4fe;
}
```

- [ ] **Step 3: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds

---

### Task 2: Update DayCell to apply study-day class

**Files:**
- Modify: `src/components/DayCell.tsx`

**Interfaces:**
- Consumes: `STUDY_DAYS` from `src/lib/config.ts`
- Produces: `study-day` CSS class applied to matching day cells

- [ ] **Step 1: Add import and study-day logic to `DayCell.tsx`**

Current code:
```typescript
import { Session } from "./TrackerApp";
```

New code:
```typescript
import { Session } from "./TrackerApp";
import { STUDY_DAYS } from "@/lib/config";
```

Current class logic:
```typescript
let className = "day-cell";
if (!isCurrentMonth) {
  className += " other-month";
} else if (isLearned) {
  className += " learned";
} else if (isOff) {
  className += " off";
} else if (hasData) {
  className += " has-data";
}
```

New class logic — add study-day check before has-data check:
```typescript
const dateObj = new Date(date + "T00:00:00");
const isStudyDay = STUDY_DAYS.includes(dateObj.getDay());

let className = "day-cell";
if (!isCurrentMonth) {
  className += " other-month";
} else if (isLearned) {
  className += " learned";
} else if (isOff) {
  className += " off";
} else if (hasData) {
  className += " has-data";
} else if (isStudyDay) {
  className += " study-day";
}
```

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds
