"use server"

import { revalidatePath } from "next/cache"
import { subconverterService } from "@/server/services/subconverter-service"
import type { Subconverter } from "@/types"

export async function getSubconverters() {
  return subconverterService.getAll()
}

export async function createSubconverter(data: Omit<Subconverter, "id" | "createdAt" | "updatedAt">) {
  const subconverter = await subconverterService.create(data)
  revalidatePath("/subconverters")
  return subconverter
}

export async function verifySubconverterUrl(url: string) {
  try {
    const response = await fetch(`${url}/version`)
    if (!response.ok) {
      throw new Error("验证失败")
    }
    return await response.text()
  } catch (_error) {
    throw new Error("验证失败：无法连接到服务器")
  }
}

export async function updateSubconverter(id: string, data: Partial<Omit<Subconverter, "id" | "createdAt" | "updatedAt">>) {
  const subconverter = await subconverterService.update(id, data)
  revalidatePath("/subconverters")
  return subconverter
}

export async function deleteSubconverter(id: string) {
  await subconverterService.delete(id)
  revalidatePath("/subconverters")
}

