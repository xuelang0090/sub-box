"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Node, type NodeClient, type User } from "@/types";
import { createNodeClient, updateNodeClient } from "./actions";

const formSchema = z.object({
  userIds: z.array(z.string()).min(1, "至少选择一个用户"),
  nodeId: z.string().min(1, "节点不能为空"),
  url: z.string().min(1, "URL不能为空"), // 不需要检查 url 是否是有效，因为可能有 vless:// 等格式
  userOptions: z.array(z.object({
    userId: z.string(),
    enable: z.boolean(),
  })),
});

type FormData = z.infer<typeof formSchema>;

interface NodeClientFormProps {
  userId?: string;
  nodes: Node[];
  users?: User[];
  item?: NodeClient & { users: { userId: string; enable: boolean; order: number }[] };
  onSuccess?: () => void;
}

export function NodeClientForm({ userId, nodes, users, item, onSuccess }: NodeClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: item ? item.users.map(u => u.userId) : userId ? [userId] : [],
      nodeId: item?.nodeId ?? (nodes.length === 1 ? nodes[0]?.id ?? "" : ""),
      url: item?.url ?? "",
      userOptions: item ? item.users : userId ? [{ userId, enable: true }] : [],
    },
  });

  // Watch userIds to sync with userOptions
  const watchedUserIds = form.watch("userIds");
  useEffect(() => {
    const currentOptions = form.getValues("userOptions");
    const newOptions = watchedUserIds.map(userId => {
      const existing = currentOptions.find(opt => opt.userId === userId);
      return existing || { userId, enable: true };
    });
    form.setValue("userOptions", newOptions);
  }, [watchedUserIds, form]);

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
        const submitData = {
          nodeId: data.nodeId,
          url: data.url,
          userOptions: data.userOptions,
        };

        if (item) {
          await updateNodeClient(item.id, submitData);
        } else {
          await createNodeClient(submitData);
        }

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
        {!userId && users && (
          <FormField
            control={form.control}
            name="userIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户</FormLabel>
                <MultiSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={users.map((user) => ({
                    value: user.id,
                    label: user.name,
                  }))}
                  placeholder="选择用户"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  );
}
