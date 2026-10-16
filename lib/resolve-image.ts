import fs from "fs";
import path from "path";

export function resolvePracticeImage(id: string, fallback: string): string {
  const exerciseDir = path.join(process.cwd(), "public", "exercises", id);
  if (fs.existsSync(path.join(exerciseDir, "still.png"))) {
    return `/exercises/${id}/still.png`;
  }
  if (fs.existsSync(path.join(exerciseDir, "demo.gif"))) {
    return `/exercises/${id}/demo.gif`;
  }
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
  const fallbackFile = fallback.startsWith("/")
    ? path.join(process.cwd(), "public", fallback.slice(1))
    : "";
  if (fallbackFile && fs.existsSync(fallbackFile)) {
    return fallback;
  }
  return "/practices/custom.svg";
}
