export type DayTypeId = "quick" | "standard" | "heavy" | "recovery" | "max";

export interface DayType {
  id: DayTypeId;
  label: string;
  /** Minutes the clock is aiming at. */
  targetMinutes: number;
  exerciseCount: number;
  restSeconds: number;
  /** Sets to spread across each main muscle before the workout feels finished. */
  setsPerMain: number;
  setsPerAddon: number;
  /** Prefer intermediate and advanced moves. */
  harder: boolean;
  /** Mobility and stretch only. */
  mobilityOnly: boolean;
}

export const DAY_TYPES: DayType[] = [
  {
    id: "quick",
    label: "Quick",
    targetMinutes: 20,
    exerciseCount: 4,
    restSeconds: 45,
    setsPerMain: 3,
    setsPerAddon: 2,
    harder: false,
    mobilityOnly: false,
  },
  {
    id: "standard",
    label: "Standard",
    targetMinutes: 40,
    exerciseCount: 6,
    restSeconds: 75,
    setsPerMain: 4,
    setsPerAddon: 2,
    harder: false,
    mobilityOnly: false,
  },
  {
    id: "heavy",
    label: "Heavy",
    targetMinutes: 55,
    exerciseCount: 7,
    restSeconds: 150,
    setsPerMain: 4,
    setsPerAddon: 2,
    harder: true,
    mobilityOnly: false,
  },
  {
    id: "recovery",
    label: "Recovery",
    targetMinutes: 25,
    exerciseCount: 5,
    restSeconds: 30,
    setsPerMain: 2,
    setsPerAddon: 1,
    harder: false,
    mobilityOnly: true,
  },
  {
    id: "max",
    label: "Max",
    targetMinutes: 70,
    exerciseCount: 8,
    restSeconds: 90,
    setsPerMain: 5,
    setsPerAddon: 3,
    harder: false,
    mobilityOnly: false,
  },
];

export function dayTypeById(id: DayTypeId): DayType {
  return DAY_TYPES.find((day) => day.id === id) ?? DAY_TYPES[1];
}
