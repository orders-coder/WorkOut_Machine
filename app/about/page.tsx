import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="px-4 pb-10 pt-2">
      <p className="text-[0.7rem] tracking-[0.22em] uppercase text-ink/45">
        Work Out Machine
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">About</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/80">
        Routines, exercises, and a muscle map. Most practices live in one room. Some live in two.
      </p>
      <ol className="mt-8 space-y-6">
        <li>
          <p className="text-[0.7rem] tracking-[0.16em] uppercase text-inner-ink">Inner</p>
          <p className="mt-1 font-display text-2xl text-ink">Sit, see, breathe</p>
          <p className="mt-2 leading-relaxed text-ink/70">
            Meditation, quieter breath, eye movement, sitting yoga. Later we will ask whether you
            want to sit or do more active breath work.
          </p>
        </li>
        <li>
          <p className="text-[0.7rem] tracking-[0.16em] uppercase text-soft-sage">Soft body</p>
          <p className="mt-1 font-display text-2xl text-ink">Stretches and yoga</p>
          <p className="mt-2 leading-relaxed text-ink/70">
            Sitting yoga, moving stretches, yin. The same sitting shapes can also live in Inner.
          </p>
        </li>
        <li>
          <p className="text-[0.7rem] tracking-[0.16em] uppercase text-strength-clay">Strength</p>
          <p className="mt-1 font-display text-2xl text-ink">Active work</p>
          <p className="mt-2 leading-relaxed text-ink/70">
            Active yoga, lifting, jumping, and anything that makes you sweat. Some of those yoga
            shapes also live in Soft body.
          </p>
        </li>
      </ol>
      <p className="mt-10 leading-relaxed text-ink/70">
        Favorites, notes, tags, and the dumpster live on this device. Deleted items fade for two
        days, then they are gone. There are no accounts in this version.
      </p>
      <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/" className="text-ink underline decoration-ink/25 underline-offset-4">
          Home
        </Link>
        <Link href="/exercises" className="text-ink underline decoration-ink/25 underline-offset-4">
          Exercises
        </Link>
      </p>
      <Disclaimer className="mt-12" />
    </article>
  );
}
