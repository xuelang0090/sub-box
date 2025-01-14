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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type User, type Subconverter, type ClashConfig } from "@/types"

import { createUser, updateUser, getSubconverters, getClashConfigs } from "./actions"
import { useEffect, useState } from "react"

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  subconverterId: z.string().nullable(),
  mergeConfigId: z.string().nullable(),
})

type FormData = z.infer<typeof formSchema>

interface UserFormProps {
  user?: User
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [isPending, startTransition] = useTransition()
  const [subconverters, setSubconverters] = useState<Subconverter[]>([])
  const [clashConfigs, setClashConfigs] = useState<ClashConfig[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [subconvertersData, clashConfigsData] = await Promise.all([
        getSubconverters(),
        getClashConfigs(),
      ])
      setSubconverters(subconvertersData)
      setClashConfigs(clashConfigsData)
    }
    loadData()
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? "",
      subconverterId: user?.subconverterId ?? null,
      mergeConfigId: user?.mergeConfigId ?? null,
    },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        if (user) {
          await updateUser(user.id, data)
        } else {
          await createUser({
            ...data,
            subconverterId: data.subconverterId || null,
            mergeConfigId: data.mergeConfigId || null,
          })
        }

        toast("保存成功")
        
        onSuccess?.()
      } catch (error) {
        toast.error((error as Error).message)
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
              <Select
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择订阅转换器" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem key="none" value="none">无</SelectItem>
                  {subconverters.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.url}
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
          name="mergeConfigId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clash 配置</FormLabel>
              <Select
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择 Clash 配置" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem key="none" value="none">无</SelectItem>
                  {clashConfigs.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

