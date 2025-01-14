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
import { type User } from "@/types"

import { createUser, updateUser } from "./actions"

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  subconverterId: z.string().optional(),
  mergeConfigId: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface UserFormProps {
  user?: User
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? "",
      subconverterId: user?.subconverterId ?? "",
      mergeConfigId: user?.mergeConfigId ?? "",
    },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        if (user) {
          await updateUser(user.id, data)
        } else {
          await createUser(data)
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
          name="subconverterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>订阅转换器</FormLabel>
              <FormControl>
                <Input {...field} placeholder="可选" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mergeConfigId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clash 配置</FormLabel>
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

