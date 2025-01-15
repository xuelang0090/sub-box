import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriptionSources } from "../subscriptions/actions";
import { getUsers } from "./actions";
import { CreateUserDialog } from "./create-user-dialog";
import { UserTable } from "./user-table";

export default async function UsersPage() {
  const [users, sources] = await Promise.all([getUsers(), getSubscriptionSources()]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>用户管理 ({users.length})</CardTitle>
        <CreateUserDialog />
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>加载中...</div>}>
          <UserTable users={users} items={sources.flatMap((source) => source.items)} sources={sources} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
