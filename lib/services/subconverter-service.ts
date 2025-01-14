import "server-only"
import { Subconverter } from '@/types'
import { JsonStorage } from '../storage/json-storage'

export class SubconverterService {
  private storage: JsonStorage<Subconverter>

  constructor() {
    this.storage = new JsonStorage<Subconverter>('subconverters.json')
  }

  async getAll(): Promise<Subconverter[]> {
    return this.storage.getAll()
  }

  async get(id: string): Promise<Subconverter | null> {
    return this.storage.get(id)
  }

  async create(subconverter: Omit<Subconverter, 'id'>): Promise<Subconverter> {
    const id = crypto.randomUUID()
    return this.storage.create({ ...subconverter, id })
  }

  async update(id: string, subconverter: Omit<Subconverter, 'id'>): Promise<Subconverter> {
    return this.storage.update(id, { ...subconverter, id })
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id)
  }
}

export const subconverterService = new SubconverterService()

