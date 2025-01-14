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

import { createSubconverter, updateSubconverter, verifySubconverterUrl } from "./actions"

const formSchema = z.object({
  url: z.string()
    .url("请输入有效的URL")
    .refine(url => !url.endsWith('/'), "URL 末尾不能有斜杠"),
  options: z.record(z.string()).superRefine((val, ctx) => {
    // 检查是否为单层 JSON 对象
    for (const value of Object.values(val)) {
      if (typeof value !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "选项值必须为字符串",
        })
        return
      }
    }
  }),
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
      options: subconverter?.options ?? {},
    },
  })

  function onSubmit(data: FormData) {
    let options: Record<string, string>
    try {
      const parsed = JSON.parse(data.options as unknown as string)
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        throw new Error("选项必须是对象格式")
      }
      options = parsed
    } catch (error) {
      toast((error as Error).message)
      return
    }

    startTransition(async () => {
      try {
        if (subconverter) {
          await updateSubconverter(subconverter.id, { ...data, options })
        } else {
          await createSubconverter({ ...data, options })
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
                  placeholder='{
  "key1": "value1",
  "key2": "value2"
}'
                  value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      field.onChange(parsed)
                    } catch {
                      field.onChange(e.target.value)
                    }
                  }}
                  className="font-mono"
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                请输入 JSON 格式的选项，只支持一层键值对
              </FormDescription>
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