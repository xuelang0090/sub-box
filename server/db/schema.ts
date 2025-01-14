import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// User table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subconverterId: text('subconverter_id'),
  mergeConfigId: text('merge_config_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  subconverter: one(subconverters, {
    fields: [users.subconverterId],
    references: [subconverters.id],
  }),
  mergeConfig: one(clashConfigs, {
    fields: [users.mergeConfigId],
    references: [clashConfigs.id],
  }),
}));

// Subconverter table
export const subconverters = sqliteTable('subconverters', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  options: text('options').notNull(), // URL query string format
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Clash Config table
export const clashConfigs = sqliteTable('clash_configs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  globalConfig: text('global_config').notNull(), // YAML string
  rules: text('rules').notNull(), // YAML string
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Subscription Source table
export const subscriptionSources = sqliteTable('subscription_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  inboundProtocol: text('inbound_protocol').notNull(),
  ip: text('ip'),
  url: text('url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Subscription Source Item table
export const subscriptionSourceItems = sqliteTable('subscription_source_items', {
  id: text('id').primaryKey(),
  subscriptionSourceId: text('subscription_source_id').notNull(),
  userId: text('user_id').notNull(),
  enable: integer('enable', { mode: 'boolean' }).notNull(),
  url: text('url').notNull(),
  upToDate: integer('up_to_date', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Subscription Source Item relations
export const subscriptionSourceItemsRelations = relations(subscriptionSourceItems, ({ one }) => ({
  subscriptionSource: one(subscriptionSources, {
    fields: [subscriptionSourceItems.subscriptionSourceId],
    references: [subscriptionSources.id],
  }),
  user: one(users, {
    fields: [subscriptionSourceItems.userId],
    references: [users.id],
  }),
})); 