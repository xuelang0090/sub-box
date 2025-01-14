import "server-only"
import { SubscriptionSource } from '@/types'
import { JsonStorage } from '../storage/json-storage'

export class SubscriptionSourceService {
  private storage: JsonStorage<SubscriptionSource>

  constructor() {
    this.storage = new JsonStorage<SubscriptionSource>('subscription-sources.json')
  }

  async getAll(): Promise<SubscriptionSource[]> {
    return this.storage.getAll()
  }

  async get(id: string): Promise<SubscriptionSource | null> {
    return this.storage.get(id)
  }

  async create(source: Omit<SubscriptionSource, 'id'>): Promise<SubscriptionSource> {
    const id = crypto.randomUUID()
    return this.storage.create({ ...source, id })
  }

  async update(id: string, source: Omit<SubscriptionSource, 'id'>): Promise<SubscriptionSource> {
    return this.storage.update(id, { ...source, id })
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id)
  }
}

export const subscriptionSourceService = new SubscriptionSourceService()

