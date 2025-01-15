import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "../users/actions";
import { getNodes } from "./actions";
import { CreateNodeDialog } from "./create-node-dialog";
import { NodeTable } from "./node-table";

export default async function SubscriptionsPage() {
  const [nodes, users] = await Promise.all([getNodes(), getUsers()]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>节点管理 ({nodes.length})</CardTitle>
        <CreateNodeDialog />
      </CardHeader>
      <CardContent>
        <NodeTable nodes={nodes} users={users} />
      </CardContent>
    </Card>
  );
}
