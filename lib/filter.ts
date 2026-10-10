import { targetingFor } from "@/data/muscle-targets";
import type { Equipment, Level, Practice, Sport, Way } from "./types";
import { WAY_LABEL } from "./labels";
import { getMuscle } from "./muscles";
import { belongsToWay, waysOf } from "./ways";

export type WayFilter = "all" | Way;

export interface LibraryFilters {
  query: string;
  way: WayFilter;
  sports: Sport[];
  equipment: Equipment[];
  levels: Level[];
  favoritesOnly: boolean;
}

export const EMPTY_FILTERS: LibraryFilters = {
  query: "",
  way: "all",
  sports: [],
  equipment: [],
  levels: [],
  favoritesOnly: false,
};

function haystack(practice: Practice, extraTags: string[]): string {
  const sports = (practice.sports ?? []).join(" ");
  const equipment = practice.equipment.join(" ");
  const targeting = targetingFor(practice.id);
  const muscleWords = [...targeting.primary, ...targeting.secondary, ...targeting.tertiary].map(
    (id) => getMuscle(id)?.label ?? id,
  );
  return [
    practice.name,
    ...(practice.aka ?? []),
    ...practice.target,
    ...(practice.training?.primaryMuscles ?? []),
    ...(practice.training?.secondaryMuscles ?? []),
    ...(practice.training?.postureAlignmentTags ?? []),
    ...(practice.training?.contraindications ?? []),
    practice.training?.movementPattern,
    ...practice.tags,
    ...extraTags,
    ...waysOf(practice).map((way) => WAY_LABEL[way]),
    ...muscleWords,
    targeting.notes,
    sports,
    equipment,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterPractices(
  practices: Practice[],
  filters: LibraryFilters,
  options: {
    favorites: string[];
    dumpedIds: string[];
    customTags: Record<string, string[]>;
  },
): Practice[] {
  const q = filters.query.trim().toLowerCase();
  return practices.filter((practice) => {
    if (options.dumpedIds.includes(practice.id)) {
      return false;
    }
    if (filters.way !== "all" && !belongsToWay(practice, filters.way)) {
      return false;
    }
    if (filters.favoritesOnly && !options.favorites.includes(practice.id)) {
      return false;
    }
    if (filters.sports.length > 0) {
      const sports = practice.sports ?? [];
      if (!filters.sports.some((sport) => sports.includes(sport))) {
        return false;
      }
    }
    if (filters.equipment.length > 0) {
      if (!filters.equipment.some((item) => practice.equipment.includes(item))) {
        return false;
      }
    }
    if (filters.levels.length > 0 && !filters.levels.includes(practice.level)) {
      return false;
    }
    if (q && !haystack(practice, options.customTags[practice.id] ?? []).includes(q)) {
      return false;
    }
    return true;
  });
}
