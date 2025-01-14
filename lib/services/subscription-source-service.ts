import "server-only"
import { type SubscriptionSource } from "@/types"
import { JsonStorage } from "../storage/json-storage"

const storage = new JsonStorage<SubscriptionSource>("subscription-sources.json")

class SubscriptionSourceService {
  async getAll(): Promise<SubscriptionSource[]> {
    return storage.getAll()
  }

  async create(data: Omit<SubscriptionSource, "id" | "createdAt" | "updatedAt">): Promise<SubscriptionSource> {
    return storage.create(data)
  }

  async update(id: string, data: Partial<Omit<SubscriptionSource, "id" | "createdAt" | "updatedAt">>): Promise<SubscriptionSource> {
    return storage.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return storage.delete(id)
  }
}

export const subscriptionSourceService = new SubscriptionSourceService()

