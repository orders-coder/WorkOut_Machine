import Link from "next/link";
import { getTargeting } from "@/lib/muscle-index";
import { getMuscle, type MuscleId } from "@/lib/muscles";

function MuscleList({ ids, label }: { ids: MuscleId[]; label: string }) {
  if (ids.length === 0) {
    return null;
  }
  return (
    <div>
      <p className="text-[0.65rem] tracking-[0.16em] uppercase text-ink/45">{label}</p>
      <p className="mt-1 leading-relaxed text-ink/80">
        {ids.map((id, index) => {
          const muscle = getMuscle(id);
          return (
            <span key={id}>
              {index > 0 ? " · " : null}
              <Link
                href={`/muscles/${id}`}
                className="underline decoration-ink/25 underline-offset-4"
              >
                {muscle?.label ?? id}
              </Link>
            </span>
          );
        })}
      </p>
    </div>
  );
}

export function MuscleTargets({ practiceId }: { practiceId: string }) {
  const targeting = getTargeting(practiceId);
  return (
    <section className="mt-5">
      <h2 className="font-display text-xl">Muscles</h2>
      <div className="mt-2 space-y-2 rounded-2xl bg-card px-3.5 py-3 ring-1 ring-ink/8">
        <MuscleList ids={targeting.primary} label="Primary" />
        <MuscleList ids={targeting.secondary} label="Secondary" />
        <MuscleList ids={targeting.tertiary} label="Tertiary" />
        {targeting.notes ? (
          <p className="leading-relaxed text-ink/70">{targeting.notes}</p>
        ) : null}
      </div>
    </section>
  );
}
