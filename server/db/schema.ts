import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Notice for cursor AI:
// after change the schema, you need to run the following commands:
// run `bun db:generate` to generate migration file
// run `bun d1:migrate:local` to migrate the schema

// User table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subscriptionKey: text("subscription_key").notNull().unique(),
  subconverterId: text("subconverter_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  subconverter: one(subconverters, {
    fields: [users.subconverterId],
    references: [subconverters.id],
  }),
}));

// Subconverter table
export const subconverters = sqliteTable("subconverters", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  options: text("options").notNull(), // URL query string format
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Clash Config table
export const clashConfigs = sqliteTable("clash_configs", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  globalConfig: text("global_config"), // YAML string
  rules: text("rules"), // 每行一个
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Node table
export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("custom"), // 3x-ui, external-subscription, custom
  host: text("host"),
  accessUrl: text("access_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Node Client table
export const nodeClients = sqliteTable("node_clients", {
  id: text("id").primaryKey(),
  nodeId: text("node_id").notNull(),
  userId: text("user_id").notNull(),
  clientId: text("client_id"),
  enable: integer("enable", { mode: "boolean" }).notNull(),
  url: text("url").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Node Client relations
export const nodeClientsRelations = relations(nodeClients, ({ one }) => ({
  node: one(nodes, {
    fields: [nodeClients.nodeId],
    references: [nodes.id],
  }),
  user: one(users, {
    fields: [nodeClients.userId],
    references: [users.id],
  }),
}));
