"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { CollapseDisplay } from "@/components/collapse-display";
import { PopupSheet } from "@/components/popup-sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type Node, type User } from "@/types";
import { findNodeClientByNodeAndUser, createOrUpdateNodeClient } from "./actions";

interface ImportItem {
  url: string;
  userId: string;
  enable: boolean;
  mode: "create" | "update";
}

interface BatchImportNodeClientDialogProps {
  userId?: string;
  node?: Node;
  nodes: Node[];
  users: User[];
}

export function BatchImportNodeClientDialog({ userId, node, nodes, users }: BatchImportNodeClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [urls, setUrls] = useState("");
  const [items, setItems] = useState<ImportItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleUrlsChange = (value: string) => {
    setUrls(value);
  };

  const handleNext = async () => {
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    if (urlList.length === 0) {
      toast.error("请输入至少一个URL");
      return;
    }

    const nodeId = node?.id ?? nodes[0]?.id;
    if (!nodeId) {
      toast.error("未选择节点");
      return;
    }

    startTransition(async () => {
      try {
        // Check existing clients
        const items = await Promise.all(
          urlList.map(async (url) => {
            const defaultUserId = userId ?? "";
            const existing = defaultUserId ? 
              await findNodeClientByNodeAndUser(nodeId, defaultUserId) : 
              null;
            return {
              url,
              userId: defaultUserId,
              enable: true,
              mode: existing ? ("update" as const) : ("create" as const),
            };
          })
        );

        setItems(items);
        setStep(2);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleImport = () => {
    if (items.some((item) => !item.userId)) {
      toast.error("请为所有URL选择用户");
      return;
    }

    startTransition(async () => {
      try {
        const nodeId = node?.id ?? nodes[0]?.id;
        if (!nodeId) {
          throw new Error("未选择节点");
        }

        // 按URL分组，合并相同URL的用户选项
        const groupedItems = items.reduce((acc, item) => {
          if (!acc[item.url]) {
            acc[item.url] = {
              url: item.url,
              userOptions: []
            };
          }
          acc[item.url]!.userOptions.push({
            userId: item.userId,
            enable: item.enable
          });
          return acc;
        }, {} as Record<string, {
          url: string;
          userOptions: { userId: string; enable: boolean; }[];
        }>);
        console.log(groupedItems);

        // 批量导入
        for (const item of Object.values(groupedItems)) {
          await createOrUpdateNodeClient(nodeId, item);
        }

        toast.success("导入成功");
        setOpen(false);
        setStep(1);
        setUrls("");
        setItems([]);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const updateItem = (index: number, data: Partial<ImportItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    );
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        批量导入
      </Button>

      <PopupSheet 
        open={open} 
        onOpenChange={(open) => {
          if (!open) {
            setOpen(false);
            setStep(1);
            setUrls("");
            setItems([]);
          }
        }} 
        title="批量导入客户端"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label>每行一个URL</Label>
                <Textarea
                  value={urls}
                  onChange={(e) => handleUrlsChange(e.target.value)}
                  rows={10}
                  className="font-mono"
                  placeholder="vless://xxx&#10;vless://yyy"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={isPending}>
                  {isPending ? "处理中..." : "下一步"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-4">
                    <CollapseDisplay url={item.url} />
                    <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
                      <div className="space-y-2">
                        <Label>用户</Label>
                        <Select
                          value={item.userId}
                          onValueChange={async (value) => {
                            const nodeId = node?.id ?? nodes[0]?.id;
                            if (nodeId) {
                              const existing = await findNodeClientByNodeAndUser(nodeId, value);
                              updateItem(index, { 
                                userId: value,
                                mode: existing ? "update" : "create"
                              });
                            } else {
                              updateItem(index, { userId: value });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择用户" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4 self-end">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.enable}
                            onCheckedChange={(checked) =>
                              updateItem(index, { enable: checked })
                            }
                          />
                          <Label>启用</Label>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.mode === "create" ? "新建" : "更新"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  上一步
                </Button>
                <Button onClick={handleImport} disabled={isPending}>
                  {isPending ? "导入中..." : "导入"}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopupSheet>
    </>
  );
} 