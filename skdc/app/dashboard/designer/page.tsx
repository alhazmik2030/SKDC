import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyDesignerEntryRedirect({
  searchParams,
}: {
  searchParams: Promise<{ pick?: string }>;
}) {
  const { pick } = await searchParams;
  redirect(pick ? `/dashboard/studio?pick=${pick}` : "/dashboard/studio");
}
