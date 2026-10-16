import type { Practice } from "@/lib/types";
import { LibraryClient } from "./LibraryClient";

export function ScopedLibrary({
  practices,
  heading,
  intro,
  empty,
  lockFavorites,
  showBody,
}: {
  practices: Practice[];
  heading?: string;
  intro?: string;
  empty?: string;
  lockFavorites?: boolean;
  showBody?: boolean;
}) {
  return (
    <LibraryClient
      practices={practices}
      heading={heading}
      intro={intro}
      empty={empty}
      lockFavorites={lockFavorites}
      showBody={showBody}
    />
  );
}
