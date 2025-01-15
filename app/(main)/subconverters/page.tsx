import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubconverters } from "./actions";
import { CreateSubconverterDialog } from "./create-subconverter-dialog";
import { SubconverterTable } from "./subconverter-table";

export default async function SubconvertersPage() {
  const subconverters = await getSubconverters();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <CardTitle>订阅转换器 ({subconverters.length})</CardTitle>
          <CreateSubconverterDialog />
        </div>
      </CardHeader>
      <CardContent>
        <SubconverterTable subconverters={subconverters} />
      </CardContent>
    </Card>
  );
}
