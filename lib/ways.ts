import type { Practice, Way } from "./types";

export function waysOf(practice: Practice): Way[] {
  if (practice.also && practice.also !== practice.way) {
    return [practice.way, practice.also];
  }
  return [practice.way];
}

export function belongsToWay(practice: Practice, way: Way): boolean {
  return waysOf(practice).includes(way);
}
