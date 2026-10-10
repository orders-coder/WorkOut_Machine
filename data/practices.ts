import { innerPractices } from "./inner";
import { softBodyPractices } from "./soft-body";
import { strengthPractices } from "./strength";
import { strengthStaples } from "./strength-staples";
import {
  databaseExerciseIds,
  exerciseRecords,
  practiceFromRecord,
} from "./exercise-db";
import type { Practice } from "@/lib/types";
import { waysOf } from "@/lib/ways";

const written = [...innerPractices, ...softBodyPractices, ...strengthPractices, ...strengthStaples];
const writtenById = new Map(written.map((practice) => [practice.id, practice]));

/** One list. Database rows replace any older write-up with the same id. */
export const practices: Practice[] = [
  ...written.filter((practice) => !databaseExerciseIds.has(practice.id)),
  ...exerciseRecords.map((record) => {
    const id = practiceFromRecord(record).id;
    return practiceFromRecord(record, writtenById.get(id));
  }),
];

export function getPracticeById(id: string): Practice | undefined {
  return practices.find((practice) => practice.id === id);
}

export function getRelatedPractices(practice: Practice, limit = 4): Practice[] {
  const bySport = practice.sports?.length
    ? practices.filter(
        (item) =>
          item.id !== practice.id &&
          item.sports?.some((sport) => practice.sports?.includes(sport)),
      )
    : [];
  const selfWays = waysOf(practice);
  const byWay = practices.filter(
    (item) =>
      item.id !== practice.id && waysOf(item).some((way) => selfWays.includes(way)),
  );
  const seen = new Set<string>();
  const related: Practice[] = [];
  for (const item of [...bySport, ...byWay]) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    related.push(item);
    if (related.length >= limit) {
      break;
    }
  }
  return related;
}
