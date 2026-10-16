import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function MusclePage({ params }: Props) {
  const { id } = await params;
  redirect(`/exercises?m=${id}`);
}
