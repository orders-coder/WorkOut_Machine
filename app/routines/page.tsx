import type { Metadata } from "next";
import { RoutinesCatalog } from "@/components/RoutinesCatalog";

export const metadata: Metadata = {
  title: "Routines",
};

export default function RoutinesPage() {
  return <RoutinesCatalog />;
}
