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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { type Subconverter } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"

import { createSubconverter, updateSubconverter, verifySubconverterUrl } from "./actions"

const formSchema = z.object({
  url: z.string()
    .url("请输入有效的URL")
    .refine(url => !url.endsWith('/'), "URL 末尾不能有斜杠"),
  options: z.string()
    .default("insert=false&config=https%3A%2F%2Fraw.githubusercontent.com%2FACL4SSR%2FACL4SSR%2Fmaster%2FClash%2Fconfig%2FACL4SSR_Online_Full_NoAuto.ini&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=false&fdn=false&new_name=true")
    .refine(str => {
      try {
        new URLSearchParams(str);
        return true;
      } catch {
        return false;
      }
    }, "请输入有效的 URL 参数格式"),
  isDefault: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface SubconverterFormProps {
  subconverter?: Subconverter
  onSuccess?: () => void
}

export function SubconverterForm({ subconverter, onSuccess }: SubconverterFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: subconverter?.url ?? "",
      options: subconverter?.options ?? "insert=false&config=https%3A%2F%2Fraw.githubusercontent.com%2FACL4SSR%2FACL4SSR%2Fmaster%2FClash%2Fconfig%2FACL4SSR_Online_Full_NoAuto.ini&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=false&fdn=false&new_name=true",
      isDefault: subconverter?.isDefault ?? false,
    },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        if (subconverter) {
          await updateSubconverter(subconverter.id, data)
        } else {
          await createSubconverter(data)
        }

        toast("保存成功")
        
        onSuccess?.()
      } catch (error) {
        toast((error as Error).message)
      }
    })
  }

  async function verifyUrl() {
    // 先验证表单
    const result = await form.trigger("url")
    if (!result) {
      return
    }

    const url = form.getValues("url")
    startTransition(async () => {
      try {
        const version = await verifySubconverterUrl(url)
        toast(`验证成功: ${version}`)
      } catch (error) {
        toast((error as Error).message)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input {...field} placeholder="https://example.com" />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyUrl}
                  disabled={isPending}
                >
                  {isPending ? "验证中..." : "验证"}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="options"
          render={({ field }) => (
            <FormItem>
              <FormLabel>选项</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="insert=false&config=https%3A%2F%2Fexample.com%2Fconfig.ini&emoji=true"
                  className="font-mono"
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                请输入 URL 参数格式的选项，例如：key1=value1&key2=value2
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  设为默认
                </FormLabel>
                <FormDescription>
                  设为默认后，新用户将自动使用此转换器
                </FormDescription>
              </div>
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