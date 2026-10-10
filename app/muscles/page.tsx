import type { Metadata } from "next";
import { Disclaimer } from "@/components/Disclaimer";
import { MuscleExplorer } from "@/components/MuscleExplorer";
import { MUSCLES, type MuscleId } from "@/lib/muscles";
import { exercisesForMuscle, musclesInCatalog } from "@/lib/muscle-index";
import { resolvePracticeImage } from "@/lib/resolve-image";
import type { Practice } from "@/lib/types";

export const metadata: Metadata = {
  title: "Muscles",
};

function withImages(items: Practice[]): Practice[] {
  return items.map((practice) => ({
    ...practice,
    image: resolvePracticeImage(practice.id, practice.image),
  }));
}

export default function MusclesPage() {
  const muscles = musclesInCatalog();
  const exercises = Object.fromEntries(
    MUSCLES.map((muscle) => [muscle.id, withImages(exercisesForMuscle(muscle.id))]),
  ) as Partial<Record<MuscleId, Practice[]>>;

  return (
    <div className="px-3 pb-6 pt-1">
      <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">
        Work Out Machine
      </p>
      <h1 className="mt-1 font-display text-3xl text-ink">Muscles</h1>
      <p className="mt-1.5 max-w-[24rem] text-sm leading-snug text-ink/70">
        Anterior and posterior views of the muscles this catalog trains. Tap a region to see the
        work.
      </p>

      <div className="mt-4">
        <MuscleExplorer muscles={muscles} exercises={exercises} />
      </div>

      <footer className="mt-8">
        <Disclaimer />
      </footer>
    </div>
  );
}
