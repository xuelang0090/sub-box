import "server-only"
import { type Subconverter } from "@/types"
import { JsonStorage } from "../storage/json-storage"

const storage = new JsonStorage<Subconverter>("subconverters.json")

class SubconverterService {
  async getAll(): Promise<Subconverter[]> {
    return storage.getAll()
  }

  async create(data: Omit<Subconverter, "id" | "createdAt" | "updatedAt">): Promise<Subconverter> {
    return storage.create(data)
  }

  async update(id: string, data: Partial<Omit<Subconverter, "id" | "createdAt" | "updatedAt">>): Promise<Subconverter> {
    return storage.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return storage.delete(id)
  }
}

export const subconverterService = new SubconverterService()

