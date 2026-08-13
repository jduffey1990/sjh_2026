import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { store } from './store'
import { useRider } from './useRider'
import { tileState, type Claim, type DbRider, type GroupItem } from './types'

export function useSnapshot() {
  useEffect(() => {
    void store.start()
  }, [])
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

export function useSyncState() {
  const status = useSyncExternalStore(store.subscribe, store.getStatus)
  const pending = useSyncExternalStore(store.subscribe, store.getPending)
  return { status, pending }
}

/** The signed-in rider, resolved against the database rows. */
export function useDbRider(): DbRider | null {
  const snap = useSnapshot()
  const { rider } = useRider()
  return useMemo(
    () => snap.riders.find((r) => r.name === rider?.name) ?? null,
    [snap.riders, rider],
  )
}

export interface TileView {
  item: GroupItem
  claims: Claim[]
  claimed: number
  state: ReturnType<typeof tileState>
  mine: Claim | null
}

export function useBoard() {
  const snap = useSnapshot()
  const me = useDbRider()

  return useMemo(() => {
    const byItem = new Map<string, Claim[]>()
    for (const c of snap.claims) {
      const list = byItem.get(c.group_item_id)
      if (list) list.push(c)
      else byItem.set(c.group_item_id, [c])
    }

    const tiles: TileView[] = snap.groupItems.map((item) => {
      const claims = byItem.get(item.id) ?? []
      return {
        item,
        claims,
        claimed: claims.reduce((n, c) => n + c.qty, 0),
        state: tileState(item, claims),
        mine: claims.find((c) => c.rider_id === me?.id) ?? null,
      }
    })

    const active = tiles.filter((t) => t.item.qty > 0)
    const notRequired = tiles.filter((t) => t.item.qty === 0)

    // Categories, in a stable order, for the active board only.
    const categories = [...new Set(active.map((t) => t.item.category))].sort()

    const gaps = active.filter((t) => t.claimed < t.item.qty)

    return { tiles, active, notRequired, categories, gaps, me }
  }, [snap, me])
}

export interface Load {
  rider: DbRider
  weightOz: number
  bulk: number
  items: number
}

/**
 * Only claimed GROUP items count. Personal kit is your own business, and
 * nobody gets credit in the balance for overpacking their own duffel.
 * Claims on zeroed-out items still count -- they are carrying it regardless
 * of what the group decided.
 */
export function useLoads() {
  const snap = useSnapshot()

  return useMemo(() => {
    const items = new Map(snap.groupItems.map((i) => [i.id, i]))
    const loads: Load[] = snap.riders.map((rider) => {
      const mine = snap.claims.filter((c) => c.rider_id === rider.id)
      let weightOz = 0
      let bulk = 0
      for (const c of mine) {
        const it = items.get(c.group_item_id)
        if (!it) continue
        weightOz += Number(it.weight_oz) * c.qty
        bulk += it.bulk * c.qty
      }
      return { rider, weightOz, bulk, items: mine.length }
    })

    const total = loads.reduce((n, l) => n + l.weightOz, 0)
    const avg = loads.length ? total / loads.length : 0
    const max = Math.max(1, ...loads.map((l) => l.weightOz))
    const maxBulk = Math.max(1, ...loads.map((l) => l.bulk))

    return { loads, total, avg, max, maxBulk }
  }, [snap])
}

export interface Warning {
  key: string
  title: string
  detail: string
  quote: string
}

/**
 * Cross-rider constraints that no flat checklist can express: the Bible
 * asks for a hanger per BIKE TYPE and Power Links compatible with EVERY
 * chain in the group. These flag coverage only -- they never propose or
 * adjust quantities.
 */
export function useCompatibility(): Warning[] {
  const snap = useSnapshot()

  return useMemo(() => {
    const out: Warning[] = []
    const claimedQty = (match: RegExp) =>
      snap.groupItems
        .filter((i) => match.test(i.name))
        .reduce(
          (n, i) =>
            n +
            snap.claims
              .filter((c) => c.group_item_id === i.id)
              .reduce((m, c) => m + c.qty, 0),
          0,
        )

    const speeds = [
      ...new Set(snap.riders.map((r) => r.chain_speed).filter(Boolean)),
    ] as string[]
    const links = claimedQty(/power ?link/i)
    if (speeds.length > 0 && links < speeds.length * 2) {
      out.push({
        key: 'powerlinks',
        title: `Power Links may not cover every chain`,
        detail: `${speeds.length} distinct chain type${speeds.length === 1 ? '' : 's'} in the group (${speeds.join(', ')}) — that calls for ${speeds.length * 2} links, and ${links} ${links === 1 ? 'is' : 'are'} claimed.`,
        quote: 'Two SRAM Power Links for each type of chain in the group.',
      })
    }

    const hangers = [
      ...new Set(snap.riders.map((r) => r.hanger_model).filter(Boolean)),
    ] as string[]
    const spares = claimedQty(/hanger/i)
    if (hangers.length > 0 && spares < hangers.length) {
      out.push({
        key: 'hangers',
        title: 'Not every bike has a spare hanger',
        detail: `${hangers.length} distinct hanger model${hangers.length === 1 ? '' : 's'} in the group (${hangers.join(', ')}), ${spares} claimed. Hangers are not interchangeable between bikes.`,
        quote: 'Spare derailleur hanger for each type of bike.',
      })
    }

    const unknown = snap.riders.filter((r) => !r.chain_speed || !r.hanger_model)
    if (unknown.length > 0) {
      out.push({
        key: 'unknown-specs',
        title: `${unknown.length} rider${unknown.length === 1 ? '' : 's'} have not filled in bike specs`,
        detail: `${unknown.map((r) => r.name.split(' ')[0]).join(', ')} — without chain speed and hanger model these checks cannot tell whether the group is actually covered.`,
        quote: 'At least one member of the group should have all of the necessary parts.',
      })
    }

    return out
  }, [snap])
}

export { store }
