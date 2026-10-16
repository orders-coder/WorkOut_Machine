import type { Practice } from "@/lib/types";
import { bothSides, exerciseRules } from "@/lib/exercise-guide";

export function ExerciseGuide({ practice }: { practice: Practice }) {
  const rules = exerciseRules(practice);
  const steps = [
    ...(practice.setup ? [practice.setup] : []),
    ...practice.cues,
  ];

  return (
    <section className="mt-5">
      <h2 className="font-display text-xl">How it works</h2>
      {practice.why ? <p className="mt-1 text-base leading-snug text-ink/80">{practice.why}</p> : null}
      {bothSides(practice) ? (
        <p className="mt-2 text-sm leading-snug text-ink/70">
          This is a one-side exercise. Finish the right side, then repeat it on the left.
        </p>
      ) : null}

      {steps.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-2 text-sm leading-snug text-ink/80">
              <span className="w-5 shrink-0 text-ink/40">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      <ul className="mt-4 space-y-2">
        {rules.map((rule) => (
          <li key={rule.label} className="rounded-2xl bg-card px-3.5 py-2.5 ring-1 ring-ink/8">
            <p className="text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">{rule.label}</p>
            <p className="mt-0.5 text-sm leading-snug text-ink/80">{rule.detail}</p>
          </li>
        ))}
      </ul>

      {practice.mistakes.length > 0 ? (
        <div className="mt-4">
          <h3 className="font-display text-lg">Easy to miss</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-4">
            {practice.mistakes.map((mistake) => (
              <li key={mistake} className="text-sm leading-snug text-ink/80">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
