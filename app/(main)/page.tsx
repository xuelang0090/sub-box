import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userService } from "@/server/services/user-service"
import { nodeService } from "@/server/services/node-service"
import { subconverterService } from "@/server/services/subconverter-service"
import { clashConfigService } from "@/server/services/clash-config-service"
import { UserList } from "./user-list"

export default async function Home() {
  const users = await userService.getAll()
  const nodes = await nodeService.getAll()
  const subconverters = await subconverterService.getAll()
  const clashConfigs = await clashConfigService.getAll()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>总节点数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{nodes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>转换器数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{subconverters.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>配置数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clashConfigs.length}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <UserList users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
