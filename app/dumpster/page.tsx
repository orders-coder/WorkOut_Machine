import type { Metadata } from "next";
import { Dumpster } from "@/components/Dumpster";

export const metadata: Metadata = {
  title: "Dumpster",
};

export default function DumpsterPage() {
  return <Dumpster />;
}
