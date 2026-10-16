import type { Metadata } from "next";
import { LiveScreen } from "@/components/LiveScreen";
import { workoutCatalog } from "@/lib/workout-catalog";

export const metadata: Metadata = {
  title: "Live",
};

export default function LivePage() {
  return <LiveScreen catalog={workoutCatalog()} />;
}
