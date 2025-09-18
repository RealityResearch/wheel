'use client'

import { RaffleProvider } from '@/components/raffle-context'
import { EntrantCard } from '@/components/entrant-card'
import { Wheel } from '@/components/wheel'
import { EntrantsTable } from '@/components/entrants-table'
import { WaitlistTable } from '@/components/waitlist-table'
import { WinnersTable } from '@/components/winners-table'
import { Controls } from '@/components/controls'

export default function Home() {
  return (
    <RaffleProvider>
      <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8 md:px-8 lg:px-12 max-w-screen-xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">WHEEL OF FORTUNE</h1>
          <p className="text-muted-foreground">Spin to win every 3 minutes</p>
          <Wheel />
          <Controls />
          <EntrantCard />
        </div>
        <div className="flex w-full flex-col gap-4 md:max-w-none md:flex-row md:gap-6">
          <EntrantsTable />
          <WaitlistTable />
          <WinnersTable />
        </div>
      </main>
    </RaffleProvider>
  )
}
