import { Check, ChevronDown, Hospital } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FACILITY } from '../data/floor'
import { cn } from './ui/cn'

/** Hospital and floor picker. Only Level 2 has tags installed in this demo. */
export function FacilitySelector() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = FACILITY.floors.find((f) => f.id === FACILITY.currentFloorId)!

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="facility-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl py-1.5 pr-2.5 pl-2 text-left transition hover:bg-ink-100"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-ink-50 text-ink-600 ring-1 ring-ink-150 ring-inset">
          <Hospital aria-hidden="true" className="size-[18px]" strokeWidth={1.9} />
        </span>
        <span className="leading-tight">
          <span className="block text-[14px] font-semibold text-ink-900">{FACILITY.name}</span>
          <span className="block text-xs text-ink-500" data-testid="current-floor">
            {current.name}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={cn('size-4 text-ink-400 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Floor"
          className="absolute top-full left-0 z-40 mt-2 w-80 animate-pop-in rounded-xl border border-ink-150 bg-white p-1.5 shadow-pop"
        >
          {FACILITY.floors.map((floor) => {
            const selected = floor.id === current.id
            return (
              <li key={floor.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={!floor.tracked}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px]',
                    floor.tracked ? 'text-ink-900 hover:bg-ink-50' : 'cursor-not-allowed text-ink-400',
                  )}
                >
                  <span className="flex-1">
                    <span className="block font-medium">{floor.name}</span>
                    {!floor.tracked && <span className="block text-xs">No tags installed yet</span>}
                  </span>
                  {selected && <Check aria-hidden="true" className="size-4 text-brand-600" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
