"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Upload, FileJson } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExportData } from "@/server/services/export-service";

export default function ExportPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);
  const [previewData, setPreviewData] = useState<ExportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error("导出失败");
      }
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sub-box-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("数据导出成功");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  const validateImportFile = (file: File): boolean => {
    if (!file.name.endsWith('.json')) {
      toast.error("请选择 JSON 格式的文件");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("文件大小超过限制（10MB）");
      return false;
    }
    return true;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImportFile(file)) {
      event.target.value = "";
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          setPreviewData(data);
          setShowPreview(true);
        } catch (_error) {
          toast.error("文件格式无效，请选择正确的导出文件");
          event.target.value = "";
        }
      };
      reader.readAsText(file);
    } catch (_error) {
      toast.error("读取文件失败");
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (!previewData) return;

    try {
      setImporting(true);
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: previewData,
          options: {
            skipExisting,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("导入失败");
      }

      toast.success("数据导入成功");
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("导入失败，请重试");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Export Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            数据导出
          </CardTitle>
          <CardDescription>导出所有数据，包括用户、节点、订阅转换器和Clash配置等</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full sm:w-auto"
          >
            {exporting ? "导出中..." : "导出数据"}
          </Button>
        </CardContent>
      </Card>

      {/* Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            数据导入
          </CardTitle>
          <CardDescription>从之前的导出文件中恢复数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              请确保导入的文件来自可信来源，导入操作可能会修改现有数据
            </AlertDescription>
          </Alert>

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
                onChange={handleFileSelect}
                disabled={importing}
                className="hidden"
                id="import-file"
              />
              <Button
                asChild
                variant="outline"
                disabled={importing}
                className="w-full sm:w-auto"
              >
                <label htmlFor="import-file" className="cursor-pointer">
                  <FileJson className="mr-2 h-4 w-4" />
                  {importing ? "导入中..." : "选择导入文件"}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>确认导入数据</DialogTitle>
            <DialogDescription>
              请确认以下数据是否正确，导入后将无法撤销
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <pre className="text-sm whitespace-pre-wrap max-h-[300px] overflow-auto">
                {previewData && JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={importing}
            >
              取消
            </Button>
            <Button 
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? "导入中..." : "确认导入"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 