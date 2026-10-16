import { targetingFor } from "@/data/muscle-targets";
import { practices } from "@/data/practices";
import type { MuscleId } from "@/lib/muscles";
import { resolvePracticeImage } from "@/lib/resolve-image";
import type { ExerciseType, ForceType, Level, MovementPattern } from "@/lib/types";
import { isBodyweightGear, isWeightedGear } from "@/lib/workout-gear";

export interface WorkoutExercise {
  id: string;
  name: string;
  image: string;
  level: Level;
  bodyweight: boolean;
  /** True only when the load is something you can log in kg or lb. */
  weighted: boolean;
  /** One side, then the other. */
  bothSides: boolean;
  exerciseType?: ExerciseType;
  pattern?: MovementPattern;
  force?: ForceType;
  dose?: "reps" | "seconds" | "breaths" | "minutes";
  repRange?: string;
  muscles: MuscleId[];
  compound: boolean;
}

const ISOLATION = /curl|raise|extension|plank|tuck|stretch/i;

export function workoutCatalog(): WorkoutExercise[] {
  return practices.map((practice) => {
    const targeting = targetingFor(practice.id);
    const pattern = practice.profile?.movementPattern ?? practice.training?.movementPattern;
    const exerciseType = practice.profile?.exerciseType;
    return {
      id: practice.id,
      name: practice.name,
      image: resolvePracticeImage(practice.id, practice.image),
      level: practice.level,
      bodyweight: isBodyweightGear(practice.equipment, practice.profile?.equipment),
      weighted:
        isWeightedGear(practice.equipment, practice.profile?.equipment) &&
        practice.profile?.exerciseType !== "stretch" &&
        practice.profile?.exerciseType !== "mobility" &&
        practice.profile?.exerciseType !== "breathing" &&
        practice.profile?.exerciseType !== "meditation" &&
        practice.profile?.exerciseType !== "hang",
      exerciseType,
      pattern,
      force: practice.profile?.forceType ?? practice.training?.forceType,
      dose: practice.profile?.dose,
      bothSides:
        practice.profile?.laterality === "unilateral" || practice.training?.laterality === "unilateral",
      repRange: practice.training?.defaultRepRange,
      muscles: [...targeting.primary, ...targeting.secondary],
      compound:
        exerciseType === "strength" &&
        (pattern === "squat" || pattern === "hinge" || pattern === "push" || pattern === "pull") &&
        !ISOLATION.test(practice.name),
    };
  });
}
