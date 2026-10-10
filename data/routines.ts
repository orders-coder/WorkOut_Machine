import type { Routine } from "@/lib/types";
import { practices } from "./practices";

export const suggestedRoutines: Routine[] = [
  {
    slug: "build-muscle",
    title: "Build muscle",
    sentence: "Squat, hinge, push, pull, carry. A short full-body strength session.",
    goal: "muscle",
    way: "strength",
    suggested: true,
    exerciseIds: [
      "goblet-squat",
      "db-rdl",
      "push-up",
      "dumbbell-row",
      "plank",
      "farmer-carry",
    ],
  },
  {
    slug: "open-and-stretch",
    title: "Open and stretch",
    sentence: "Spine, hips, and the front of the body. A quiet mobility hour you can keep short.",
    goal: "stretch",
    way: "soft-body",
    suggested: true,
    exerciseIds: [
      "cat-cow",
      "childs-pose",
      "downward-dog",
      "kneeling-hip-flexor",
      "figure-four",
      "seated-spinal-twist",
      "wall-angels",
    ],
  },
];

export function getRoutine(slug: string): Routine | undefined {
  return suggestedRoutines.find((routine) => routine.slug === slug);
}

export function exercisesInRoutine(routine: Routine) {
  const byId = new Map(practices.map((practice) => [practice.id, practice]));
  return routine.exerciseIds
    .map((id) => byId.get(id))
    .filter((practice): practice is NonNullable<typeof practice> => Boolean(practice));
}

export function isRoutineSlug(value: string): boolean {
  return suggestedRoutines.some((routine) => routine.slug === value);
}
