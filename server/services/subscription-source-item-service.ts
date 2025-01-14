import "server-only"
import { eq } from "drizzle-orm"
import { type SubscriptionSourceItem } from "@/types"
import { subscriptionSourceItems } from "../db/schema"
import db from "../db"
import crypto from "crypto"

class SubscriptionSourceItemService {
  async getAll(): Promise<SubscriptionSourceItem[]> {
    return db.select().from(subscriptionSourceItems)
  }

  async get(id: string): Promise<SubscriptionSourceItem | null> {
    const results = await db
      .select()
      .from(subscriptionSourceItems)
      .where(eq(subscriptionSourceItems.id, id))
      .limit(1)
    return results[0] || null
  }

  async create(data: Omit<SubscriptionSourceItem, "id" | "createdAt" | "updatedAt">): Promise<SubscriptionSourceItem> {
    const now = new Date().toISOString()
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }

    const results = await db.insert(subscriptionSourceItems).values(item).returning()
    return results[0]
  }

  async update(id: string, data: Partial<Omit<SubscriptionSourceItem, "id" | "createdAt" | "updatedAt">>): Promise<SubscriptionSourceItem> {
    const now = new Date().toISOString()
    const updateData = {
      ...data,
      updatedAt: now,
    }

    const results = await db
      .update(subscriptionSourceItems)
      .set(updateData)
      .where(eq(subscriptionSourceItems.id, id))
      .returning()

    if (!results[0]) {
      throw new Error(`Subscription source item with id ${id} not found`)
    }

    return results[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(subscriptionSourceItems).where(eq(subscriptionSourceItems.id, id))
  }
}

export const subscriptionSourceItemService = new SubscriptionSourceItemService()

