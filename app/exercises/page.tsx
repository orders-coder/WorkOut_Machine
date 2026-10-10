import type { Metadata } from "next";
import { ScopedLibrary } from "@/components/ScopedLibrary";
import { practices } from "@/data/practices";
import { resolvePracticeImage } from "@/lib/resolve-image";
import type { Practice } from "@/lib/types";

export const metadata: Metadata = {
  title: "Exercises",
};

function withImages(items: Practice[]): Practice[] {
  return items.map((practice) => ({
    ...practice,
    image: resolvePracticeImage(practice.id, practice.image),
  }));
}

export default function ExercisesPage() {
  return (
    <ScopedLibrary
      practices={withImages(practices)}
      heading="Find your next move."
      intro="Pick your workouts. Make them your own."
    />
  );
}
