import { softBodyPractices } from "./soft-body";
import { strengthPractices } from "./strength";
import { strengthStaples } from "./strength-staples";
import {
  databaseExerciseIds,
  exerciseRecords,
  practiceFromRecord,
} from "./exercise-db";
import { exerciseProfiles } from "./exercise-profile";
import { hasLogging, loggingFor } from "@/lib/logging";
import type { Practice } from "@/lib/types";
import { waysOf } from "@/lib/ways";
import { resolveExerciseId } from "@/lib/legacy-ids";

/**
 * Ten ids exist in both the written modules and exercises.json.
 * The JSON row wins for name, level, equipment, and target.
 * The longer why, cues, and mistakes are kept.
 * Resolved ids: push-up, dumbbell-row, pull-up-or-negative, glute-bridge,
 * goblet-squat, bulgarian-split-squat, farmer-carry, suitcase-carry,
 * pallof-press, bird-dog.
 */
const LINKS: Record<string, Pick<Practice, "regressionId" | "progressionId">> = {
  "inverted-row": { progressionId: "pull-up-or-negative" },
  "pull-up-or-negative": { regressionId: "inverted-row" },
  "split-squat": { progressionId: "bulgarian-split-squat" },
  "bulgarian-split-squat": { regressionId: "split-squat" },
};

function finish(practice: Practice): Practice {
  if (!hasLogging(practice.id)) {
    throw new Error(`Missing logging block for ${practice.id}`);
  }
  const profile = exerciseProfiles[practice.id];
  return {
    ...practice,
    ...(profile ? { profile } : {}),
    ...LINKS[practice.id],
    logging: loggingFor(practice.id),
  };
}

const written = [...softBodyPractices, ...strengthPractices, ...strengthStaples];
const writtenById = new Map(written.map((practice) => [practice.id, practice]));

/** One list. Database rows replace any older write-up with the same id. */
export const practices: Practice[] = [
  ...written.filter((practice) => !databaseExerciseIds.has(practice.id)),
  ...exerciseRecords.map((record) => {
    const id = practiceFromRecord(record).id;
    return practiceFromRecord(record, writtenById.get(id));
  }),
].map(finish);

if (practices.length !== 77) {
  throw new Error(`Expected 77 practices, found ${practices.length}`);
}

export function getPracticeById(id: string): Practice | undefined {
  const resolved = resolveExerciseId(id);
  return practices.find((practice) => practice.id === resolved);
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
