"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ExportPage() {
  const [importing, setImporting] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error("导出失败");
      }
      const data = await response.json();
      
      // 创建下载
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sub-box-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("导出成功");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("导出失败");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          const response = await fetch("/api/export", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data,
              options: {
                skipExisting,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("导入失败");
          }

          toast.success("导入成功");
          // 清除文件选择
          event.target.value = "";
        } catch (error) {
          console.error("Import failed:", error);
          toast.error("导入失败");
        }
      };

      reader.readAsText(file);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>数据导入导出</CardTitle>
          <CardDescription>导出或导入所有数据，包括用户、节点、订阅转换器和Clash配置等</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button onClick={handleExport}>导出数据</Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="skip-existing"
                checked={skipExisting}
                onCheckedChange={setSkipExisting}
              />
              <Label htmlFor="skip-existing">导入时跳过已存在的数据</Label>
            </div>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
                id="import-file"
              />
              <Button
                asChild
                variant="outline"
                disabled={importing}
              >
                <label htmlFor="import-file" className="cursor-pointer">
                  {importing ? "导入中..." : "导入数据"}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 