import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
