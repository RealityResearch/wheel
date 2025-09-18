'use client'

import { useRaffle } from '@/components/raffle-context'

export function EntrantsTable() {
  const { slots } = useRaffle()
  return (
    <details open className="group w-full md:block">
      <summary className="flex cursor-pointer items-center justify-between list-none font-semibold md:hidden">
        Entrants
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="overflow-auto md:overflow-visible">
        <h3 className="mb-2 hidden font-semibold md:block">Entrants</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-1 pr-2">#</th>
            <th className="py-1">Wallet</th>
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot.number} className="border-b last:border-none">
              <td className="py-1 pr-2 font-mono">{slot.number}</td>
              <td className="py-1 font-mono">
                {slot.address ? slot.address : <span className="text-muted-foreground">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </details>
  )
}
