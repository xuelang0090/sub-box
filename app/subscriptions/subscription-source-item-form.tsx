"use client"

import { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { type SubscriptionSourceItem, type User } from "@/types"

import { createSubscriptionSourceItem, updateSubscriptionSourceItem } from "./actions"

const formSchema = z.object({
  userId: z.string().min(1, "用户不能为空"),
  url: z.string().min(1, "URL不能为空").refine((val) => /^https?:\/\/.+/.test(val), "请输入有效的URL"),
  enable: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface SubscriptionSourceItemFormProps {
  sourceId: string
  item?: SubscriptionSourceItem
  users: User[]
  onSuccess?: () => void
}

export function SubscriptionSourceItemForm({ sourceId, item, users, onSuccess }: SubscriptionSourceItemFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: item?.userId ?? "",
      url: item?.url ?? "",
      enable: item?.enable ?? true,
    },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        const submitData = {
          ...data,
          subscriptionSourceId: sourceId,
          upToDate: false,
        }
        if (item) {
          await updateSubscriptionSourceItem(item.id, submitData)
        } else {
          await createSubscriptionSourceItem(submitData)
        }

        toast({
          description: "保存成功",
        })
        
        onSuccess?.()
      } catch (error) {
        toast({
          variant: "destructive",
          description: (error as Error).message,
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} />
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  )
} 