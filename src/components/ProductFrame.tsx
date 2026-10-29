import { Lock } from 'lucide-react'
import { cn } from './ui/cn'

interface ProductFrameProps {
  src: string
  alt: string
  /** Shown in the address bar. */
  url: string
  width: number
  height: number
  className?: string
}

/** A product screenshot in a light browser window, with a soft shadow and a teal glow behind it. */
export function ProductFrame({ src, alt, url, width, height, className }: ProductFrameProps) {
  return (
    <div className={cn('relative', className)} data-testid="product-frame">
      <div
        aria-hidden="true"
        className="absolute inset-x-[8%] top-[12%] -bottom-[6%] rounded-[48px] bg-[radial-gradient(closest-side,var(--color-brand-300),transparent)] opacity-60 blur-3xl"
      />
      <div className="relative rounded-[20px] bg-surface/55 p-2 shadow-product ring-1 ring-frame-ring backdrop-blur sm:rounded-[26px] sm:p-2.5">
        <div className="overflow-hidden rounded-[14px] bg-surface ring-1 ring-ink-900/[0.07] sm:rounded-[18px]">
          <div className="flex h-9 items-center gap-3 border-b border-ink-150 bg-ink-25 px-4 sm:h-11">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#ff6159] sm:size-3" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e] sm:size-3" />
              <span className="size-2.5 rounded-full bg-[#28c941] sm:size-3" />
            </div>
            <div className="mx-auto flex h-6 min-w-0 items-center gap-1.5 rounded-md bg-ink-100/80 px-3 text-xs text-ink-500 sm:h-7 sm:w-[min(420px,50%)] sm:justify-center sm:text-[13px]">
              <Lock aria-hidden="true" className="size-3 shrink-0" strokeWidth={2.4} />
              <span className="truncate">{url}</span>
            </div>
            <div className="hidden w-[52px] sm:block" aria-hidden="true" />
          </div>
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="block h-auto w-full"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  )
}
