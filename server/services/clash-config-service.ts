import "server-only";
import { eq } from "drizzle-orm";
import { type ClashConfig } from "@/types";
import { clashConfigs } from "../db/schema";
import db from "../db";
import crypto from "crypto";

class ClashConfigService {
  async getAll(): Promise<ClashConfig[]> {
    return db.select().from(clashConfigs);
  }

  async get(id: string): Promise<ClashConfig | null> {
    const results = await db
      .select()
      .from(clashConfigs)
      .where(eq(clashConfigs.id, id))
      .limit(1);
    return results[0] || null;
  }

  async create(data: Omit<ClashConfig, "id" | "createdAt" | "updatedAt">): Promise<ClashConfig> {
    const now = new Date().toISOString();
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const results = await db.insert(clashConfigs).values(item).returning();
    return results[0];
  }

  async update(id: string, data: Partial<Omit<ClashConfig, "id" | "createdAt" | "updatedAt">>): Promise<ClashConfig> {
    const now = new Date().toISOString();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    const results = await db
      .update(clashConfigs)
      .set(updateData)
      .where(eq(clashConfigs.id, id))
      .returning();

    if (!results[0]) {
      throw new Error(`Config with id ${id} not found`);
    }

    return results[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(clashConfigs).where(eq(clashConfigs.id, id));
  }
}

export const clashConfigService = new ClashConfigService();

