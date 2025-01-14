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
import { useToast } from "@/components/ui/use-toast"
import { type SubscriptionSource } from "@/types"

import { createSubscriptionSource, updateSubscriptionSource } from "./actions"

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  inboundProtocol: z.string().min(1, "入站协议不能为空"),
  ip: z.string().optional(),
  url: z.string().refine((val) => !val || /^https?:\/\/.+/.test(val), "请输入有效的URL").optional(),
})

type FormData = z.infer<typeof formSchema>

interface SubscriptionSourceFormProps {
  source?: SubscriptionSource
  onSuccess?: () => void
}

export function SubscriptionSourceForm({ source, onSuccess }: SubscriptionSourceFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: source?.name ?? "",
      inboundProtocol: source?.inboundProtocol ?? "",
      ip: source?.ip ?? "",
      url: source?.url ?? "",
    },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        const submitData = {
          ...data,
          lastUpdate: new Date().toISOString(),
        }
        if (source) {
          await updateSubscriptionSource(source.id, submitData)
        } else {
          await createSubscriptionSource(submitData)
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
          name="inboundProtocol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>入站协议</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择协议" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vmess">VMess</SelectItem>
                  <SelectItem value="vless">VLESS</SelectItem>
                  <SelectItem value="trojan">Trojan</SelectItem>
                  <SelectItem value="shadowsocks">Shadowsocks</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IP</FormLabel>
              <FormControl>
                <Input {...field} placeholder="可选" />
              </FormControl>
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
  )
} 