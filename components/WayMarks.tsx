import type { Practice } from "@/lib/types";
import { waysOf } from "@/lib/ways";
import { WayMark } from "./WayMark";

export function WayMarks({
  practice,
  size = "md",
}: {
  practice: Practice;
  size?: "sm" | "md";
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {waysOf(practice).map((way) => (
        <WayMark key={way} way={way} size={size} />
      ))}
    </span>
  );
}
