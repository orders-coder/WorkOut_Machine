# Exercise data research: how loggers and exercise DBs structure exercise data
Thu Oct 15 2026 PT. Every link below was actually fetched (WebFetch or curl). **Not verified, so not cited:** Strong (its exercise-types help URL now redirects to an export article), JEFIT, Boostcamp, Fitbod (search snippet only), RP and ExRx's per-exercise classification pages. Claims about those apps are left out.

Sources (fetched):
- [H1] Hevy custom exercises, exercise types: https://www.hevyapp.com/features/custom-exercises/
- [F1] free-exercise-db schema: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/schema.json
- [E1] ExerciseDB v2 sample: https://raw.githubusercontent.com/ExerciseDB/exercisedb-api/main/README.md
- [W1] wger exercise API: https://wger.de/api/v2/exercise/?limit=1
- [X1] ExRx glossary (utility, mechanics, force, tempo, volume): https://exrx.net/WeightTraining/Glossary
- [S1] Stronger By Science, autoregulation and RIR-based RPE: https://www.strongerbyscience.com/autoregulation/
- [N1] NSCA TSAC module (load, reps and rest by goal): https://www.nsca.com/contentassets/53f36e5db26a4729b251fb794c166af1/tsac-module-4.0--4.5.pdf
- [R1] 1RM estimation formulas (Epley, Brzycki): https://en.wikipedia.org/wiki/One-repetition_maximum
- [P1] PNF review (contraction 3–10 s, 6 s preferred; ≥2 sessions/week): https://pmc.ncbi.nlm.nih.gov/articles/PMC3588663/

Hevy's bodyweight-volume rule (effective load = bodyweight ± added/assist, counted only for moves that use 100% of bodyweight, such as pull-ups and dips) came from Hevy help-centre snippets. Those pages returned 404 when fetched, so the rule is listed as unverified and not cited.

## 1. Common fields across apps and DBs
| Field | Seen in |
|---|---|
| id, name, images/video | F1, E1, W1, H1 |
| primary muscles, secondary muscles | F1, E1, W1, H1 (one primary, many secondary) |
| equipment (enum or list) | F1, E1, W1, H1 |
| category (strength / stretching / cardio / plyometrics / strongman …) | F1, W1, E1 (`exerciseType`) |
| mechanic (compound/isolation), force (push/pull/static), level | F1; ExRx defines utility (basic/auxiliary), mechanics and force [X1] |
| instructions, tips, variations | F1, E1 |
| variation group / related ids | W1 `variation_group`, E1 `relatedExerciseIds` |
| **exercise (logging) type**, which decides the set columns | H1: weight&reps, bodyweight reps, weighted BW, assisted BW, duration, duration&weight, distance&duration, weight&distance |

Main takeaway: the DBs (F1, E1, W1) describe *what* an exercise is. The logger (H1) uses one **logging type** per exercise to decide *which columns a set has*. Our `profile_type` matches that pattern.

