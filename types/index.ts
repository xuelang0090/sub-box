// User Model
export interface User {
  id: string
  name: string
  subconverterId?: string
  mergeConfigId?: string
  createdAt: string
  updatedAt: string
}

// Subconverter Model
export interface Subconverter {
  id: string
  url: string
  options: Record<string, string>
  createdAt: string
  updatedAt: string
}

// Clash Config Model
export interface ClashConfig {
  id: string
  name: string
  globalConfig: string // YAML format
  rules: string // YAML format
  createdAt: string
  updatedAt: string
}

// Subscription Source Model
export interface SubscriptionSource {
  id: string
  name: string
  inboundProtocol: string
  ip?: string
  url?: string
  lastUpdate: string
  createdAt: string
  updatedAt: string
}

// Subscription Source Item Model
export interface SubscriptionSourceItem {
  subscriptionSourceId: string
  userId: string
  enable: boolean
  url: string
  upToDate: boolean
  createdAt: string
  updatedAt: string
}

