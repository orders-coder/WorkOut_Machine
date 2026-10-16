export type DayTypeId = "20" | "40" | "60";

export interface DayType {
  id: DayTypeId;
  label: string;
  /** Minutes the session is aiming at. Does not change which exercises you can pick. */
  targetMinutes: number;
}

export const DAY_TYPES: DayType[] = [
  { id: "20", label: "20 min", targetMinutes: 20 },
  { id: "40", label: "40 min", targetMinutes: 40 },
  { id: "60", label: "60 min", targetMinutes: 60 },
];

const LEGACY: Record<string, DayTypeId> = {
  quick: "20",
  recovery: "20",
  standard: "40",
  heavy: "60",
  max: "60",
};

const LONGER: Record<DayTypeId, DayTypeId[]> = {
  "20": ["20", "40", "60"],
  "40": ["40", "60"],
  "60": ["60"],
};

/** Stay on this length until the plan is more than 5 minutes past it, then step up. */
export function longerDay(current: DayTypeId, minutes: number): DayTypeId {
  for (const id of LONGER[current]) {
    const target = DAY_TYPES.find((day) => day.id === id)?.targetMinutes ?? 60;
    if (minutes <= target + 5) {
      return id;
    }
  }
  return "60";
}

export function dayTypeById(id: string): DayType {
  const mapped = (LEGACY[id] ?? id) as DayTypeId;
  return DAY_TYPES.find((day) => day.id === mapped) ?? DAY_TYPES[1];
}
