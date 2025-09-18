'use client'

import { motion, useAnimationControls } from 'framer-motion'
import { useRaffle } from '@/components/raffle-context'
import { useEffect, useMemo, useState, useRef } from 'react'

async function postSpin() {
  const res = await fetch('/api/spin', { method: 'POST' })
  if (!res.ok) throw new Error('Spin failed')
  return res.json() as Promise<{ i: number; address: string; tx: string }>
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  }
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z'
  ].join(' ')
}

const SEGMENTS = 50

export function Wheel() {
  const { slots, winners, recordWinner, registerSpin, setSpinning, spinning } = useRaffle()
  const [flashIdx, setFlashIdx] = useState<number | null>(null)
  const controls = useAnimationControls()

  const [pollKey, setPollKey] = useState<string | null>(null)

  async function spin() {
    if (spinning) return

    setSpinning(true)

    try {
      await postSpin() // webhook will handle winner
    } catch (e) {
      console.error(e)
      setSpinning(false)
    }
  }

  // Resolve spin when new winner arrives
  const prevWinnerLen = useRef(winners.length)
  useEffect(() => {
    if (!spinning) {
      prevWinnerLen.current = winners.length
      return
    }
    if (winners.length <= prevWinnerLen.current) return

    const lastWinner = winners[winners.length - 1]
    const winnerIdx = slots.findIndex(s => s.address === lastWinner.address)
    if (winnerIdx === -1) return // address not in current slots

    ;(async () => {
      const rotations = 5 + Math.floor(Math.random() * 3)
      const degreesPerSeg = 360 / SEGMENTS
      const targetDeg = rotations * 360 + winnerIdx * degreesPerSeg + degreesPerSeg / 2

      await controls.start({ rotate: targetDeg, transition: { duration: 8, ease: 'easeOut' } })
      setFlashIdx(winnerIdx)
      setTimeout(() => {
        setFlashIdx(null)
        setSpinning(false)
      }, 10000)
    })()

    prevWinnerLen.current = winners.length
  }, [winners])

  // register spin on mount
  useEffect(() => {
    registerSpin(spin)
  }, [])

  const slicePaths = useMemo(() => {
    const paths: string[] = []
    const cx = 200
    const cy = 200
    const r = 200
    const step = 360 / SEGMENTS
    for (let i = 0; i < SEGMENTS; i++) {
      const start = i * step
      const end = (i + 1) * step
      paths.push(describeSlice(cx, cy, r, start, end))
    }
    return paths
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
<div className="relative size-80 md:size-[32rem] lg:size-[38rem]">        {/* SVG wheel */}
        <motion.svg
          viewBox="0 0 400 400"
          className="absolute inset-0"
          animate={controls}
          style={{ originX: '50%', originY: '50%' }}
        >
          {slicePaths.map((d, idx) => (
            <path
              key={idx}
              d={d}
              className={`${
                slots[idx].color ?? 'fill-white'
              } stroke-gray-200 ${flashIdx === idx ? 'animate-pulse' : ''}`}
              strokeWidth={1}
            />
          ))}
          {/* numbers */}
          {slicePaths.map((_, idx) => {
            const angle = (360 / SEGMENTS) * idx + 360 / SEGMENTS / 2
            const { x, y } = polarToCartesian(200, 200, 170, angle)
            return (
              <text
                key={idx}
                x={x}
                y={y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                transform={`rotate(${angle} ${x} ${y})`}
              >
                {idx + 1}
              </text>
            )
          })}
        </motion.svg>
        {/* pointer */}
        <div className="absolute left-1/2 -top-4 -translate-x-1/2 text-primary select-none">▼</div>
      </div>
      {/* Auto-spin, no manual button */}
    </div>
  )
}
