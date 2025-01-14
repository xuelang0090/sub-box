import "server-only"
import { SubscriptionSourceItem } from '@/types'
import { JsonStorage } from '../storage/json-storage'
import crypto from 'crypto'

export class SubscriptionSourceItemService {
  private storage: JsonStorage<SubscriptionSourceItem>

  constructor() {
    this.storage = new JsonStorage<SubscriptionSourceItem>('subscription-source-items.json')
  }

  async getAll(): Promise<SubscriptionSourceItem[]> {
    return this.storage.getAll()
  }

  async get(id: string): Promise<SubscriptionSourceItem | null> {
    return this.storage.get(id)
  }

  async create(item: Omit<SubscriptionSourceItem, 'id'>): Promise<SubscriptionSourceItem> {
    const id = crypto.randomUUID()
    return this.storage.create({ ...item, id })
  }

  async update(id: string, item: Omit<SubscriptionSourceItem, 'id'>): Promise<SubscriptionSourceItem> {
    return this.storage.update(id, { ...item, id })
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id)
  }
}

export const subscriptionSourceItemService = new SubscriptionSourceItemService()

