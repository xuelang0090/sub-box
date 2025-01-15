import "server-only";

import crypto from "crypto";
import { eq } from "drizzle-orm";

import { type User } from "@/types";
import { db, type Database } from "../db";
import { users } from "../db/schema";

class UserService {
  private db!: Database;

  constructor() {
    this.init();
  }

  private async init() {
    this.db = await db();
  }

  async getAll(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async get(id: string): Promise<User | null> {
    const results = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0] || null;
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const now = new Date().toISOString();
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const results = await this.db.insert(users).values(item).returning();
    if (!results[0]) {
      throw new Error("Failed to create user");
    }
    return results[0];
  }

  async update(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User> {
    const now = new Date().toISOString();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    const results = await this.db.update(users).set(updateData).where(eq(users.id, id)).returning();

    if (!results[0]) {
      throw new Error(`User with id ${id} not found`);
    }

    return results[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async findBySubscriptionKey(subscriptionKey: string): Promise<User | null> {
    const results = await this.db.select().from(users).where(eq(users.subscriptionKey, subscriptionKey)).limit(1);
    return results[0] || null;
  }
}

export const userService = new UserService();
