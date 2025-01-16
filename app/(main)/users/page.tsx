import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserDialog } from "./create-user-dialog";
import { UserTable } from "./user-table";
import { getUsers, getUserClients, getNodes } from "./actions";

export default async function UsersPage() {
  const [users, clients, nodes] = await Promise.all([
    getUsers(),
    getUserClients(),
    getNodes(),
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <CardTitle>用户管理 ({users.length})</CardTitle>
          <CreateUserDialog />
        </div>
      </CardHeader>
      <CardContent>
        <UserTable users={users} clients={clients} nodes={nodes} />
      </CardContent>
    </Card>
  );
}
