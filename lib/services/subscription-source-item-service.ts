import "server-only"
import { type SubscriptionSourceItem } from "@/types"
import { JsonStorage } from "../storage/json-storage"

const storage = new JsonStorage<SubscriptionSourceItem>("subscription-source-items.json")

class SubscriptionSourceItemService {
  async getAll(): Promise<SubscriptionSourceItem[]> {
    return storage.getAll()
  }

  async create(data: Omit<SubscriptionSourceItem, "id" | "createdAt" | "updatedAt">): Promise<SubscriptionSourceItem> {
    return storage.create(data)
  }

  async update(id: string, data: Partial<Omit<SubscriptionSourceItem, "id" | "createdAt" | "updatedAt">>): Promise<SubscriptionSourceItem> {
    return storage.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return storage.delete(id)
  }
}

export const subscriptionSourceItemService = new SubscriptionSourceItemService()

