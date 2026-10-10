import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-6 pt-16 text-center">
      <h1 className="font-display text-3xl text-ink">That card is not here.</h1>
      <p className="mt-3 text-ink/65">It may have been renamed, or not planted yet.</p>
      <Link href="/" className="mt-8 inline-block text-ink underline decoration-ink/25 underline-offset-4">
        Back to Ways
      </Link>
    </div>
  );
}
