# Switch Day & Stats Calculator Design

## Summary
Add a "Switched" session status (third option alongside Learned/Off) and a stats panel below the calendar showing totals for learned, switched, and off days.

## Data Model
Add `is_switched: number` (0 or 1) to the `Session` interface. All three fields (`attended`, `is_off`, `is_switched`) are mutually exclusive — enforced in SessionModal.

```typescript
interface Session {
  date: string;
  attended: number;   // 1 = learned
  is_off: number;     // 1 = off
  is_switched: number; // 1 = switched (study day moved to another day)
  notes: string;
}
```

## UI Changes

### SessionModal
- Third button "Switched" added alongside "Learned" and "Off"
- Toggling any one disables the other two (same pattern)
- Styling: amber/yellow to distinguish from green (learned) and orange (off)

### DayCell
- New `isSwitched` detection: `session?.is_switched === 1`
- New CSS class `.switched` (amber background, amber border)
- Class priority: `other-month > learned > switched > off > has-data > study-day`
- Label: "Switched" in amber

### StatsPanel (new component)
- Rendered below the calendar grid in the main content area
- Shows three counts computed from sessions array:
  - ✅ Learned: X
  - 🔄 Switched: X
  - ❌ Off: X
- Responsive layout matching calendar's container

## Cleanup
- API route `route.ts` — remove duplicate `Session` interface, import shared type from lib
- Layout `layout.tsx` — remove unused Tailwind classes (`h-full`, `flex flex-col`)
- `RULES.md` — update class priority order and mutual exclusion rules
- `AGENTS.md` — document new feature
- `README.md` — add Switched to feature list, update color list

## Files Changed
| File | Change |
|------|--------|
| `src/components/TrackerApp.tsx` | Add `is_switched` to Session; render StatsPanel |
| `src/components/DayCell.tsx` | Add `isSwitched` detection and label |
| `src/components/SessionModal.tsx` | Add third "Switched" button |
| `src/components/StatsPanel.tsx` | **New** — stats display component |
| `src/app/api/sessions/route.ts` | Remove duplicate Session interface; import from shared location |
| `src/app/globals.css` | Add `.switched` and `.switched-label` styles; add `.stats-panel` styles |
| `src/lib/types.ts` | **New** — shared Session interface for both app and API |
| `AGENTS.md` | Document switch day and stats |
| `RULES.md` | Update class priority and mutual exclusion |
| `README.md` | Add Switched status to feature list |

## No API Changes
POST/GET pass through Session arrays unchanged. The existing `writeSessions`/`readSessions` handle the new field automatically.
