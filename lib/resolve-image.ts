import fs from "fs";
import path from "path";

export function resolvePracticeImage(id: string, fallback: string): string {
  const dir = path.join(process.cwd(), "public", "practices");
  const candidates = [`${id}.gif`, `${id}.jpg`, `${id}.jpeg`, `${id}.webp`, `${id}.png`];
  for (const file of candidates) {
    if (fs.existsSync(path.join(dir, file))) {
      return `/practices/${file}`;
    }
  }
  if (fs.existsSync(path.join(dir, `${id}.svg`))) {
    return `/practices/${id}.svg`;
  }
  return fallback;
}
