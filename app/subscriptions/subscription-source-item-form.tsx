"use client"

import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { type SubscriptionSourceItem, type User, type SubscriptionSource } from "@/types"

import { createSubscriptionSourceItem, updateSubscriptionSourceItem } from "./actions"

const formSchema = z.object({
  userId: z.string().min(1, "用户不能为空"),
  subscriptionSourceId: z.string().min(1, "订阅源不能为空"),
  url: z.string().min(1, "URL不能为空"), // 不需要检查 url 是否是有效，因为可能有 vless:// 等格式
  enable: z.boolean(),
  upToDate: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface SubscriptionSourceItemFormProps {
  userId?: string
  sources: SubscriptionSource[]
  users?: User[]
  item?: SubscriptionSourceItem
  onSuccess?: () => void
}

export function SubscriptionSourceItemForm({ userId, sources, users, item, onSuccess }: SubscriptionSourceItemFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: item?.userId ?? userId ?? "",
      subscriptionSourceId: item?.subscriptionSourceId ?? "",
      url: item?.url ?? "",
      enable: item?.enable ?? true,
      upToDate: item?.upToDate ?? true,
    },
  })

  const selectedSource = sources.find(s => s.id === form.watch("subscriptionSourceId"))

  const replaceIpInUrl = () => {
    const currentUrl = form.getValues("url")
    if (!currentUrl) {
      toast("URL不能为空")
      return
    }
    if (!selectedSource?.ip) {
      toast("订阅源IP不能为空")
      return
    }

    const match = currentUrl.match(/@([^:]+):/)
    if (!match) {
      toast("URL格式不正确，未找到可替换的IP")
      return
    }

    const newUrl = currentUrl.replace(/@([^:]+):/, `@${selectedSource.ip}:`)
    form.setValue("url", newUrl)
    toast("IP已替换")
  }

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        const submitData = {
          ...data,
        }
        if (item) {
          await updateSubscriptionSourceItem(item.id, submitData)
        } else {
          await createSubscriptionSourceItem(submitData)
        }

        toast("保存成功")
        
        onSuccess?.()
      } catch (error) {
        toast("保存失败", {
          description: (error as Error).message,
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!userId && users && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="subscriptionSourceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>订阅源</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择订阅源" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={replaceIpInUrl}
                >
                  覆盖IP
                </Button>
              </div>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  className="font-mono text-sm"
                />
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
                <FormLabel className="text-base">
                  启用
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="upToDate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  设为最新
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  )
} 