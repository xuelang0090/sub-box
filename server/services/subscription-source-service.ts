import "server-only"
import { eq } from "drizzle-orm"
import { type SubscriptionSource } from "@/types"
import { subscriptionSources } from "../db/schema"
import db from "../db"
import crypto from "crypto"

class SubscriptionSourceService {
  async getAll(): Promise<SubscriptionSource[]> {
    return db.select().from(subscriptionSources)
  }

  async get(id: string): Promise<SubscriptionSource | null> {
    const results = await db
      .select()
      .from(subscriptionSources)
      .where(eq(subscriptionSources.id, id))
      .limit(1)
    return results[0] || null
  }

  async create(data: Omit<SubscriptionSource, "id" | "createdAt" | "updatedAt">): Promise<SubscriptionSource> {
    const now = new Date().toISOString()
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }

    const results = await db.insert(subscriptionSources).values(item).returning()
    if (!results[0]) {
      throw new Error("Failed to create subscription source")
    }
    return results[0]
  }

  async update(id: string, data: Partial<Omit<SubscriptionSource, "id" | "createdAt" | "updatedAt">>): Promise<SubscriptionSource> {
    const now = new Date().toISOString()
    const updateData = {
      ...data,
      updatedAt: now,
    }

    const results = await db
      .update(subscriptionSources)
      .set(updateData)
      .where(eq(subscriptionSources.id, id))
      .returning()

    if (!results[0]) {
      throw new Error(`Subscription source with id ${id} not found`)
    }

    return results[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(subscriptionSources).where(eq(subscriptionSources.id, id))
  }
}

export const subscriptionSourceService = new SubscriptionSourceService()

