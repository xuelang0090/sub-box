import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNodes } from "../nodes/actions";
import { getUsers } from "./actions";
import { CreateUserDialog } from "./create-user-dialog";
import { UserTable } from "./user-table";

export default async function UsersPage() {
  const [users, nodes] = await Promise.all([getUsers(), getNodes()]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>用户管理 ({users.length})</CardTitle>
        <CreateUserDialog />
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>加载中...</div>}>
          <UserTable users={users} items={nodes.flatMap((node) => node.items)} nodes={nodes} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
