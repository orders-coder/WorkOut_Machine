import type { Practice } from "@/lib/types";
import { isWeightedGear } from "@/lib/workout-gear";

export interface ExerciseRule {
  label: string;
  detail: string;
}

export function bothSides(practice: Practice): boolean {
  return practice.profile?.laterality === "unilateral" || practice.training?.laterality === "unilateral";
}

export function exerciseRules(practice: Practice): ExerciseRule[] {
  const sides = bothSides(practice);
  const range = practice.training?.defaultRepRange || practice.durationHint || "";
  const hold = practice.profile?.dose === "seconds" || practice.profile?.dose === "minutes" || /s$/.test(range);
  const breaths = practice.profile?.dose === "breaths" || practice.profile?.exerciseType === "breathing";
  const weighted = isWeightedGear(practice.equipment, practice.profile?.equipment);
  const rules: ExerciseRule[] = [];

  if (sides) {
    rules.push({
      label: "Sides",
      detail: "Both sides. Do the right side, then the same thing on the left.",
    });
  } else {
    rules.push({
      label: "Sides",
      detail: "Both sides at once.",
    });
  }

  if (breaths) {
    rules.push({
      label: "Count",
      detail: sides ? "Count the breaths on each side." : "Count the breaths.",
    });
  } else if (hold) {
    const time = range || "30s";
    rules.push({
      label: "Count",
      detail: sides ? `Hold ${time} on each side.` : `Hold ${time}.`,
    });
  } else {
    const reps = range || "the reps you choose";
    rules.push({
      label: "Count",
      detail: sides ? `${reps} reps on each side.` : `${reps} reps.`,
    });
  }

  rules.push({
    label: "Load",
    detail: weighted
      ? "Log the weight. The load is part of the exercise."
      : "No weight. This exercise does not use a load you can count in kilograms.",
  });

  if (practice.training && practice.training.defaultRestSeconds > 0 && !sides) {
    rules.push({
      label: "Rest",
      detail: `${practice.training.defaultRestSeconds} seconds between sets.`,
    });
  }
  if (sides) {
    rules.push({
      label: "Rest",
      detail: "Switch sides before you rest. Rest comes after the second side.",
    });
  }

  return rules;
}
