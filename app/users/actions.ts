"use server"

import { revalidatePath } from "next/cache"
import { userService } from "@/server/services/user-service"
import type { User } from "@/types"

export async function getUsers() {
  return userService.getAll()
}

export async function createUser(data: Omit<User, "id">) {
  const user = await userService.create(data)
  revalidatePath("/users")
  return user
}

export async function updateUser(id: string, data: Omit<User, "id">) {
  const user = await userService.update(id, data)
  revalidatePath("/users")
  return user
}

export async function deleteUser(id: string) {
  await userService.delete(id)
  revalidatePath("/users")
}

