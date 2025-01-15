"use server";

import { revalidatePath } from "next/cache";

import { clashConfigService } from "@/server/services/clash-config-service";
import { subconverterService } from "@/server/services/subconverter-service";
import { userService } from "@/server/services/user-service";
import type { User } from "@/types";

export async function getUsers() {
  return userService.getAll();
}

export async function getSubconverters() {
  return subconverterService.getAll();
}

export async function getClashConfigs() {
  return clashConfigService.getAll();
}

export async function createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">) {
  const user = await userService.create(data);
  revalidatePath("/users");
  return user;
}

export async function updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>) {
  const user = await userService.update(id, data);
  revalidatePath("/users");
  return user;
}

export async function deleteUser(id: string) {
  await userService.delete(id);
  revalidatePath("/users");
}
