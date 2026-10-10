import mediaCatalog from "@/data/media.json";
import type { Practice, PracticeMedia } from "./types";
import { DRAWING_CHOICE } from "./types";

const catalog = mediaCatalog as PracticeMedia[];
const byId = new Map(catalog.map((entry) => [entry.practiceId, entry]));

export function getPracticeMedia(id: string): PracticeMedia {
  return byId.get(id) ?? { practiceId: id, photos: [], links: [] };
}

export function resolveChosenImage(
  practice: Practice,
  photoChoice: Record<string, string> | undefined,
): string {
  const choice = photoChoice?.[practice.id];
  if (!choice || choice === DRAWING_CHOICE) {
    return practice.image;
  }
  const photo = getPracticeMedia(practice.id).photos.find((item) => item.id === choice);
  return photo?.src ?? practice.image;
}
