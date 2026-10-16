import { MUSCLES, type MuscleId } from "@/lib/muscles";
import type { WorkoutExercise } from "@/lib/workout-catalog";
import type { Equipment, Level, Practice } from "@/lib/types";

const KEY = "work-out-machine:custom-exercises-v1";

export interface CustomExercise {
  id: string;
  name: string;
  muscles: MuscleId[];
  level: Level;
  equipment: Equipment;
  dose: "reps" | "seconds";
  repRange: string;
}

export function loadCustomExercises(): CustomExercise[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isCustomExercise).map((item) => ({ ...item, repRange: item.repRange ?? "" }));
  } catch {
    return [];
  }
}

export function saveCustomExercise(input: Omit<CustomExercise, "id">): CustomExercise {
  const exercise: CustomExercise = {
    ...input,
    id: `custom-${slug(input.name)}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    muscles: input.muscles.filter((id) => MUSCLES.some((muscle) => muscle.id === id)),
    repRange: input.repRange.trim(),
  };
  const next = [exercise, ...loadCustomExercises()];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return exercise;
}

export function customToPractice(item: CustomExercise): Practice {
  return {
    id: item.id,
    name: item.name,
    way: "strength",
    equipment: [item.equipment],
    level: item.level,
    target: item.muscles.map((id) => MUSCLES.find((muscle) => muscle.id === id)?.label ?? id),
    why: "Added by you.",
    cues: [],
    mistakes: [],
    image: "/practices/custom.svg",
    imageAlt: item.name,
    tags: ["custom"],
    profile: {
      exerciseType: "strength",
      position: "standing",
      dose: item.dose,
    },
  };
}

export function customToWorkout(item: CustomExercise): WorkoutExercise {
  return {
    id: item.id,
    name: item.name,
    image: "/practices/custom.svg",
    level: item.level,
    bodyweight: item.equipment === "none" || item.equipment === "floor" || item.equipment === "mat" || item.equipment === "band",
    weighted: item.equipment === "dumbbells" || item.equipment === "barbell" || item.equipment === "kettlebell" || item.equipment === "cable-or-machine" || item.equipment === "medicine-ball",
    exerciseType: "strength",
    dose: item.dose,
    bothSides: false,
    repRange: item.repRange || undefined,
    muscles: item.muscles,
    compound: false,
  };
}

function slug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return base || "exercise";
}

function isCustomExercise(value: unknown): value is CustomExercise {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
    return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    Array.isArray(record.muscles) &&
    record.muscles.every((muscle) => typeof muscle === "string") &&
    (record.level === "beginner" || record.level === "intermediate" || record.level === "advanced") &&
    typeof record.equipment === "string" &&
    (record.dose === "reps" || record.dose === "seconds") &&
    (record.repRange === undefined || typeof record.repRange === "string")
  );
}
