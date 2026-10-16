import { getPracticeById, practices } from "./practices";
import { exercisesInRoutine, getRoutine, suggestedRoutines } from "./routines";
import { resolveExerciseId } from "@/lib/legacy-ids";

export const catalog = {
  exercises: practices,
  routines: suggestedRoutines,
  getExercise: getPracticeById,
  getRoutine,
  exercisesInRoutine,
  getAlias: (id: string) => {
    const next = resolveExerciseId(id);
    return next === id ? undefined : next;
  },
};
