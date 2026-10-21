import type { Metadata } from "next";
import { ScopedLibrary } from "@/components/ScopedLibrary";
import { practices } from "@/data/practices";
import { attachPracticeMedia } from "@/lib/resolve-image";

export const metadata: Metadata = {
  title: "Exercises",
};

export default function ExercisesPage() {
  return (
    <ScopedLibrary
      practices={practices.map(attachPracticeMedia)}
      heading="Find your next move."
      intro="Pick your workouts. Make them your own."
      showBody
    />
  );
}
