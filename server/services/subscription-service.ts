import "server-only";

import { eq } from "drizzle-orm";

import db from "../db";
import { subscriptionSourceItems, users } from "../db/schema";
import { subconverterService } from "./subconverter-service";
import { subscriptionSourceItemService } from "./subscription-source-item-service";
import { userService } from "./user-service";

class SubscriptionService {
  async generateSubscription(subscriptionKey: string): Promise<string> {
    // Find user by subscription key
    const userResults = await db.select().from(users).where(eq(users.subscriptionKey, subscriptionKey)).limit(1);

    const user = userResults[0];
    if (!user) {
      throw new Error("User not found");
    }

    // Get all enabled subscription source items for the user
    const sourceItems = await db.select().from(subscriptionSourceItems).where(eq(subscriptionSourceItems.userId, user.id));

    const enabledItems = sourceItems.filter((item) => item.enable);
    if (enabledItems.length === 0) {
      throw new Error("No enabled subscription sources found");
    }

    // Get subconverter - either user's or default one
    let subconverter = null;
    if (user.subconverterId) {
      subconverter = await subconverterService.get(user.subconverterId);
    }

    if (!subconverter) {
      const allSubconverters = await subconverterService.getAll();
      subconverter = allSubconverters.find((s) => s.isDefault);
    }

    if (!subconverter) {
      throw new Error("No subconverter found");
    }

    // Construct URLs
    const urls = enabledItems.map((item) => encodeURIComponent(item.url)).join("|");
    const baseUrl = `${subconverter.url}/sub?target=clash&url=${urls}`;

    // Add options if any
    const finalUrl = subconverter.options ? `${baseUrl}&${subconverter.options}` : baseUrl;

    // Fetch the subscription
    try {
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }
      return await response.text();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate subscription: ${error.message}`);
      }
      throw new Error("Failed to generate subscription: Unknown error");
    }
  }
}

export const subscriptionService = new SubscriptionService();
