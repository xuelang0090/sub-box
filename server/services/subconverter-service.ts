import "server-only"
import { eq } from "drizzle-orm"
import { type Subconverter, type SubconverterRow } from "@/types"
import { subconverters } from "../db/schema"
import db from "../db"
import crypto from "crypto"

function parseOptionsString(optionsString: string): Record<string, string> {
  if (!optionsString) return {};
  const params = new URLSearchParams(optionsString);
  const options: Record<string, string> = {};
  params.forEach((value, key) => {
    options[key] = value;
  });
  return options;
}

function stringifyOptions(options: Record<string, string>): string {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    params.append(key, value);
  });
  return params.toString();
}

function rowToSubconverter(row: SubconverterRow): Subconverter {
  return {
    ...row,
    options: parseOptionsString(row.options),
  };
}

class SubconverterService {
  async getAll(): Promise<Subconverter[]> {
    const results = await db.select().from(subconverters);
    return results.map(rowToSubconverter);
  }

  async get(id: string): Promise<Subconverter | null> {
    const results = await db
      .select()
      .from(subconverters)
      .where(eq(subconverters.id, id))
      .limit(1);
    
    return results[0] ? rowToSubconverter(results[0]) : null;
  }

  async create(data: Omit<Subconverter, "id" | "createdAt" | "updatedAt">): Promise<Subconverter> {
    const now = new Date().toISOString();
    const item = {
      ...data,
      options: stringifyOptions(data.options),
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const results = await db.insert(subconverters).values(item).returning();
    return rowToSubconverter(results[0]);
  }

  async update(id: string, data: Partial<Omit<Subconverter, "id" | "createdAt" | "updatedAt">>): Promise<Subconverter> {
    const now = new Date().toISOString();
    const updateData = {
      ...data,
      options: data.options ? stringifyOptions(data.options) : undefined,
      updatedAt: now,
    };

    const results = await db
      .update(subconverters)
      .set(updateData)
      .where(eq(subconverters.id, id))
      .returning();

    if (!results[0]) {
      throw new Error(`Subconverter with id ${id} not found`);
    }

    return rowToSubconverter(results[0]);
  }

  async delete(id: string): Promise<void> {
    await db.delete(subconverters).where(eq(subconverters.id, id));
  }
}

export const subconverterService = new SubconverterService();

