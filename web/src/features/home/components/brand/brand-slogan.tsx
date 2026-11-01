/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import {
  BRAND_RIPPLE_EVENT,
  SLOGAN_MODEL_SLOT,
  type BrandRippleDetail,
} from '../../lib/brand-events'

// Han characters and letter/number runs are "stops" the pen visits; spaces
// and punctuation ride along with the stop before them.
const TOKEN_PATTERN =
  /\p{Script=Han}|[\p{L}\p{N}'’]+|[^\p{Script=Han}\p{L}\p{N}'’]/gu
const STOP_PATTERN = /^(\p{Script=Han}|[\p{L}\p{N}'’]+)$/u
const LINE_BREAK_GLUE = /[,，]/

const INTRO_MS = 1000
const SWEEP_STEP_MS = 120
const SWEEP_HOLD_MS = 380
const LAND_MS = 260
const IDLE_MS = 5200

type Token =
  | { kind: 'word'; text: string; stop: number }
  | { kind: 'glue'; text: string; stop: number }
  | { kind: 'slot'; stop: number }

type Phase = 'intro' | 'idle' | 'sweep'

interface BrandSloganProps {
  /** Slogan with `SLOGAN_MODEL_SLOT` wherever the model name goes. */
  template: string
  models: readonly string[]
  /** Wait before the pen starts writing, in ms. */
  delay?: number
}

/**
 * The brand dot writes the slogan on load and stays as its full stop. Every
 * few seconds it runs back over the line: each word lifts as the dot passes,
 * the model name changes, and the landing sends a ripple through the dot
 * field behind. Assistive tech and crawlers read one static sentence.
 */
export function BrandSlogan(props: BrandSloganProps) {
  const reduceMotion = useReducedMotion()
  const startDelay = props.delay ?? 0
  const [phase, setPhase] = useState<Phase>('intro')
  const [pen, setPen] = useState(0)
  const [modelIndex, setModelIndex] = useState(0)
  const [widths, setWidths] = useState<Record<string, number>>({})
  const penRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)

  const tokens = useMemo(() => {
    const out: Token[] = []
    let stop = -1
    props.template.split(SLOGAN_MODEL_SLOT).forEach((text, part) => {
      if (part > 0) out.push({ kind: 'slot', stop: ++stop })
      for (const piece of text.match(TOKEN_PATTERN) ?? []) {
        if (STOP_PATTERN.test(piece)) {
          out.push({ kind: 'word', text: piece, stop: ++stop })
          continue
        }
        const prev = out.at(-1)
        if (prev?.kind === 'glue') {
          prev.text += piece
        } else {
          out.push({ kind: 'glue', text: piece, stop: Math.max(stop, 0) })
        }
      }
    })
    return out
  }, [props.template])
  const stops = tokens.reduce((n, tok) => Math.max(n, tok.stop + 1), 0)

  // Each name is measured once so the slot can ease between widths instead
  // of jumping the centred line when the name changes.
  useEffect(() => {
    const box = measureRef.current
    if (!box) return
    const measure = () => {
      const next: Record<string, number> = {}
      for (const child of box.children) {
        const el = child as HTMLElement
        if (el.dataset.name && el.offsetWidth > 0) {
          next[el.dataset.name] = el.offsetWidth
        }
      }
      setWidths(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [props.models])

  useEffect(() => {
    if (reduceMotion || stops === 0) return
    let timer: number
    if (phase === 'idle') {
      timer = window.setTimeout(() => {
        setPen(0)
        setPhase('sweep')
      }, IDLE_MS)
    } else if (pen >= stops) {
      timer = window.setTimeout(() => {
        const landed =
          phase === 'sweep'
            ? (modelIndex + 1) % props.models.length
            : modelIndex
        setModelIndex(landed)
        setPhase('idle')
        const rect = penRef.current?.getBoundingClientRect()
        if (rect) {
          penRef.current?.dispatchEvent(
            new CustomEvent<BrandRippleDetail>(BRAND_RIPPLE_EVENT, {
              bubbles: true,
              detail: {
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2,
              },
            })
          )
        }
      }, LAND_MS)
    } else {
      const firstSweepStep = phase === 'sweep' && pen === 0
      const firstIntroStep = phase === 'intro' && pen === 0
      const stepMs = phase === 'intro' ? INTRO_MS / stops : SWEEP_STEP_MS
      let wait = stepMs
      if (firstSweepStep) wait = SWEEP_HOLD_MS
      if (firstIntroStep) wait = startDelay + stepMs
      timer = window.setTimeout(() => setPen((p) => p + 1), wait)
    }
    return () => window.clearTimeout(timer)
  }, [phase, pen, stops, reduceMotion, modelIndex, props.models, startDelay])

  const settled = reduceMotion || phase === 'idle'
  const reveal = phase === 'intro' && !reduceMotion ? pen : stops
  const penAt = settled ? stops - 1 : pen - 1
  const current = props.models[modelIndex]
  const next = props.models[(modelIndex + 1) % props.models.length]
  const plainText = props.template
    .split(SLOGAN_MODEL_SLOT)
    .join(props.models[0])

  const penNode = (
    <span className='relative inline-block w-0'>
      <motion.span
        ref={penRef}
        layoutId='brand-slogan-pen'
        transition={{ type: 'spring', stiffness: 520, damping: 38 }}
        className='bg-primary absolute bottom-[0.14em] left-[0.04em] size-[0.2em] rounded-full'
      >
        {phase === 'idle' && !reduceMotion && (
          <span className='brand-ripple border-primary absolute inset-0 rounded-full border' />
        )}
      </motion.span>
    </span>
  )

  let lineBroken = false
  return (
    <span data-state={reduceMotion ? 'idle' : phase} className='relative'>
      <span className='sr-only'>{plainText}</span>
      <span aria-hidden>
        {penAt < 0 && penNode}
        {tokens.map((tok, i) => {
          const key = `${i}:${tok.kind}`
          const visible = tok.stop < reveal
          const lifted = phase === 'sweep' && tok.stop === pen - 1
          const fadeClass = visible
            ? 'opacity-100 blur-none'
            : 'opacity-0 blur-[6px]'
          if (tok.kind === 'glue') {
            const breakHere = !lineBroken && LINE_BREAK_GLUE.test(tok.text)
            lineBroken ||= breakHere
            return (
              <span key={key}>
                <span
                  className={cn('transition-opacity duration-300', fadeClass)}
                >
                  {tok.text}
                </span>
                {/* Mobile keeps the two clauses on two lines whatever the
                    model name, so the hero height never jumps. */}
                {breakHere && <br className='md:hidden' />}
              </span>
            )
          }
          const liftClass = lifted ? '-translate-y-[0.08em]' : 'translate-y-0'
          const after = tok.stop === penAt && penNode
          if (tok.kind === 'word') {
            return (
              <span key={key}>
                <span
                  className={cn(
                    'inline-block transition-[opacity,filter,transform,color] duration-200',
                    fadeClass,
                    liftClass,
                    lifted && 'text-primary'
                  )}
                >
                  {tok.text}
                </span>
                {after}
              </span>
            )
          }
          const name = phase === 'sweep' && tok.stop < pen ? next : current
          return (
            <span key={key}>
              <span
                data-slot-model={name}
                className={cn(
                  'text-primary inline-grid justify-items-center transition-[opacity,filter,transform,width] duration-300',
                  fadeClass,
                  liftClass
                )}
                style={widths[name] ? { width: widths[name] } : undefined}
              >
                <AnimatePresence initial={false}>
                  <motion.span
                    key={name}
                    className='col-start-1 row-start-1 whitespace-nowrap'
                    initial={{ opacity: 0, y: '0.35em', filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: '-0.35em', filter: 'blur(4px)' }}
                    transition={{ duration: 0.3 }}
                  >
                    {name}
                  </motion.span>
                </AnimatePresence>
              </span>
              {after}
            </span>
          )
        })}
      </span>
      <span
        ref={measureRef}
        aria-hidden
        className='pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap'
      >
        {props.models.map((m) => (
          <span key={m} data-name={m} className='inline-block'>
            {m}
          </span>
        ))}
      </span>
    </span>
  )
}
