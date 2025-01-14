import "server-only"
import { promises as fs } from 'fs'
import path from 'path'

import { Storage } from './interface'

interface WithId {
  id: string
}

export class JsonStorage<T extends WithId> implements Storage<T> {
  private filePath: string
  private data: Map<string, T> | null = null

  constructor(fileName: string) {
    const dataDir = process.env.DATA_DIR || './data'
    this.filePath = path.join(dataDir, fileName)
  }

  private async ensureDataLoaded() {
    if (this.data !== null) return

    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true })
      const content = await fs.readFile(this.filePath, 'utf-8')
      const items = JSON.parse(content)
      this.data = new Map(items.map((item: T) => [item.id, item]))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.data = new Map()
        await this.save()
      } else {
        throw error
      }
    }
  }

  private async save() {
    if (!this.data) return
    const items = Array.from(this.data.values())
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2))
  }

  async getAll(): Promise<T[]> {
    await this.ensureDataLoaded()
    return Array.from(this.data!.values())
  }

  async get(id: string): Promise<T | null> {
    await this.ensureDataLoaded()
    return this.data!.get(id) || null
  }

  async create(item: T): Promise<T> {
    await this.ensureDataLoaded()
    if (this.data!.has(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`)
    }
    this.data!.set(item.id, item)
    await this.save()
    return item
  }

  async update(id: string, item: T): Promise<T> {
    await this.ensureDataLoaded()
    if (!this.data!.has(id)) {
      throw new Error(`Item with id ${id} not found`)
    }
    this.data!.set(id, { ...item, id })
    await this.save()
    return item
  }

  async delete(id: string): Promise<void> {
    await this.ensureDataLoaded()
    if (!this.data!.has(id)) {
      throw new Error(`Item with id ${id} not found`)
    }
    this.data!.delete(id)
    await this.save()
  }
}

