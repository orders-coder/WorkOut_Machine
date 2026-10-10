import type { Metadata } from "next";
import { LiveWorkout } from "@/components/LiveWorkout";
import { workoutCatalog } from "@/lib/workout-catalog";

export const metadata: Metadata = {
  title: "Live",
};

export default function LivePage() {
  return <LiveWorkout catalog={workoutCatalog()} mode="live" />;
}
