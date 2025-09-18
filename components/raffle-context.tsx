'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { isValidSolanaAddress } from '@/lib/validateWallet'

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

async function postJSON(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

async function patchJSON(url: string, body: any) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

interface Settings {
  interval: number
  autoSpin: boolean
  tokenGate: boolean
  mint: string
}

interface Slot {
  number: number
  address: string | null
  color: string | null
}

export interface RaffleState {
  slots: Slot[] // length 50
  waitlist: string[]
  winners: { round: number; address: string; timestamp: number; amount: number }[]
  settings: Settings
  autoSpin: boolean
  interval: number
  countdown: number
  spinning: boolean
  addEntrant: (address: string) => boolean
  setSettings: (partial: Partial<Settings>) => void
  // auto spin is fixed; no toggle or interval setter
  registerSpin: (fn: () => void) => void
  triggerSpin: () => void
  recordWinner: (slotIdx: number) => void
  setSpinning: (v: boolean) => void
  updateNextSpinTs: (ts: number) => void
}

const defaultSettings: Settings = {
  interval: 180,
  autoSpin: false,
  tokenGate: false,
  mint: ''
}

const RaffleContext = createContext<RaffleState | undefined>(undefined)

// removed localStorage usage; source of truth is Redis via API

const FILLED_COLOR = 'fill-[#79D297]'

export function RaffleProvider({ children }: { children: React.ReactNode }) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: 50 }).map((_, i) => ({ number: i + 1, address: null, color: null }))
  )
  const [waitlist, setWaitlist] = useState<string[]>([])
  const [winners, setWinners] = useState<RaffleState['winners']>([])
  const [settings, setSettingsState] = useState<Settings>(defaultSettings)
  const autoSpin = true
  const intervalSec = 180
  const [nextSpinTs, setNextSpinTs] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const spinRef = useRef<() => void>()
  // countdown effect
  useEffect(() => {
    if (!autoSpin || spinning || nextSpinTs === null) return
    if (countdown === 0) spinRef.current?.()
  }, [autoSpin, countdown, spinning, nextSpinTs])

  // reset countdown when spin ends
  useEffect(() => {
    if (!spinning) return
    const id = setInterval(() => {
      if (!spinning) {
        setCountdown(intervalSec)
        clearInterval(id)
      }
    }, 500)
    return () => clearInterval(id)
  }, [spinning, intervalSec])

  function registerSpin(fn: () => void) {
    spinRef.current = fn
  }

  function triggerSpin() {
    spinRef.current?.()
    setCountdown(intervalSec)
  }

  // initial fetch state and keep nextSpinTs in sync every 5s
  useEffect(() => {
    const fetchTs = async () => {
      try {
        const { nextSpinTs } = await getJSON<{ nextSpinTs: number }>('/api/state')
        setNextSpinTs(nextSpinTs)
      } catch {}
    }
    fetchTs()
    const id = setInterval(fetchTs, 5000)
    return () => clearInterval(id)
  }, [])

  // derive countdown every second
  useEffect(() => {
    const id = setInterval(() => {
      if (nextSpinTs === null) return
      setCountdown(Math.max(0, Math.floor((nextSpinTs - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [nextSpinTs])

  async function refreshEntrants() {
    try {
      const { entrants } = await getJSON<{ entrants: string[] }>('/api/entrants')
      setSlots(prev => {
        const copy = [...prev]
        entrants.slice(0, 50).forEach((addr, idx) => {
          copy[idx] = { number: idx + 1, address: addr, color: FILLED_COLOR }
        })
        for (let i = entrants.length; i < 50 && i < copy.length; i++) {
          copy[i] = { number: i + 1, address: null, color: null }
        }
        return copy
      })
      setWaitlist(entrants.slice(50))
    } catch {}
  }

  // poll every 10s until wheel filled
  useEffect(() => {
    refreshEntrants() // initial call
    const id = setInterval(() => {
      const filled = slots.filter(s => s.address).length
      if (filled < 50) refreshEntrants()
    }, 10000)
    return () => clearInterval(id)
  }, [])

  // poll winners
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const { winners } = await getJSON<{ winners: RaffleState['winners'] }>('/api/winners')
        setWinners(winners)
      } catch {}
    }, 2000)
    return () => clearInterval(id)
  }, [])

  function addEntrant(address: string): boolean {
    if (!isValidSolanaAddress(address)) return false
    if (slots.some(s => s.address === address) || waitlist.includes(address)) return false

    postJSON('/api/entrants', { address })
      .then(() => {})
      .catch(() => {})
    return true
  }

  function setSettings(partial: Partial<Settings>) {
    setSettingsState(prev => {
      const next = { ...prev, ...partial }
      patchJSON('/api/state', partial).catch(() => {})
      return next
    })
  }

  function recordWinner(slotIdx: number) {
    setSlots(prev => {
      const copy = [...prev]
      const winnerSlot = copy[slotIdx]
      if (winnerSlot.address) {
        const newRecord = { round: winners.length + 1, address: winnerSlot.address!, timestamp: Date.now(), amount: 1 }
        setWinners(w => [...w, newRecord])
        postJSON('/api/winners', { address: winnerSlot.address!, round: newRecord.round })
        // replace with waitlist first element or empty
        if (waitlist.length > 0) {
          const [next, ...rest] = waitlist
          setWaitlist(rest)
          copy[slotIdx] = {
            number: winnerSlot.number,
            address: next,
            color: FILLED_COLOR
          }
        } else {
          copy[slotIdx] = { number: winnerSlot.number, address: null, color: null }
        }
      }
      return copy
    })
  }

  // expose refresh for wheel
  async function reloadEntrants() {
    await refreshEntrants()
  }

  return (
    <RaffleContext.Provider
      value={{
        slots,
        waitlist,
        winners,
        settings,
        addEntrant,
        setSettings,
        recordWinner,
        autoSpin,
        interval: intervalSec,
        countdown,
        registerSpin,
        triggerSpin,
        spinning,
        setSpinning,
        updateNextSpinTs,
      }}
    >
      {children}
    </RaffleContext.Provider>
  )
}

export function useRaffle() {
  const ctx = useContext(RaffleContext)
  if (!ctx) throw new Error('useRaffle must be inside RaffleProvider')
  return ctx
}
