"use server";

import { revalidatePath } from "next/cache";

import { nodeClientService } from "@/server/services/node-client-service";
import { nodeService } from "@/server/services/node-service";
import type { Node, NodeClient } from "@/types";

export async function getNodes() {
  const nodes = await nodeService.getAll();
  const clients = await nodeClientService.getNodeClientsWithUsers();

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
    {} as Record<string, (NodeClient & { users: { userId: string; enable: boolean; order: number }[] })[]>
  );

  return nodes.map((node) => ({
    ...node,
    items: clientsByNode[node.id] || [],
  }));
}

export async function createNode(data: Omit<Node, "id" | "createdAt" | "updatedAt">) {
  const node = await nodeService.create(data);
  revalidatePath("/nodes");
  return node;
}

export async function updateNode(id: string, data: Partial<Omit<Node, "id" | "createdAt" | "updatedAt">>) {
  const node = await nodeService.update(id, data);
  revalidatePath("/nodes");
  return node;
}

export async function deleteNode(id: string) {
  await nodeService.delete(id);
  revalidatePath("/nodes");
}

export async function createNodeClient(data: {
  nodeId: string;
  url: string;
  userOptions: {
    userId: string;
    enable: boolean;
  }[];
}): Promise<NodeClient> {
  const client = await nodeClientService.create({
    nodeId: data.nodeId,
    url: data.url,
  });
  // Set options for each user individually
  for (const opt of data.userOptions) {
    await nodeClientService.setUserClientOptions(client.id, [opt.userId], {
      enable: opt.enable
    });
  }
  revalidatePath("/nodes");
  return client;
}

export async function updateNodeClient(
  id: string,
  data: {
    nodeId: string;
    url: string;
    userOptions: {
      userId: string;
      enable: boolean;
    }[];
  }
): Promise<NodeClient> {
  const client = await nodeClientService.update(id, {
    nodeId: data.nodeId,
    url: data.url,
  });
  // Set options for each user individually
  for (const opt of data.userOptions) {
    await nodeClientService.setUserClientOptions(client.id, [opt.userId], {
      enable: opt.enable
    });
  }
  revalidatePath("/nodes");
  return client;
}

export async function deleteNodeClient(id: string) {
  await nodeClientService.delete(id);
  revalidatePath("/nodes");
}

export async function findNodeClientByNodeAndUser(nodeId: string, userId: string): Promise<(NodeClient & { users: { userId: string; enable: boolean; order: number }[] }) | null> {
  const clients = await nodeClientService.getNodeClientsWithUsers();
  return clients.find(client => 
    client.nodeId === nodeId && 
    client.users.some(u => u.userId === userId)
  ) || null;
}

export async function createOrUpdateNodeClient(
  nodeId: string,
  data: {
    url: string;
    userOptions: {
      userId: string;
      enable: boolean;
    }[];
  }
): Promise<NodeClient> {
  // First check if there's an existing client for this node and any of the users
  const userIds = data.userOptions.map(opt => opt.userId);
  const existingClients = await nodeClientService.getNodeClientsWithUsers();
  const existingClient = existingClients.find(client => 
    client.nodeId === nodeId && 
    client.users.some(u => userIds.includes(u.userId))
  );

  let client: NodeClient;
  if (existingClient) {
    // Update existing client
    client = await nodeClientService.update(existingClient.id, { 
      nodeId, 
      url: data.url 
    });
  } else {
    // Create new client
    client = await nodeClientService.create({ nodeId, url: data.url });
  }

  // Set options for each user individually
  for (const opt of data.userOptions) {
    await nodeClientService.setUserClientOptions(client.id, [opt.userId], {
      enable: opt.enable
    });
  }
  
  revalidatePath("/nodes");
  return client;
}
