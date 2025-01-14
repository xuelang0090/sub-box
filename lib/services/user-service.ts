import "server-only"
import { User } from '@/types'
import { JsonStorage } from '../storage/json-storage'

export class UserService {
  private storage: JsonStorage<User>

  constructor() {
    this.storage = new JsonStorage<User>('users.json')
  }

  async getAll(): Promise<User[]> {
    return this.storage.getAll()
  }

  async get(id: string): Promise<User | null> {
    return this.storage.get(id)
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const id = crypto.randomUUID()
    return this.storage.create({ ...user, id })
  }

  async update(id: string, user: Omit<User, 'id'>): Promise<User> {
    return this.storage.update(id, { ...user, id })
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id)
  }
}

export const userService = new UserService()

