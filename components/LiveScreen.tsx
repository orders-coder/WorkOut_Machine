"use client";

import { useEffect, useState } from "react";
import { LiveWorkout } from "./LiveWorkout";
import { FrontSplitsPlayer } from "./FrontSplitsPlayer";
import { loadFrontSplitsLive } from "./FrontSplitsRoutine";
import type { GuideStep } from "@/data/front-splits";
import type { WorkoutExercise } from "@/lib/workout-catalog";

export function LiveScreen({ catalog }: { catalog: WorkoutExercise[] }) {
  const [guide, setGuide] = useState<{ steps: GuideStep[]; rounds: number; startedAt: string } | null | undefined>(undefined);

  useEffect(() => {
    setGuide(loadFrontSplitsLive());
  }, []);

  if (guide === undefined) {
    return null;
  }
  if (guide) {
    return (
      <FrontSplitsPlayer
        steps={guide.steps}
        rounds={guide.rounds}
        startedAt={guide.startedAt}
      />
    );
  }
  return <LiveWorkout catalog={catalog} mode="live" />;
}
