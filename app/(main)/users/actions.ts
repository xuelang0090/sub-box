"use server";

import { revalidatePath } from "next/cache";

import { nodeClientService } from "@/server/services/node-client-service";
import { nodeService } from "@/server/services/node-service";
import { userService } from "@/server/services/user-service";
import { type User, type Subconverter } from "@/types";
import { subconverterService } from "@/server/services/subconverter-service";

export async function getUsers() {
  return userService.getAll();
}

export async function getUserClients() {
  return nodeClientService.getNodeClientsWithUsers();
}

export async function getNodes() {
  return nodeService.getAll();
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

export async function updateUserClientOption(
  nodeClientId: string,
  userId: string,
  data: {
    enable?: boolean;
    order?: number;
  }
): Promise<void> {
  await nodeClientService.updateUserClientOption(nodeClientId, userId, data);
  revalidatePath("/nodes");
  revalidatePath("/users");
}

export async function getSubconverters() {
  return subconverterService.getAll();
}
