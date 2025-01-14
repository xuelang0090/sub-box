import "server-only"
import { promises as fs } from "fs"
import { join } from "path"
import crypto from "crypto"

const DATA_DIR = join(process.cwd(), "data")

interface WithId {
  id: string
  createdAt: string
  updatedAt: string
}

export class JsonStorage<T extends WithId> {
  private filePath: string

  constructor(filename: string) {
    this.filePath = join(DATA_DIR, filename)
  }

  private async ensureDataDir() {
    try {
      await fs.access(DATA_DIR)
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true })
    }
  }

  private async readFile(): Promise<T[]> {
    try {
      await this.ensureDataDir()
      const data = await fs.readFile(this.filePath, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return []
      }
      throw error
    }
  }

  private async writeFile(data: T[]) {
    await this.ensureDataDir()
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2))
  }

  async getAll(): Promise<T[]> {
    return this.readFile()
  }

  async get(id: string): Promise<T | null> {
    const items = await this.readFile()
    return items.find(item => item.id === id) ?? null
  }

  async create(data: Omit<T, keyof WithId>): Promise<T> {
    const items = await this.readFile()
    const now = new Date().toISOString()
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T
    items.push(item)
    await this.writeFile(items)
    return item
  }

  async update(id: string, data: Partial<Omit<T, keyof WithId>>): Promise<T> {
    const items = await this.readFile()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`)
    }
    const item = items[index]
    const updatedItem = {
      ...item,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    items[index] = updatedItem
    await this.writeFile(items)
    return updatedItem
  }

  async delete(id: string): Promise<void> {
    const items = await this.readFile()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`)
    }
    items.splice(index, 1)
    await this.writeFile(items)
  }
}

