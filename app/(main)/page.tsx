import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>欢迎使用 Sub Box</CardTitle>
      </CardHeader>
      <CardContent>
        <p>这是一个管理和聚合订阅地址的服务。</p>
      </CardContent>
    </Card>
  );
}
