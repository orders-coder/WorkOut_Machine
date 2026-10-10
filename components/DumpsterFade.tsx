"use client";

import type { ReactNode } from "react";
import type { DumpsterKind } from "@/lib/dumpster";
import { useLibrary } from "./LibraryProvider";

export function DumpsterFade({
  kind,
  id,
  children,
}: {
  kind: DumpsterKind;
  id: string;
  children: ReactNode;
}) {
  const { isInDumpster } = useLibrary();
  return (
    <div className={isInDumpster(kind, id) ? "opacity-40 transition-opacity duration-300" : ""}>
      {children}
    </div>
  );
}
