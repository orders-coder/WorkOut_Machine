import type { MuscleId } from "./muscles";
import type { DayTypeId } from "./routine-types";

export type WeightUnit = "kg" | "lb";

export interface SetLog {
  weight?: number;
  reps?: number;
  seconds?: number;
  breaths?: number;
  at: string;
}

export interface SessionExercise {
  practiceId: string;
  sets: SetLog[];
}

export type SessionPhase = "work" | "rest" | "suggest" | "done";

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
}

export interface WorkoutPrefs {
  unit: WeightUnit;
}

const SESSIONS_KEY = "work-out-machine:sessions-v1";
const PREFS_KEY = "work-out-machine:workout-prefs-v1";

export function loadSessions(): WorkoutSession[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as WorkoutSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: WorkoutSession[]) {
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
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
    return { unit: "kg" };
  }
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { unit: "kg" };
    }
    const parsed = JSON.parse(raw) as WorkoutPrefs;
    return parsed.unit === "lb" ? { unit: "lb" } : { unit: "kg" };
  } catch {
    return { unit: "kg" };
  }
}

export function savePrefs(prefs: WorkoutPrefs) {
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function lastSetFor(practiceId: string): SetLog | undefined {
  for (const session of loadSessions()) {
    for (const exercise of session.exercises) {
      if (exercise.practiceId === practiceId && exercise.sets.length > 0) {
        return exercise.sets[exercise.sets.length - 1];
      }
    }
  }
  return undefined;
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
