# /live + exercise DB review (read-only, Thu Oct 15 2026 PT)

Repo: branch **library-cleanup** (not front-splits-routine), HEAD bff73d7, **90 uncommitted changes** in the working tree. `curl localhost:3001/live` gives 200 (49 KB, shell only; the session itself renders client-side from localStorage).

## 1. /live today
- Route: `app/live/page.tsx` → `LiveScreen` → `FrontSplitsPlayer` if a front-splits run is saved, else `LiveWorkout mode="live"` (1226 lines; the same component powers /routines in mode="build"). Catalog comes from `lib/workout-catalog.ts`, which flattens practices into id/weighted/bothSides/dose/repRange.
- Session: built on /routines (day type 40/60, target muscles, bodyweight-only toggle, picked exercises). Stored in `work-out-machine:sessions-v1`; the active session is the one with no `finishedAt`. Finish sets phase "done" plus finishedAt. Unit pref lives in `work-out-machine:workout-prefs-v1` (kg default). Wake lock is held during a session.
- Phases: work → switch (unilateral, right then left) → rest (countdown, +time button) → suggest (add or next) → done.
- Logged per set (`SetLog`): weight?, reps?, seconds?, breaths?, side?, at. What gets logged is decided by `loggingDose()` from profile.dose / exerciseType. There is a hold timer (default 30s) and a breath counter.
- Plan table (`SetPlan`: weight + reps + doneAt only). Columns: Set / Previous / unit / Reps / Done.
- "Last time": `lastSetFor()` prefills inputs and `historyFor().at(-1)` fills the Previous column. History is listed per session.

### Bugs / gaps (priority order)
1. **Plan table overwrites logged sets.** `writePlans()` rebuilds `sets` from plan rows that have doneAt, keeping only weight and reps. Side, seconds and breaths logged through the work/switch flow are lost once a plan row is edited.
2. **Plan rows are always weight × reps.** Holds, stretches, carries and bodyweight moves still get a kg/lb column and the starter "2 × 8 at 2.5 kg / 5 lb" (`starterSets`). There is no seconds/side/band column.
3. **Hardcoded copy "starts at 2 × 8, 5 lb"** appears even in kg and for bodyweight moves.
4. **"Previous" shows the OLDEST session.** `upsertSession` puts sessions newest-first, so `historyFor().at(-1)` is the first-ever session.
5. **Last-time prefill ignores side and active state.** `lastSetFor` returns the last set of the newest session, which can be the unfinished current session. For unilateral moves it's the left set only, and the right prefill comes from the left.
6. **Rest is fixed at 75s.** `defaultRestSeconds` from exercises.json (0–120) is never used.
7. **No unit on SetLog.** Switching kg↔lb reinterprets all history.
8. **`weighted` inferred from equipment.** inverted-row and hip-thrust are tagged barbell, so they're treated as weighted. Exercises that have optional dumbbells (split-squat, lunges, calf-raise) are profiled "bodyweight", so their added load is never asked for.
9. No set targets from data (`suggestedSetCount` is a heuristic). No distance for carries. No assist/added load. No band level. No RPE or notes.
10. A front-splits run in storage takes over /live entirely, with no way back to the lift session from the page.

## 2. Exercise DB structure
Sources: `soft-body.ts` (17), `strength.ts` (9), `strength-staples.ts` (17) give 43 hand-written rows with `profile` from exercise-profile.ts. `exercises.json` gives 34 rows with `training` (BASELINE schema), merged in `practices.ts` (JSON wins on id clash). Types are in `lib/types.ts` (Practice, Training, ExerciseProfile).
- The two sources carry different fields. The hand-written rows have no `training` block (no rep range, rest, tempo, progression, contraindications). The JSON rows have **empty `profile.equipment`**, and the swing and woodchop have **no profile at all** (no exerciseType/dose).
- Inconsistencies: bird-dog dose="seconds" but rep range "6-10". leg-swings is "seconds/60s" but is really reps per side. Suitcase/waiters say "time is per side" only inside the tempo text. walking-lunge is "unilateral" but alternates.

| Logging need | Missing (of 77) |
|---|---|
| Explicit measure type (weight×reps / bw reps / hold / distance) | **77** (only `dose` reps/seconds; 2 have no dose) |
| Distance/time for carries | **3/3** |
| Unilateral flag | 0 (laterality present), but **77** lack "log L/R separately vs alternating total" |
| Load type (per hand vs total, bodyweight, band level, assist/added) | **77** |
| Default sets | **77** |
| Default rep range / hold | **43** |
| Default rest | **43** (16 more have rest 0) |
| Tempo | **59** (43 + 16 warm-up/stretch rows empty) |
| Progression path | **59** (43 + 16 with an empty path) |
| Progression rule/step (when and how much to add) | **77** |

## 3. Proposed `logging` block (schema addition, per exercise)
```ts
logging: {
  profile: "dumbbell_reps" | "dumbbell_reps_per_side" | "alternating_reps" | "bodyweight_reps"
         | "band_reps" | "hold_seconds" | "hold_seconds_per_side" | "mobility_reps" | "carry" | "timed_warmup";
  fields: ("weight"|"reps"|"seconds"|"distance"|"side"|"band"|"assist"|"added")[];
  load?: { kind: "per_hand"|"total"|"bodyweight"|"band"|"none"; optionalAdded?: boolean; assist?: boolean };
  sides: "none" | "each" | "alternating";      // each = separate L/R rows
  defaults: { sets: number; reps?: string; seconds?: number; distanceM?: number; restSec: number; tempo?: string };
  progression: { rule: "double_progression"|"add_time"|"next_variation"|"next_band"|"none";
                 step?: { kg?: number; lb?: number; seconds?: number; reps?: number }; next?: string[] };
}
```
SetLog should gain `unit`, `band`, `assist`, `added`, `distance`, and `rpe?`. SetPlan should become the same shape as SetLog plus `doneAt`.

### Profile types (10; counts = 77). Per-id mapping is in `logging-profiles.csv`.
| type | fields | count | examples |
|---|---|---|---|
| dumbbell_reps | weight (per hand / total), reps | 7 | db-rdl, lateral-raise, goblet-squat (total) |
| dumbbell_reps_per_side | side, weight, reps | 9 | dumbbell-row, bulgarian, SL-RDL, TGU |
| alternating_reps | reps total, optional weight | 1 | walking-lunge |
| bodyweight_reps | reps, ±added/assist | 15 | push-up, pull-up, dip, nordic |
| band_reps | band level, reps (pallof per side) | 3 | face-pull, pallof-press |
| hold_seconds | seconds (optional load) | 10 | plank, dead-hang, spanish-squat |
| hold_seconds_per_side | side, seconds | 17 | side-plank, couch-stretch, splits holds |
| mobility_reps | reps (each side) | 9 | cat-cow, bird-dog, leg-swings |
| carry | weight, seconds or distance, side | 3 | farmer, suitcase, waiters |
| timed_warmup | seconds / done | 3 | march, jacks, warm-up-general |

## Recommended fix order
1. Fix writePlans data loss and the newest-vs-oldest "Previous" bug (small, high impact).
2. Add the `logging` block to the schema and to exercises.json; port the 43 hand-written rows into JSON with the same block, to remove the dual-source split.
3. Drive the plan table columns, defaults (sets/reps/rest) and side rows from `logging`. Remove the hardcoded "2 × 8, 5 lb".
4. Store a unit on every set. Use per-side last-time from finished sessions only.
5. Add progression suggestions (double progression / add time / next variation) from `logging.progression`.
