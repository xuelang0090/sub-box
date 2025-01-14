import "server-only"
import { eq } from "drizzle-orm"
import { type User } from "@/types"
import { users } from "../db/schema"
import db from "../db"
import crypto from "crypto"

class UserService {
  async getAll(): Promise<User[]> {
    return db.select().from(users)
  }

  async get(id: string): Promise<User | null> {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return results[0] || null
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const now = new Date().toISOString()
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }

    const results = await db.insert(users).values(item).returning()
    return results[0]
  }

  async update(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User> {
    const now = new Date().toISOString()
    const updateData = {
      ...data,
      updatedAt: now,
    }

    const results = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    if (!results[0]) {
      throw new Error(`User with id ${id} not found`)
    }

    return results[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id))
  }
}

export const userService = new UserService()

