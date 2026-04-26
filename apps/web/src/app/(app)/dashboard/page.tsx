import { Card, CardContent } from "@boilerplate/ui/components/card";
import { headers } from "next/headers";

import Header from "@/components/header";
import { authClient } from "@/lib/auth-client";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  return (
    <div className="px-8">
      <Header />
      <div className="flex flex-col max-w-3xl mx-auto">
        <p className="overflow-x-auto font-medium mt-48">Dashboard</p>
        <div className="grid gap-6 mt-2">
          <Card size="sm">
            <CardContent className="group-data-[size=sm]/card:px-4.5">
              <p className="mb-1">Welcome {session?.user.name}</p>
              <Dashboard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
