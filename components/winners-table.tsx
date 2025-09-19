'use client'

import { useRaffle } from '@/components/raffle-context'

export function WinnersTable() {
  const { winners } = useRaffle()
  return (
    <details open className="group w-full md:block">
      <summary className="flex cursor-pointer items-center justify-between list-none font-semibold md:hidden">
        Winners
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="overflow-auto md:overflow-visible">
        <h3 className="mb-2 hidden font-semibold md:block">Winners</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-1 pr-2">Round</th>
            <th className="py-1 pr-2">Wallet</th>
            <th className="py-1 pr-2">Time</th>
            <th className="py-1">Verify</th>
          </tr>
        </thead>
        <tbody>
          {winners.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-2 text-center text-muted-foreground">
                —
              </td>
            </tr>
          ) : (
            winners.map(w => (
              <tr key={w.round} className="border-b last:border-none">
                <td className="py-1 pr-2">{w.round}</td>
                <td className="py-1 pr-2 font-mono">{w.address}</td>
                <td className="py-1 pr-2 text-xs">{new Date(w.timestamp).toLocaleTimeString()}</td>
                <td className="py-1 text-xs">
                  {'revealTx' in w && w.revealTx ? (
                    <a
                      href={`https://explorer.solana.com/tx/${w.revealTx}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </details>
  )
}
