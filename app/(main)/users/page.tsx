import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNodes } from "../nodes/actions";
import { getClashConfigs, getUsers } from "./actions";
import { CreateUserDialog } from "./create-user-dialog";
import { UserTable } from "./user-table";

export default async function UsersPage() {
  const [users, nodes, clashConfigs] = await Promise.all([getUsers(), getNodes(), getClashConfigs()]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <CardTitle>用户管理 ({users.length})</CardTitle>
          <CreateUserDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>加载中...</div>}>
          <UserTable users={users} items={nodes.flatMap((node) => node.items)} nodes={nodes} clashConfigs={clashConfigs} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
