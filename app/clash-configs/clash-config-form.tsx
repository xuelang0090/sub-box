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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { type ClashConfig } from "@/types"

import { createClashConfig, updateClashConfig } from "./actions"

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  globalConfig: z.string().min(1, "全局配置不能为空"),
  rules: z.string().min(1, "规则不能为空"),
})

type FormData = z.infer<typeof formSchema>

interface ClashConfigFormProps {
  config?: ClashConfig
  onSuccess?: () => void
}

export function ClashConfigForm({ config, onSuccess }: ClashConfigFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: config?.name ?? "",
      globalConfig: config?.globalConfig ?? "",
      rules: config?.rules ?? "",
    },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        if (config) {
          await updateClashConfig(config.id, data)
        } else {
          await createClashConfig(data)
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
          name="globalConfig"
          render={({ field }) => (
            <FormItem>
              <FormLabel>全局配置</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="# YAML 格式"
                  className="font-mono"
                  rows={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>规则</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="# YAML 格式"
                  className="font-mono"
                  rows={10}
                />
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