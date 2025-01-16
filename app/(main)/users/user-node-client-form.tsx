"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type Node, type NodeClient } from "@/types";
import { createOrUpdateNodeClient } from "../nodes/actions";

const formSchema = z.object({
  nodeId: z.string().min(1, "节点不能为空"),
  url: z.string().min(1, "URL不能为空"),
  enable: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface UserNodeClientFormProps {
  userId: string;
  nodes: Node[];
  item?: NodeClient & { users: { userId: string; enable: boolean; order: number }[] };
  onSuccess?: () => void;
}

export function UserNodeClientForm({ userId, nodes, item, onSuccess }: UserNodeClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const userOption = item?.users.find(u => u.userId === userId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodeId: item?.nodeId ?? (nodes.length === 1 ? nodes[0]?.id ?? "" : ""),
      url: item?.url ?? "",
      enable: userOption?.enable ?? true,
    },
  });

  const selectedNode = nodes.find((n) => n.id === form.watch("nodeId"));

  const replaceHostInUrl = () => {
    const currentUrl = form.getValues("url");
    if (!currentUrl) {
      toast("URL不能为空");
      return;
    }
    if (!selectedNode?.host) {
      toast("节点主机不能为空");
      return;
    }

    const match = currentUrl.match(/@([^:]+):/);
    if (!match) {
      toast("URL格式不正确，未找到可替换的主机");
      return;
    }

    const newUrl = currentUrl.replace(/@([^:]+):/, `@${selectedNode.host}:`);
    form.setValue("url", newUrl);
    toast("主机已替换");
  };

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        await createOrUpdateNodeClient(data.nodeId, {
          url: data.url,
          userOptions: [{
            userId,
            enable: data.enable
          }]
        });

        toast("保存成功");
        router.refresh();
        onSuccess?.();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>节点</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择节点" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>URL</FormLabel>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={replaceHostInUrl}>
                  覆盖主机
                </Button>
              </div>
              <FormControl>
                <Textarea {...field} rows={6} className="font-mono text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">启用</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  );
} 