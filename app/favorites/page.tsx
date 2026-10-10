import type { Metadata } from "next";
import { ScopedLibrary } from "@/components/ScopedLibrary";
import { practices } from "@/data/practices";
import { resolvePracticeImage } from "@/lib/resolve-image";
import type { Practice } from "@/lib/types";

export const metadata: Metadata = {
  title: "Favorite",
};

function withImages(items: Practice[]): Practice[] {
  return items.map((practice) => ({
    ...practice,
    image: resolvePracticeImage(practice.id, practice.image),
  }));
}

export default function FavoritesPage() {
  return (
    <ScopedLibrary
      practices={withImages(practices)}
      heading="Favorite"
      intro="The ones you keep, in the way you chose today."
      empty="Heart a practice to keep it here."
      lockFavorites
    />
  );
}
