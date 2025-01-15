import { InferSelectModel } from "drizzle-orm";

import { clashConfigs, subconverters, subscriptionSourceItems, subscriptionSources, users } from "@/server/db/schema";

// User Model
export type User = InferSelectModel<typeof users>;

// Subconverter Model
export type SubconverterRow = InferSelectModel<typeof subconverters>;
export interface Subconverter extends Omit<SubconverterRow, "options"> {
  options: string;
}

// Clash Config Model
export type ClashConfig = InferSelectModel<typeof clashConfigs>;

// Subscription Source Model
export type SubscriptionSource = InferSelectModel<typeof subscriptionSources>;

// Subscription Source Item Model
export type SubscriptionSourceItem = InferSelectModel<typeof subscriptionSourceItems>;
