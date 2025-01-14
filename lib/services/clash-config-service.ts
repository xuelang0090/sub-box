import "server-only"
import { ClashConfig } from '@/types'
import { JsonStorage } from '../storage/json-storage'

export class ClashConfigService {
  private storage: JsonStorage<ClashConfig>

  constructor() {
    this.storage = new JsonStorage<ClashConfig>('clash-configs.json')
  }

  async getAll(): Promise<ClashConfig[]> {
    return this.storage.getAll()
  }

  async get(id: string): Promise<ClashConfig | null> {
    return this.storage.get(id)
  }

  async create(config: Omit<ClashConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClashConfig> {
    return this.storage.create(config)
  }

  async update(id: string, config: Partial<Omit<ClashConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ClashConfig> {
    return this.storage.update(id, config)
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id)
  }
}

export const clashConfigService = new ClashConfigService()