## 2. Type-specific fields
| Field | Exercise types | Why | Example | Source |
|---|---|---|---|---|
| weight + load_basis (per hand / total / per side) | DB reps, DB per side, carries, goblet | Volume and progression are ambiguous otherwise | "12 kg ×2 per hand" vs goblet "20 kg total" | H1 (weight&reps), X1 (volume = load×reps) |
| added_weight | weighted BW (dip, pull-up), weighted hold | Hevy keeps weighted BW as its own type | dip +10 kg | H1 |
| assist (kg or band level) | assisted pull-up/dip/push-up | Hevy keeps assisted BW as its own type; less assist = progress | pull-up, red band | H1 |
| bodyweight snapshot (session) | BW reps, weighted, assisted | Lets the app compute effective load for 100%-BW moves | 75 kg | H1 (type split); rule unverified |
| band_level | band reps, assisted | Band resistance isn't in kg; log the colour/level | "green" | H1 lists bands as equipment |
| reps | all rep types | core | 10 | H1, X1 |
| side (L/R) or alternating-total | unilateral | Lets you spot imbalances; alternating = total reps | L 8 / R 7 | (our design; no fetched app doc) |
| seconds | holds, stretches, planks | Hevy duration type | 45 s | H1 |
| seconds + weight | loaded isometric (weighted plank, wall sit, Spanish squat with band) | Hevy duration&weight type | wall sit 30 s @10 kg | H1 |
| distance + weight (+time) | carries | Hevy weight&distance type | farmer 2×24 kg, 40 m | H1 |
| distance + time | sprints, intervals | Hevy distance&duration type | 6×30 m, 4.8 s | H1 |
| RPE / RIR (0–5 reliable) | all strength sets | RIR-based RPE lets you pick load at a target effort | 8 reps @ RIR 2 | S1 |
| tempo (ecc/pause/con/top) | strength, eccentric, isometric | Standard shorthand | 3/0/2/1 | X1 |
| rest_target by goal | all | endurance ≤30 s, hypertrophy 30–90 s, strength/power 2–5 min | 90 s | N1 |
| %1RM / e1RM | weighted rep types | Prescription shorthand; e1RM via Epley w(1+r/30) or Brzycki w·36/(37−r); unreliable past ~10 reps | 20 kg × 8 → e1RM 25.3 | X1, R1, N1 |
| foot contacts / height | plyometrics (box jump, jump squat) | Plyo volume is counted in contacts; power rest 2–5 min | 5×5 = 25 contacts, 50 cm box | N1 (power rest); contacts figure unverified (PMC 403) |
| PNF cycle: stretch s, contract s, effort %, cycles | front splits, mobility | Contraction 3–10 s (6 s preferred); submaximal effort works; ≥2×/week | 3×(6 s contract / 20 s stretch) | P1 |
| end range (cm or angle) | splits, mobility | Progress shows up as range, not load | front split 18 cm off floor | P1 (ROM outcome) |
| variation / progression links | BW skills | variation groups and related exercises | knee push-up → push-up | W1, E1 |
| notes / pain flag | all | free text; Hevy pins notes per exercise | "L knee 3/10" | H1 |
| set tag (warm-up, failure, drop) | strength | used by loggers | warm-up | H1 reviews mention drop/failure labels |

## 3. Recommended schema additions
**Must-have now**
1. `load_basis` per exercise: `per_hand | total | per_side | added | assist | none`. Replaces the free-text load_unit.
2. Split bodyweight into an `added_kg` field and an `assist` field (kg or band_level) on the set. Store a bodyweight snapshot per session.
3. Columns driven by profile type. Plan rows must carry seconds, side, band, distance and added/assist, not just weight×reps. This also fixes bug #2 in live-and-db-review.md.
4. `rir` (0–5, optional) on every strength set.
5. `rest_target_s` per profile, tied to goal (N1 ranges).
6. `side` handling: per-side sets (L and R rows) vs `alternating` total reps.
7. Hold sets get optional `added_kg`/`band`, so Spanish squat and weighted plank count as loaded isometrics.
8. Carry sets: `distance_m` + `weight` + `load_basis`, with optional seconds.
9. `notes` + `pain` (0–10) per set or exercise.
10. `regression_id` / `progression_id` (or `variation_group`) links.

**Later**
- tempo string; set tags (warm-up, failure, drop); e1RM charts (Epley, ≤10 reps); %1RM prescriptions; PR types per profile (Hevy-style: best time for holds, longest distance, most reps); end-range measurement; PNF cycle fields; breath count (already logged); contraindication tags; ExRx-style utility, mechanics and force metadata.

## 4. New profile types
| Profile | Set fields | For |
|---|---|---|
| `plyometric` | reps (contacts), height_cm or distance_cm, side?, rest 2–5 min | box-jump, jump-squat (currently bodyweight_reps) |
| `sprint_interval` | distance_m, seconds, reps, rest_s, effort | sprints |
| `loaded_hold` (or extend hold with load) | seconds, added_kg or band, side? | Spanish squat, weighted plank/dead hang |
| `assisted_bodyweight` vs `weighted_bodyweight` (or keep one profile with explicit signed fields) | reps + assist / reps + added | pull-up, dip, Nordic |
| `pnf_stretch` | side, cycles, contract_s, stretch_s, effort %, end_range | front splits routine |
| `carry` (exists) | add distance_m + load_basis | farmer, suitcase (Hevy weight&distance) |
