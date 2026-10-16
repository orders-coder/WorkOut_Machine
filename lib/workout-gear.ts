const IMPLEMENTS = new Set([
  "dumbbells",
  "barbell",
  "kettlebell",
  "band",
  "cable-or-machine",
  "medicine-ball",
  "bike",
]);

const WEIGHTED = new Set([
  "dumbbell",
  "dumbbells",
  "barbell",
  "kettlebell",
  "machine",
  "cable",
  "cable-or-machine",
  "medicine_ball",
  "medicine-ball",
]);

/** Free weight, a cable stack, or a medicine ball. Bands and bodyweight are not a kilogram load. */
export function isWeightedGear(equipment: string[], profileLoads?: string[]): boolean {
  const loads = profileLoads && profileLoads.length > 0 ? profileLoads : equipment;
  return loads.some((item) => WEIGHTED.has(item));
}

export function isBodyweightGear(equipment: string[], profileLoads?: string[]): boolean {
  if (profileLoads && profileLoads.length > 0) {
    return profileLoads.every((item) => item === "bodyweight");
  }
  return equipment.every((item) => !IMPLEMENTS.has(item));
}
