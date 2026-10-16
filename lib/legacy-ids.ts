/** Old catalog ids kept so saved sessions still open the exercise that replaced them. */
export const LEGACY_EXERCISE_IDS: Record<string, string> = {
  "upper-trap-stretch": "neck-side-stretch",
  "active-passive-hang": "dead-hang",
  "open-hand-hang": "dead-hang",
  "good-morning": "bodyweight-good-morning",
  "ring-dip": "dip",
  "bottoms-up-kettlebell-carry": "waiters-carry",
  "kettlebell-swing": "dumbbell-swing",
  "cable-woodchop": "dumbbell-woodchop",
};

export function resolveExerciseId(id: string): string {
  return LEGACY_EXERCISE_IDS[id] ?? id;
}
