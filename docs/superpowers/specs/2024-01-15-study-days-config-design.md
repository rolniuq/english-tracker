# Study Days Config — Design Doc

## Overview
Allow users to configure scheduled study days via a config file. These days show a distinct subtle color on the calendar, separate from "Learned" (green) and "Off" (orange).

## Config File
- **Location**: `src/lib/config.ts`
- **Content**: Exports `STUDY_DAYS` — an array of `getDay()` integers (0=Sun … 6=Sat)
- **Default value**: `[1, 5, 6]` (Monday, Friday, Saturday)

## Visual Priority (highest to lowest)
1. **other-month** — dimmed, lowest opacity
2. **learned** (attended=1) — green background (`#d5f5e3`)
3. **off** (is_off=1) — orange background (`#fdebd0`)
4. **has-data** (notes present, no learn/off) — blue background (`#ebf5fb`)
5. **study-day** (day-of-week matches config, no other state) — light purple

The study-day color is only shown when no other state applies. Learned/off/data colors fully override it so the user's actual attendance status remains the primary signal.

## CSS
- Class: `.day-cell.study-day`
- Background: `#f3e8ff` (light purple)
- Border: `#d8b4fe`

## Data Flow
```
src/lib/config.ts (STUDY_DAYS)
  → Calendar.tsx (reads config, passes to DayCell via props)
    → DayCell.tsx (compares date.getDay() against STUDY_DAYS, applies class)
```

## Changes Required
| File | Change |
|------|--------|
| `src/lib/config.ts` | **New** — export `STUDY_DAYS` |
| `src/components/Calendar.tsx` | Pass `STUDY_DAYS` to `DayCell` |
| `src/components/DayCell.tsx` | Accept `studyDays` prop, add `isStudyDay` check, apply `study-day` class |
| `src/app/globals.css` | Add `.day-cell.study-day` styles |
