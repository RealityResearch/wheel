'use client'

import { useRaffle } from '@/components/raffle-context'

export function WaitlistTable() {
  const { waitlist } = useRaffle()
  return (
    <details open className="group w-full md:block">
      <summary className="flex cursor-pointer items-center justify-between list-none font-semibold md:hidden">
        Waitlist
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="overflow-auto md:overflow-visible">
        <h3 className="mb-2 hidden font-semibold md:block">Waitlist</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-1">Wallet</th>
          </tr>
        </thead>
        <tbody>
          {waitlist.length === 0 ? (
            <tr>
              <td className="py-2 text-muted-foreground">—</td>
            </tr>
          ) : (
            waitlist.map(addr => (
              <tr key={addr} className="border-b last:border-none">
                <td className="py-1 font-mono">{addr}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </details>
  )
}
