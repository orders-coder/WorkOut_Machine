"use client";

import { LiveWorkout } from "./LiveWorkout";
import type { WorkoutExercise } from "@/lib/workout-catalog";

export function LiveScreen({ catalog }: { catalog: WorkoutExercise[] }) {
  return <LiveWorkout catalog={catalog} mode="live" />;
}
