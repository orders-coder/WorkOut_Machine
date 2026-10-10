import type { Metadata } from "next";
import { LiveWorkout, type WorkoutExercise } from "@/components/LiveWorkout";
import { isBodyweightGear } from "@/lib/workout-gear";
import { practices } from "@/data/practices";
import { targetingFor } from "@/data/muscle-targets";
import { resolvePracticeImage } from "@/lib/resolve-image";

export const metadata: Metadata = {
  title: "Routines",
};

const ISOLATION = /curl|raise|extension|plank|tuck|stretch/i;

export default function RoutinesPage() {
  const catalog: WorkoutExercise[] = practices.map((practice) => {
    const targeting = targetingFor(practice.id);
    const pattern = practice.profile?.movementPattern ?? practice.training?.movementPattern;
    const exerciseType = practice.profile?.exerciseType;
    return {
      id: practice.id,
      name: practice.name,
      image: resolvePracticeImage(practice.id, practice.image),
      level: practice.level,
      bodyweight: isBodyweightGear(practice.equipment, practice.profile?.equipment),
      exerciseType,
      pattern,
      force: practice.profile?.forceType ?? practice.training?.forceType,
      dose: practice.profile?.dose,
      repRange: practice.training?.defaultRepRange,
      muscles: [...targeting.primary, ...targeting.secondary],
      compound:
        exerciseType === "strength" &&
        (pattern === "squat" || pattern === "hinge" || pattern === "push" || pattern === "pull") &&
        !ISOLATION.test(practice.name),
    };
  });
  return <LiveWorkout catalog={catalog} />;
}
