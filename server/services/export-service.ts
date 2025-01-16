import "server-only";

import { type Database } from "../db";
import { db } from "../db";
import { users, nodes, nodeClients, subconverters, clashConfigs } from "../db/schema";
import { type BatchItem } from "drizzle-orm/batch";
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
    const batchStatements: BatchItem<"sqlite">[] = [];

    // 收集所有导入语句
    for (const subconverter of data.subconverters) {
      if (options.skipExisting) {
        const existing = await subconverterService.get(subconverter.id);
        if (existing) continue;
      }
      batchStatements.push(db.insert(subconverters).values(subconverter));
    }

    for (const config of data.clashConfigs) {
      if (options.skipExisting) {
        const existing = await clashConfigService.get(config.id);
        if (existing) continue;
      }
      batchStatements.push(db.insert(clashConfigs).values(config));
    }

    for (const node of data.nodes) {
      if (options.skipExisting) {
        const existing = await nodeService.get(node.id);
        if (existing) continue;
      }
      batchStatements.push(db.insert(nodes).values(node));
    }

    for (const user of data.users) {
      if (options.skipExisting) {
        const existing = await userService.get(user.id);
        if (existing) continue;
      }
      batchStatements.push(db.insert(users).values(user));
    }

    for (const client of data.nodeClients) {
      if (options.skipExisting) {
        const existing = await nodeClientService.get(client.id);
        if (existing) continue;
      }
      batchStatements.push(db.insert(nodeClients).values(client));
    }

    // 执行批处理
    if (batchStatements.length > 0) {
      await db.batch(batchStatements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);
    }
  }
}

export const exportService = new ExportService(); 