import type { Way } from "@/lib/types";
import { WAY_LABEL } from "@/lib/labels";

const PIP: Record<Way, string> = {
  inner: "bg-inner-ink",
  "soft-body": "bg-soft-sage",
  strength: "bg-strength-clay",
};

const TEXT: Record<Way, string> = {
  inner: "text-inner-ink",
  "soft-body": "text-soft-sage",
  strength: "text-strength-clay",
};

export function WayMark({
  way,
  size = "md",
}: {
  way: Way;
  size?: "sm" | "md";
}) {
  const label = WAY_LABEL[way];
  const text = size === "sm" ? "text-[0.7rem]" : "text-xs";
  const pip = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span
      className={`inline-flex items-center gap-1.5 tracking-[0.14em] uppercase ${text} ${TEXT[way]}`}
    >
      <span className={`${pip} rounded-full ${PIP[way]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
