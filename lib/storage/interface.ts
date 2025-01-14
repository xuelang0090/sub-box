export interface Storage<T> {
  getAll(): Promise<T[]>
  get(id: string): Promise<T | null>
  create(item: T): Promise<T>
  update(id: string, item: T): Promise<T>
  delete(id: string): Promise<void>
}

