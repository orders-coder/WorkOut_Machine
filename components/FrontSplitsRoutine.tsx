"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GuideStep } from "@/data/front-splits";

const KEY = "work-out-machine:front-splits-live";

export function FrontSplitsRoutine({ steps }: { steps: GuideStep[] }) {
  const router = useRouter();
  const [rounds, setRounds] = useState(1);

  return (
    <div>
      <ul className="mt-4 space-y-2 text-sm text-ink/80">
        <li>Warm up first.</li>
        <li>Do this 2–4 times a week, with rest days. Don’t do it daily.</li>
        <li>Props: yoga blocks, a strap, a knee pad, and a chair or wall for balance.</li>
        <li>Never stretch into sharp pain.</li>
      </ul>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setRounds(count)}
            className={`min-h-11 flex-1 rounded-full text-sm ${rounds === count ? "bg-[#0071e3] text-white" : "bg-white ring-1 ring-ink/10"}`}
          >
            {count} {count === 1 ? "round" : "rounds"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/50">About 12 minutes a round. Extra rounds skip the slow start.</p>
      <button
        type="button"
        onClick={() => {
          const queue = Array.from({ length: rounds }, (_, round) =>
            steps.filter((step) => round === 0 || step.guide !== "note"),
          ).flat();
          sessionStorage.setItem(
            KEY,
            JSON.stringify({ steps: queue, rounds, startedAt: new Date().toISOString() }),
          );
          router.push("/live");
        }}
        className="mt-4 min-h-12 w-full rounded-full bg-ink text-sm text-white"
      >
        Start on Live
      </button>
    </div>
  );
}

export function loadFrontSplitsLive(): { steps: GuideStep[]; rounds: number; startedAt: string } | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as { steps: GuideStep[]; rounds: number; startedAt: string };
  } catch {
    return null;
  }
}

export function clearFrontSplitsLive() {
  sessionStorage.removeItem(KEY);
}
