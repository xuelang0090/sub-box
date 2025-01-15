"use server";

import { revalidatePath } from "next/cache";

import { subscriptionSourceItemService } from "@/server/services/subscription-source-item-service";
import { subscriptionSourceService } from "@/server/services/subscription-source-service";
import type { SubscriptionSource, SubscriptionSourceItem } from "@/types";

export async function getSubscriptionSources() {
  const sources = await subscriptionSourceService.getAll();
  const items = await subscriptionSourceItemService.getAll();

  // Group items by source id
  const itemsBySource = items.reduce(
    (acc, item) => {
      const sourceId = item.subscriptionSourceId;
      if (!acc[sourceId]) {
        acc[sourceId] = [];
      }
      acc[sourceId].push(item);
      return acc;
    },
    {} as Record<string, SubscriptionSourceItem[]>
  );

  return sources.map((source) => ({
    ...source,
    items: itemsBySource[source.id] || [],
  }));
}

export async function createSubscriptionSource(data: Omit<SubscriptionSource, "id" | "createdAt" | "updatedAt">) {
  const source = await subscriptionSourceService.create(data);
  revalidatePath("/subscriptions");
  return source;
}

export async function updateSubscriptionSource(id: string, data: Partial<Omit<SubscriptionSource, "id" | "createdAt" | "updatedAt">>) {
  const source = await subscriptionSourceService.update(id, data);
  revalidatePath("/subscriptions");
  return source;
}

export async function deleteSubscriptionSource(id: string) {
  await subscriptionSourceService.delete(id);
  revalidatePath("/subscriptions");
}

export async function createSubscriptionSourceItem(data: Omit<SubscriptionSourceItem, "id" | "createdAt" | "updatedAt">) {
  const item = await subscriptionSourceItemService.create(data);
  revalidatePath("/subscriptions");
  return item;
}

export async function updateSubscriptionSourceItem(id: string, data: Partial<Omit<SubscriptionSourceItem, "id" | "createdAt" | "updatedAt">>) {
  const item = await subscriptionSourceItemService.update(id, data);
  revalidatePath("/subscriptions");
  return item;
}

export async function deleteSubscriptionSourceItem(id: string) {
  await subscriptionSourceItemService.delete(id);
  revalidatePath("/subscriptions");
}
