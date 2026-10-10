import { getPracticeById, practices } from "./practices";
import { exercisesInRoutine, getRoutine, suggestedRoutines } from "./routines";
import { catalogDumpster, getAlias } from "./dumpster";

export const catalog = {
  exercises: practices,
  routines: suggestedRoutines,
  dumpster: catalogDumpster,
  getExercise: getPracticeById,
  getRoutine,
  exercisesInRoutine,
  getAlias,
};
