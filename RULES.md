# RULES.md - Coding Conventions & Patterns

## Component & Export Rules

- **Named exports only** — `export function Foo()`, never `export default`
- **"use client" directive** — All components in `src/components/` are client components
- **Interface co-location** — Define interfaces in the same file as the component that owns them; import from there
  - Exception: `Session` interface lives in `TrackerApp.tsx` (the owner), imported by `Calendar.tsx`, `DayCell.tsx`, `SessionModal.tsx`
- **Props interface naming** — `{ComponentName}Props` (e.g. `DayCellProps`)

## CSS & Styling Rules

- **No Tailwind classes in JSX** — All styling via CSS class names in `src/app/globals.css`
- **CSS class concatenation** — Use string concatenation (`let className = "base"; if (cond) className += " extra"`)
- **CSS variables** — Use `--background`, `--foreground` for theming
- **Responsive** — Single breakpoint at 600px in globals.css
- **DayCell class priority order** — This order is critical and must be preserved:
  ```
  other-month > learned > off > has-data > study-day
  ```

## Data Flow Rules

- **State owner** — `TrackerApp` is the single source of truth for sessions[]
- **Unidirectional** — Data flows down via props, events flow up via callbacks
- **API pattern** — GET on mount, POST on every save (replaces entire array)
- **SessionModal key** — Always use `key={selectedDate}` to force remount on date change
- **SessionModal mutual exclusion** — `attended` and `isOff` toggle each other off (Learned ⬌ Off)

## Date Handling Rules

- **Always use "T00:00:00"** — `new Date(date + "T00:00:00")` to prevent timezone shifts
- **Format** — `YYYY-MM-DD` everywhere (API, state, KV storage)
- **getDay() mapping** — `0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat`

## Config Rules

- **Centralized config** — `src/lib/config.ts` is the only place for app configuration
- **STUDY_DAYS** — Array of `getDay()` integers; changing this changes which days show purple background

## Error Handling

- **Silent failure** — API calls use try/catch with no user-facing error feedback
- **GET failure** → returns `[]`
- **POST failure** → no throw, no retry

## Import Rules

- **Path aliases** — Use `@/` for all src-relative imports (e.g. `@/lib/config`, `@/components/Calendar`)
- **No relative parent imports** — Never `../components/` — use `@/components/`

## File Organization

- **One component per file** — except when a component is only used within a single parent
- **lib/** — Pure logic, no JSX, no React hooks
- **app/** — Next.js App Router pages, layouts, and API routes
- **components/** — React components only
