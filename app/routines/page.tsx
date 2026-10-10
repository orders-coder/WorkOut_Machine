import type { Metadata } from "next";
import { LiveWorkout } from "@/components/LiveWorkout";
import { workoutCatalog } from "@/lib/workout-catalog";

export const metadata: Metadata = {
  title: "Routines",
};

export default function RoutinesPage() {
  return <LiveWorkout catalog={workoutCatalog()} mode="build" />;
}
