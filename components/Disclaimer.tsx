import { DISCLAIMER } from "@/lib/labels";

export function Disclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-ink/45 ${className}`}>{DISCLAIMER}</p>;
}
