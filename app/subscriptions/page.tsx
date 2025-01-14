import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSubscriptionSources } from "./actions"
import { getUsers } from "../users/actions"
import { SubscriptionSourceTable } from "./subscription-source-table"
import { CreateSubscriptionDialog } from "./create-subscription-dialog"

export default async function SubscriptionsPage() {
  const [sources, users] = await Promise.all([
    getSubscriptionSources(),
    getUsers(),
  ])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>订阅源管理 ({sources.length})</CardTitle>
        <CreateSubscriptionDialog />
      </CardHeader>
      <CardContent>
        <SubscriptionSourceTable sources={sources} users={users} />
      </CardContent>
    </Card>
  )
}

