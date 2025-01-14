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
import { useToast } from "@/components/ui/use-toast"
import { type Subconverter } from "@/types"

import { createSubconverter, updateSubconverter } from "./actions"

const formSchema = z.object({
  url: z.string().url("请输入有效的URL"),
  options: z.record(z.string()),
})

type FormData = z.infer<typeof formSchema>

interface SubconverterFormProps {
  subconverter?: Subconverter
  onSuccess?: () => void
}

export function SubconverterForm({ subconverter, onSuccess }: SubconverterFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: subconverter?.url ?? "",
      options: subconverter?.options ?? {},
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
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
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