import "server-only";

import crypto from "crypto";
import { eq } from "drizzle-orm";

import { type Subconverter, type SubconverterRow } from "@/types";
import { db, type Database } from "../db";
import { subconverters } from "../db/schema";

function rowToSubconverter(row: SubconverterRow): Subconverter {
  return {
    ...row,
  };
}

class SubconverterService {
  private db!: Database;

  constructor() {
    this.init();
  }

  private async init() {
    this.db = await db();
  }

  async getAll(): Promise<Subconverter[]> {
    const results = await this.db.select().from(subconverters);
    return results.map(rowToSubconverter);
  }

  async get(id: string): Promise<Subconverter | null> {
    const results = await this.db.select().from(subconverters).where(eq(subconverters.id, id)).limit(1);

    return results[0] ? rowToSubconverter(results[0]) : null;
  }

  async create(data: Omit<Subconverter, "id" | "createdAt" | "updatedAt">): Promise<Subconverter> {
    const now = new Date().toISOString();
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const results = await this.db.insert(subconverters).values(item).returning();
    if (!results[0]) {
      throw new Error("Failed to create subconverter");
    }
    return rowToSubconverter(results[0]);
  }

  async update(id: string, data: Partial<Omit<Subconverter, "id" | "createdAt" | "updatedAt">>): Promise<Subconverter> {
    const now = new Date().toISOString();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    const results = await this.db.update(subconverters).set(updateData).where(eq(subconverters.id, id)).returning();

    if (!results[0]) {
      throw new Error(`Subconverter with id ${id} not found`);
    }

    return rowToSubconverter(results[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(subconverters).where(eq(subconverters.id, id));
  }
}

export const subconverterService = new SubconverterService();
