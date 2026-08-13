export interface DbRider {
  id: string
  name: string
  initials: string
  color: string
  sort_order: number
  bike: string | null
  chain_speed: string | null
  hanger_model: string | null
  tire_size: string | null
  brake_pad_type: string | null
  updated_at: string
}

export interface GroupItem {
  id: string
  name: string
  category: string
  /** The only existence control: 0 means Not Required. */
  qty: number
  /** What the Bikers' Bible recommended. Written once, never updated. */
  bible_qty: number | null
  weight_oz: number
  bulk: number
  source: 'bible' | 'trip-report' | 'custom'
  minimalist: boolean
  notes: string | null
  last_changed_by: string | null
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  group_item_id: string
  rider_id: string
  qty: number
  packed: boolean
  updated_at: string
}

export interface PersonalItem {
  id: string
  rider_id: string
  name: string
  category: string
  packed: boolean
  official: boolean
  sort_order: number
  notes: string | null
  updated_at: string
}

export interface Snapshot {
  riders: DbRider[]
  groupItems: GroupItem[]
  claims: Claim[]
  personalItems: PersonalItem[]
}

export const EMPTY: Snapshot = {
  riders: [],
  groupItems: [],
  claims: [],
  personalItems: [],
}

export type SyncStatus =
  | 'loading'
  | 'ready'
  | 'offline'
  | 'no-backend'
  | 'error'

/** A queued mutation, replayed in order once we are back on the network. */
export interface OutboxEntry {
  id: string
  table: 'riders' | 'group_items' | 'claims' | 'personal_items'
  op: 'upsert' | 'delete'
  payload: Record<string, unknown>
  ts: number
  /** Failed sync attempts; the entry is dropped once this hits the cap. */
  attempts?: number
}

export const TILE_STATES = [
  'not-required',
  'needed',
  'partial',
  'claimed',
  'packed',
] as const
export type TileState = (typeof TILE_STATES)[number]

/**
 * Tile state is always derived, never stored -- a second source of truth
 * would only drift out of sync with the numbers.
 */
export function tileState(item: GroupItem, claims: Claim[]): TileState {
  const claimed = claims.reduce((n, c) => n + c.qty, 0)
  if (item.qty === 0) return 'not-required'
  if (claimed === 0) return 'needed'
  if (claimed < item.qty) return 'partial'
  return claims.length > 0 && claims.every((c) => c.packed) ? 'packed' : 'claimed'
}
