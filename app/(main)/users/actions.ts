"use server";

import { revalidatePath } from "next/cache";

import { userService } from "@/server/services/user-service";
import { subconverterService } from "@/server/services/subconverter-service";
import type { User } from "@/types";
import { nodeService } from "@/server/services/node-service";
import { nodeClientService } from "@/server/services/node-client-service";

export async function getUsers() {
  return userService.getAll();
}

export async function getNodes() {
  return nodeService.getAll();
}

export async function getClients() {
  return nodeClientService.getAll();
}

export async function getSubconverters() {
  return subconverterService.getAll();
}

export async function createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">) {
  const user = await userService.create(data);
  revalidatePath("/users");
  return user;
}

export async function updateUser(id: string, data: Omit<User, "id" | "createdAt" | "updatedAt">) {
  const user = await userService.update(id, data);
  revalidatePath("/users");
  return user;
}

export async function deleteUser(id: string) {
  await userService.delete(id);
  revalidatePath("/users");
}
