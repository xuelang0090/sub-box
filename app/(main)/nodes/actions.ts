"use server";

import { revalidatePath } from "next/cache";

import { nodeClientService } from "@/server/services/node-client-service";
import { nodeService } from "@/server/services/node-service";
import type { Node, NodeClient } from "@/types";

export async function getNodes() {
  const nodes = await nodeService.getAll();
  const clients = await nodeClientService.getAll();

  // Group clients by node id
  const clientsByNode = clients.reduce(
    (acc, client) => {
      const nodeId = client.nodeId;
      if (!acc[nodeId]) {
        acc[nodeId] = [];
      }
      acc[nodeId].push(client);
      return acc;
    },
    {} as Record<string, NodeClient[]>
  );

  return nodes.map((node) => ({
    ...node,
    items: clientsByNode[node.id] || [],
  }));
}

export async function createNode(data: Omit<Node, "id" | "createdAt" | "updatedAt">) {
  const node = await nodeService.create(data);
  revalidatePath("/subscriptions");
  return node;
}

export async function updateNode(id: string, data: Partial<Omit<Node, "id" | "createdAt" | "updatedAt">>) {
  const node = await nodeService.update(id, data);
  revalidatePath("/subscriptions");
  return node;
}

export async function deleteNode(id: string) {
  await nodeService.delete(id);
  revalidatePath("/subscriptions");
}

export async function createNodeClient(data: Omit<NodeClient, "id" | "createdAt" | "updatedAt">) {
  const client = await nodeClientService.create(data);
  revalidatePath("/subscriptions");
  return client;
}

export async function updateNodeClient(
  nodeId: string,
  data: Omit<NodeClient, "id" | "createdAt" | "updatedAt">
): Promise<NodeClient> {
  const client = await nodeClientService.createOrUpdate(nodeId, data.userId, {
    url: data.url,
    enable: data.enable,
    clientId: data.clientId,
  });
  revalidatePath("/subscriptions");
  return client;
}

export async function deleteNodeClient(id: string) {
  await nodeClientService.delete(id);
  revalidatePath("/subscriptions");
}

export async function findNodeClientByNodeAndUser(nodeId: string, userId: string): Promise<NodeClient | null> {
  return nodeClientService.findByNodeAndUser(nodeId, userId);
}

export async function createOrUpdateNodeClient(
  nodeId: string,
  userId: string,
  data: Omit<NodeClient, "id" | "nodeId" | "userId" | "createdAt" | "updatedAt">
): Promise<NodeClient> {
  const client = await nodeClientService.createOrUpdate(nodeId, userId, data);
  revalidatePath("/subscriptions");
  return client;
}
