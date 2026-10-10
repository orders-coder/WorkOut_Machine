const IMPLEMENTS = new Set([
  "dumbbells",
  "barbell",
  "kettlebell",
  "band",
  "cable-or-machine",
  "medicine-ball",
  "bike",
]);

export function isBodyweightGear(equipment: string[], profileLoads?: string[]): boolean {
  if (profileLoads && profileLoads.length > 0) {
    return profileLoads.every((item) => item === "bodyweight");
  }
  return equipment.every((item) => !IMPLEMENTS.has(item));
}
