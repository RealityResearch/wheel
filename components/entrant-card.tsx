'use client'

import { useState } from 'react'
import { useRaffle } from './raffle-context'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function EntrantCard() {
  const { addEntrant, slots, waitlist, spinning } = useRaffle()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const filled = slots.filter(s => s.address !== null).length

  function handleSubmit() {
    const ok = addEntrant(value.trim())
    if (!ok) {
      setError('Invalid or duplicate address')
    } else {
      setValue('')
      setError('')
    }
  }

  return (
    <div className="w-full max-w-md space-y-4 rounded-md border p-4">
      <h2 className="text-lg font-semibold">Enter Wallet</h2>
      <Textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Enter Solana wallet address"
        disabled={spinning}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button className="w-full" onClick={handleSubmit} disabled={!value.trim() || spinning}>
        Submit
      </Button>
      {(filled > 0 || waitlist.length > 0) && (
        <p className="text-sm text-muted-foreground">
          Slots filled: {filled}/50 • Waitlist: {waitlist.length}
        </p>
      )}
    </div>
  )
}
