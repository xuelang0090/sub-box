import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSubconverters } from "./actions"
import { SubconverterTable } from "./subconverter-table"
import { CreateSubconverterDialog } from "./create-subconverter-dialog"

export default async function SubconvertersPage() {
  const subconverters = await getSubconverters()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>订阅转换器 ({subconverters.length})</CardTitle>
        <CreateSubconverterDialog />
      </CardHeader>
      <CardContent>
        <SubconverterTable subconverters={subconverters} />
      </CardContent>
    </Card>
  )
}

