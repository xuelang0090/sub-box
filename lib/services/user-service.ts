import "server-only"
import { type User } from "@/types"
import { JsonStorage } from "../storage/json-storage"

const storage = new JsonStorage<User>("users.json")

class UserService {
  async getAll(): Promise<User[]> {
    return storage.getAll()
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    return storage.create(data)
  }

  async update(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User> {
    return storage.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return storage.delete(id)
  }
}

export const userService = new UserService()

