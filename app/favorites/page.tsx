import type { Metadata } from "next";
import { ScopedLibrary } from "@/components/ScopedLibrary";
import { practices } from "@/data/practices";
import { attachPracticeMedia } from "@/lib/resolve-image";

export const metadata: Metadata = {
  title: "Favorite",
};

export default function FavoritesPage() {
  return (
    <ScopedLibrary
      practices={practices.map(attachPracticeMedia)}
      heading="Favorite"
      intro="The ones you keep, in the way you chose today."
      empty="Heart a practice to keep it here."
      lockFavorites
    />
  );
}
