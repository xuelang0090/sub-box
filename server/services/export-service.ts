import "server-only";

import { type Database } from "../db";
import { db } from "../db";
import { users, nodes, nodeClients, subconverters, clashConfigs } from "../db/schema";
import { userService } from "./user-service";
import { nodeService } from "./node-service";
import { nodeClientService } from "./node-client-service";
import { subconverterService } from "./subconverter-service";
import { clashConfigService } from "./clash-config-service";

export type ExportData = {
  users: Awaited<ReturnType<typeof userService.getAll>>;
  nodes: Awaited<ReturnType<typeof nodeService.getAll>>;
  nodeClients: Awaited<ReturnType<typeof nodeClientService.getAll>>;
  subconverters: Awaited<ReturnType<typeof subconverterService.getAll>>;
  clashConfigs: Awaited<ReturnType<typeof clashConfigService.getAll>>;
};

export type ImportOptions = {
  skipExisting: boolean;
};

class ExportService {
  private dbPromise: Promise<Database>;

  constructor() {
    this.dbPromise = db();
  }

  private async getDb() {
    return await this.dbPromise;
  }

  async exportAll(): Promise<ExportData> {
    const [usersData, nodesData, nodeClientsData, subconvertersData, clashConfigsData] = await Promise.all([
      userService.getAll(),
      nodeService.getAll(),
      nodeClientService.getAll(),
      subconverterService.getAll(),
      clashConfigService.getAll(),
    ]);

    return {
      users: usersData,
      nodes: nodesData,
      nodeClients: nodeClientsData,
      subconverters: subconvertersData,
      clashConfigs: clashConfigsData,
    };
  }

  async importAll(data: ExportData, options: ImportOptions): Promise<void> {
    const db = await this.getDb();

    // 开始导入
    await db.transaction(async (tx) => {
      // 导入 subconverters
      for (const subconverter of data.subconverters) {
        if (options.skipExisting) {
          const existing = await subconverterService.get(subconverter.id);
          if (existing) continue;
        }
        await tx.insert(subconverters).values(subconverter);
      }

      // 导入 clash configs
      for (const config of data.clashConfigs) {
        if (options.skipExisting) {
          const existing = await clashConfigService.get(config.id);
          if (existing) continue;
        }
        await tx.insert(clashConfigs).values(config);
      }

      // 导入 nodes
      for (const node of data.nodes) {
        if (options.skipExisting) {
          const existing = await nodeService.get(node.id);
          if (existing) continue;
        }
        await tx.insert(nodes).values(node);
      }

      // 导入 users
      for (const user of data.users) {
        if (options.skipExisting) {
          const existing = await userService.get(user.id);
          if (existing) continue;
        }
        await tx.insert(users).values(user);
      }

      // 导入 node clients
      for (const client of data.nodeClients) {
        if (options.skipExisting) {
          const existing = await nodeClientService.get(client.id);
          if (existing) continue;
        }
        await tx.insert(nodeClients).values(client);
      }
    });
  }
}

export const exportService = new ExportService(); 