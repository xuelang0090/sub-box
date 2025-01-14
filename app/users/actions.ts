"use server"

import { revalidatePath } from "next/cache"
import { userService } from "@/server/services/user-service"
import { subconverterService } from "@/server/services/subconverter-service"
import { clashConfigService } from "@/server/services/clash-config-service"
import type { User } from "@/types"
import db from "@/server/db"
import { users } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getUsers() {
  return userService.getAll()
}

export async function getSubconverters() {
  return subconverterService.getAll()
}

export async function getClashConfigs() {
  return clashConfigService.getAll()
}

export async function createUser(data: Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString()
  return await db.insert(users).values({
    id: nanoid(),
    ...data,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateUser(id: string, data: Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString()
  return await db.update(users)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(users.id, id))
}

export async function deleteUser(id: string) {
  await userService.delete(id)
  revalidatePath("/users")
}

