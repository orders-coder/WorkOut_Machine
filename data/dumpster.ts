/**
 * Catalog dumpster — duplicates and retired items live here for a few days
 * before they should be removed from the repo for good.
 */
import type { DumpsterKind } from "@/lib/dumpster";

export interface CatalogDumpsterItem {
  kind: DumpsterKind;
  id: string;
  title: string;
  aliasOf?: string;
  reason: string;
  deletedAt: string;
  keepUntil: string;
}

export const catalogDumpster: CatalogDumpsterItem[] = [
  {
    kind: "exercise",
    id: "ride-glute-bridge",
    title: "Glute bridge before a ride",
    aliasOf: "glute-bridge",
    reason: "Same shape as glute-bridge.",
    deletedAt: "2026-09-05",
    keepUntil: "2026-09-07",
  },
  {
    kind: "exercise",
    id: "hip-flexor-antidote",
    title: "Hip-flexor antidote",
    aliasOf: "kneeling-hip-flexor",
    reason: "Same kneeling lunge as kneeling-hip-flexor.",
    deletedAt: "2026-09-05",
    keepUntil: "2026-09-07",
  },
  {
    kind: "exercise",
    id: "thoracic-after-bars",
    title: "Thoracic extension after the bars",
    aliasOf: "thoracic-extension-roller",
    reason: "Same mid-back opener as thoracic-extension-roller.",
    deletedAt: "2026-09-05",
    keepUntil: "2026-09-07",
  },
];

export function getAlias(id: string): string | undefined {
  return catalogDumpster.find((item) => item.id === id)?.aliasOf;
}
