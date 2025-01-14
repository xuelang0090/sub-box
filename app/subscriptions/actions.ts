"use server"

import { revalidatePath } from "next/cache"
import { subscriptionSourceService } from "@/lib/services/subscription-source-service"
import type { SubscriptionSource } from "@/types"

export async function getSubscriptionSources() {
  return subscriptionSourceService.getAll()
}

export async function createSubscriptionSource(data: Omit<SubscriptionSource, "id">) {
  const source = await subscriptionSourceService.create(data)
  revalidatePath("/subscriptions")
  return source
}

export async function updateSubscriptionSource(id: string, data: Omit<SubscriptionSource, "id">) {
  const source = await subscriptionSourceService.update(id, data)
  revalidatePath("/subscriptions")
  return source
}

export async function deleteSubscriptionSource(id: string) {
  await subscriptionSourceService.delete(id)
  revalidatePath("/subscriptions")
}

