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
  {
    slug: "front-splits-12",
    title: "Front Splits – 12 Step",
    sentence: "A recovery session for the front split. Warm up once, then the same sequence on each leg. About 12 minutes a round.",
    goal: "stretch",
    way: "soft-body",
    suggested: true,
    exerciseIds: [
      "warm-up-general",
      "lunge-90-hip-flexor",
      "lunge-90-ankle-grab",
      "half-split-hip-flexor",
      "half-split-pnf",
      "half-split-ankle-grab",
      "half-split-knee-taps",
      "hamstring-stretch-flexed",
      "hamstring-stretch-pointed",
      "pyramid-pose",
      "pyramid-good-morning",
      "front-split-hold",
    ],
    tags: ["flexibility", "splits", "hip-flexors", "hamstrings"],
    credits: [
      {
        label: "Dani Winks Flexibility, 10 Minute Splits Routine",
        href: "https://www.daniwinksflexibility.com/bendy-blog/10-minute-front-splits-routine",
      },
      {
        label: "r/flexibility, Working towards the splits",
        href: "https://www.reddit.com/r/flexibility/comments/lcijjy/working_towards_the_splits_any_tips/",
      },
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
