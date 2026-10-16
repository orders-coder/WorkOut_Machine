import type { MuscleId } from "./muscles";
import type { DayTypeId } from "./routine-types";
import { resolveExerciseId } from "./legacy-ids";
import { migratePlan, migrateSet, sideOf, type LogSide, type SetLog, type SetPlan, type WeightUnit } from "./set-log";

export type { LogSide, SetLog, SetPlan, WeightUnit } from "./set-log";
export { mergeLoggedSet, migrateSet, sideOf } from "./set-log";

export interface SessionExercise {
  practiceId: string;
  sets: SetLog[];
  /** Rows shown on Live. A row is logged only after it is checked. */
  plan?: SetPlan[];
  note?: string;
}

export type SessionPhase = "work" | "switch" | "rest" | "suggest" | "done";

export interface WorkoutSession {
  id: string;
  dayType: DayTypeId;
  mains: MuscleId[];
  addon?: MuscleId;
  bodyweightOnly: boolean;
  startedAt: string;
  finishedAt?: string;
  exercises: SessionExercise[];
  index: number;
  phase: SessionPhase;
  restEndsAt?: string;
  title?: string;
  rounds?: number;
  /** Which side is up, for exercises done on both sides. */
  side?: LogSide;
  /** Elapsed seconds frozen when Stop is pressed. Absent while the clock is running. */
  timerHold?: number;
  /** Set after starter weights are removed from bodyweight added-load fields. */
  loggingCleanup?: 1;
}

export interface WorkoutPrefs {
  unit: WeightUnit;
  /** Notes that come back the next time that exercise is on Live. */
  notes?: Record<string, string>;
}

const SESSIONS_KEY = "work-out-machine:sessions-v1";
const PREFS_KEY = "work-out-machine:workout-prefs-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function migrateSession(session: WorkoutSession, fallbackUnit: WeightUnit): WorkoutSession {
  return {
    ...session,
    side: sideOf(session.side),
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      practiceId: resolveExerciseId(exercise.practiceId),
      sets: exercise.sets.map((set) => migrateSet(set, fallbackUnit)).filter((set): set is SetLog => Boolean(set)),
      plan: exercise.plan
        ?.map((row) => migratePlan(row, fallbackUnit))
        .filter((row): row is SetPlan => Boolean(row)),
    })),
  };
}

export function migrateSessions(sessions: WorkoutSession[], fallbackUnit: WeightUnit): WorkoutSession[] {
  return sessions.map((session) => migrateSession(session, fallbackUnit));
}

function readPrefsUnit(): WeightUnit {
  if (typeof window === "undefined") {
    return "lb";
  }
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return "lb";
    }
    const parsed = JSON.parse(raw) as { unit?: unknown };
    return parsed.unit === "kg" ? "kg" : "lb";
  } catch {
    return "lb";
  }
}

export function loadSessions(): WorkoutSession[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const migrated = migrateSessions(parsed as WorkoutSession[], readPrefsUnit());
    if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
      saveSessions(migrated);
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveSessions(sessions: WorkoutSession[]) {
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string) {
  saveSessions(loadSessions().filter((item) => item.id !== id));
}

export function upsertSession(session: WorkoutSession) {
  const sessions = loadSessions().filter((item) => item.id !== session.id);
  sessions.unshift(session);
  saveSessions(sessions);
}

export function activeSession(): WorkoutSession | undefined {
  return loadSessions().find((session) => !session.finishedAt);
}

export function loadPrefs(): WorkoutPrefs {
  if (typeof window === "undefined") {
    return { unit: "lb" };
  }
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { unit: "lb" };
    }
    const parsed = JSON.parse(raw) as WorkoutPrefs;
    const notes = isRecord(parsed.notes)
      ? Object.fromEntries(
          Object.entries(parsed.notes).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
        )
      : undefined;
    return { unit: parsed.unit === "kg" ? "kg" : "lb", notes };
  } catch {
    return { unit: "lb" };
  }
}

export function savePrefs(prefs: WorkoutPrefs) {
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function exerciseNote(practiceId: string): string {
  return loadPrefs().notes?.[practiceId] ?? "";
}

export function saveExerciseNote(practiceId: string, note: string) {
  const prefs = loadPrefs();
  const notes = { ...(prefs.notes ?? {}) };
  const trimmed = note.trim();
  if (trimmed) {
    notes[practiceId] = trimmed;
  } else {
    delete notes[practiceId];
  }
  savePrefs({ ...prefs, notes });
}

/** Latest finished session only. The active workout is never "last time". */
export function lastSetFor(practiceId: string, side?: LogSide): SetLog | undefined {
  for (const session of loadSessions()) {
    if (!session.finishedAt) {
      continue;
    }
    for (const exercise of session.exercises) {
      if (exercise.practiceId !== practiceId) {
        continue;
      }
      const sets = side ? exercise.sets.filter((set) => set.side === side) : exercise.sets;
      if (sets.length > 0) {
        return sets[sets.length - 1];
      }
    }
  }
  return undefined;
}

/** Sets from the newest finished session that logged this exercise. */
export function previousSetsFor(practiceId: string): SetLog[] {
  for (const session of loadSessions()) {
    if (!session.finishedAt) {
      continue;
    }
    const exercise = session.exercises.find((item) => item.practiceId === practiceId && item.sets.length > 0);
    if (exercise) {
      return exercise.sets;
    }
  }
  return [];
}

export function historyFor(practiceId: string): { at: string; sets: SetLog[] }[] {
  return loadSessions()
    .filter((session) => session.finishedAt)
    .flatMap((session) =>
      session.exercises
        .filter((exercise) => exercise.practiceId === practiceId && exercise.sets.length > 0)
        .map((exercise) => ({ at: session.startedAt, sets: exercise.sets })),
    );
}

export function volumeOf(sets: SetLog[]): number {
  return sets.reduce((sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0), 0);
}
