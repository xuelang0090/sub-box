"use server"

import { revalidatePath } from "next/cache"
import { clashConfigService } from "@/server/services/clash-config-service"
import type { ClashConfig } from "@/types"

export async function getClashConfigs() {
  return clashConfigService.getAll()
}

export async function createClashConfig(data: Omit<ClashConfig, "id" | "createdAt" | "updatedAt">) {
  const config = await clashConfigService.create(data)
  revalidatePath("/clash-configs")
  return config
}

export async function updateClashConfig(id: string, data: Omit<ClashConfig, "id" | "createdAt" | "updatedAt">) {
  const config = await clashConfigService.update(id, data)
  revalidatePath("/clash-configs")
  return config
}

export async function deleteClashConfig(id: string) {
  await clashConfigService.delete(id)
  revalidatePath("/clash-configs")
}

