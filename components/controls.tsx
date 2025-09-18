'use client'

import { useState } from 'react'
import { useRaffle } from '@/components/raffle-context'
import { Button } from '@/components/ui/button'

export function Controls() {
  const { countdown } = useRaffle()

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-3xl font-mono tabular-nums">
        {mm}:{ss}
      </p>
      <p className="text-sm text-muted-foreground">Must be holding $WOF to participate.</p>
    </div>
  )
}
