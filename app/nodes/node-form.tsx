"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Node } from "@/types";
import { createNode, updateNode } from "./actions";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  type: z.string().min(1, "类型不能为空"),
  host: z.string().optional(),
  accessUrl: z
    .string()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), "请输入有效的URL")
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NodeFormProps {
  node?: Node;
  onSuccess?: () => void;
}

export function NodeForm({ node, onSuccess }: NodeFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: node?.name ?? "",
      type: node?.type ?? "",
      host: node?.host ?? "",
      accessUrl: node?.accessUrl ?? "",
    },
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        const submitData = {
          ...data,
          host: data.host || null,
          accessUrl: data.accessUrl || null,
        };
        if (node) {
          await updateNode(node.id, submitData);
        } else {
          await createNode(submitData);
        }

        toast("保存成功");

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>类型</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3x-ui">3X-UI</SelectItem>
                  <SelectItem value="external-subscription">外部订阅</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>主机</FormLabel>
              <FormControl>
                <Input {...field} placeholder="可选" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>访问URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="可选" />
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
