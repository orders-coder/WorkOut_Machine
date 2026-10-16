export type WeightUnit = "kg" | "lb";
export type LogSide = "L" | "R";

export interface SetLog {
  weight?: number;
  unit: WeightUnit;
  reps?: number;
  seconds?: number;
  side?: LogSide;
  rpe?: number;
  rir?: number;
  isWarmup?: boolean;
  restSec?: number;
  bandLevel?: string;
  addedWeight?: number;
  assistWeight?: number;
  distanceM?: number;
  contacts?: number;
  boxHeightCm?: number;
  breaths?: number;
  notes?: string;
  /** 0–10. Only stored when a number was entered. */
  pain?: number;
  completedAt: string;
}

export interface SetPlan {
  weight?: number;
  unit: WeightUnit;
  reps?: number;
  seconds?: number;
  side?: LogSide;
  rir?: number;
  bandLevel?: string;
  addedWeight?: number;
  assistWeight?: number;
  distanceM?: number;
  contacts?: number;
  boxHeightCm?: number;
  breaths?: number;
  notes?: string;
  pain?: number;
  completedAt?: string;
}

const NUMBER_FIELDS = [
  "weight",
  "reps",
  "seconds",
  "rpe",
  "rir",
  "restSec",
  "addedWeight",
  "assistWeight",
  "distanceM",
  "contacts",
  "boxHeightCm",
  "breaths",
  "pain",
] as const;

type NumberField = (typeof NUMBER_FIELDS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const ZERO_IS_EMPTY = new Set<NumberField>([
  "weight",
  "reps",
  "seconds",
  "breaths",
  "addedWeight",
  "assistWeight",
  "distanceM",
  "contacts",
  "boxHeightCm",
  "restSec",
]);

function optionalNumber(value: unknown, field?: NumberField): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  if (value === 0 && field && ZERO_IS_EMPTY.has(field)) {
    return undefined;
  }
  return value;
}

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function sideOf(value: unknown): LogSide | undefined {
  if (value === "L" || value === "left") {
    return "L";
  }
  if (value === "R" || value === "right") {
    return "R";
  }
  return undefined;
}

export function migrateSet(raw: unknown, fallbackUnit: WeightUnit): SetLog | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  const completedAt =
    (typeof raw.completedAt === "string" && raw.completedAt) ||
    (typeof raw.at === "string" && raw.at) ||
    "1970-01-01T00:00:00.000Z";
  const unit: WeightUnit = raw.unit === "kg" || raw.unit === "lb" ? raw.unit : fallbackUnit;
  const next: SetLog = { unit, completedAt };
  for (const field of NUMBER_FIELDS) {
    const value = optionalNumber(raw[field], field);
    if (value !== undefined) {
      next[field] = value;
    }
  }
  const side = sideOf(raw.side);
  if (side) {
    next.side = side;
  }
  const bandLevel = optionalText(raw.bandLevel);
  if (bandLevel) {
    next.bandLevel = bandLevel;
  }
  const notes = optionalText(raw.notes);
  if (notes) {
    next.notes = notes;
  }
  if (raw.isWarmup === true) {
    next.isWarmup = true;
  }
  return next;
}

export function migratePlan(raw: unknown, fallbackUnit: WeightUnit): SetPlan | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  const unit: WeightUnit = raw.unit === "kg" || raw.unit === "lb" ? raw.unit : fallbackUnit;
  const next: SetPlan = { unit };
  const planFields = [
    "weight",
    "reps",
    "seconds",
    "rir",
    "addedWeight",
    "assistWeight",
    "distanceM",
    "contacts",
    "boxHeightCm",
    "breaths",
    "pain",
  ] as const;
  for (const field of planFields) {
    const value = optionalNumber(raw[field], field);
    if (value !== undefined) {
      next[field] = value;
    }
  }
  const side = sideOf(raw.side);
  if (side) {
    next.side = side;
  }
  const bandLevel = optionalText(raw.bandLevel);
  if (bandLevel) {
    next.bandLevel = bandLevel;
  }
  const notes = optionalText(raw.notes);
  if (notes) {
    next.notes = notes;
  }
  const completedAt =
    (typeof raw.completedAt === "string" && raw.completedAt) ||
    (typeof raw.doneAt === "string" && raw.doneAt) ||
    "";
  if (completedAt) {
    next.completedAt = completedAt;
  }
  return next;
}

interface StoredExercise {
  practiceId: string;
  sets: unknown[];
  plan?: unknown[];
  note?: string;
}

interface StoredSession {
  exercises: StoredExercise[];
  side?: unknown;
}

export function migrateSessions<T extends StoredSession>(sessions: T[], fallbackUnit: WeightUnit): T[] {
  return sessions.map((session) => ({
    ...session,
    side: sideOf(session.side),
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => migrateSet(set, fallbackUnit)).filter((set): set is SetLog => Boolean(set)),
      plan: exercise.plan
        ?.map((row) => migratePlan(row, fallbackUnit))
        .filter((row): row is SetPlan => Boolean(row)),
    })),
  }));
}

/** Checked plan rows become logs. A plan edit keeps side, seconds, breaths, and the other fields it does not replace. */
export function mergeLoggedSet(row: SetPlan, existing?: SetLog): SetLog {
  const completedAt = row.completedAt || existing?.completedAt;
  if (!completedAt) {
    throw new Error("A skipped set is not logged");
  }
  return {
    unit: row.unit || existing?.unit || "lb",
    completedAt,
    weight: row.weight,
    reps: row.reps,
    seconds: row.seconds ?? existing?.seconds,
    side: row.side ?? existing?.side,
    rpe: existing?.rpe,
    rir: row.rir ?? existing?.rir,
    isWarmup: existing?.isWarmup,
    restSec: existing?.restSec,
    bandLevel: row.bandLevel ?? existing?.bandLevel,
    addedWeight: row.addedWeight ?? existing?.addedWeight,
    assistWeight: row.assistWeight ?? existing?.assistWeight,
    distanceM: row.distanceM ?? existing?.distanceM,
    contacts: row.contacts ?? existing?.contacts,
    boxHeightCm: row.boxHeightCm ?? existing?.boxHeightCm,
    breaths: row.breaths ?? existing?.breaths,
    notes: row.notes ?? existing?.notes,
    pain: row.pain ?? existing?.pain,
  };
}
