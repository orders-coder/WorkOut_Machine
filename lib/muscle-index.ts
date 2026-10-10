import { muscleTargets, targetingFor } from "@/data/muscle-targets";
import { practices } from "@/data/practices";
import { MUSCLES, type MuscleDef, type MuscleId, type MuscleTargeting } from "./muscles";
import type { Practice } from "./types";

export function getTargeting(practiceId: string): MuscleTargeting {
  return targetingFor(practiceId);
}

export function practiceHitsMuscle(practiceId: string, muscle: MuscleId): boolean {
  const targeting = targetingFor(practiceId);
  return (
    targeting.primary.includes(muscle) ||
    targeting.secondary.includes(muscle) ||
    targeting.tertiary.includes(muscle)
  );
}

export function exercisesForMuscle(muscle: MuscleId): Practice[] {
  return practices.filter((practice) => practiceHitsMuscle(practice.id, muscle));
}

export function musclesInCatalog(): MuscleDef[] {
  return MUSCLES.filter((muscle) =>
    Object.values(muscleTargets).some(
      (targeting) =>
        targeting.primary.includes(muscle.id) ||
        targeting.secondary.includes(muscle.id) ||
        targeting.tertiary.includes(muscle.id),
    ),
  );
}

export function roleOnMuscle(
  practiceId: string,
  muscle: MuscleId,
): "primary" | "secondary" | "tertiary" | null {
  const targeting = targetingFor(practiceId);
  if (targeting.primary.includes(muscle)) {
    return "primary";
  }
  if (targeting.secondary.includes(muscle)) {
    return "secondary";
  }
  if (targeting.tertiary.includes(muscle)) {
    return "tertiary";
  }
  return null;
}
