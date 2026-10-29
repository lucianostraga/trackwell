/** Trackwell mark: a location ring with a live signal arc, on a teal tile. */
export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="trackwell-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17a596" />
          <stop offset="1" stopColor="#0b6f69" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8.5" fill="url(#trackwell-mark)" />
      <path
        d="M16 25.5c-3.9-4-6.4-7.3-6.4-10.6a6.4 6.4 0 1 1 12.8 0c0 3.3-2.5 6.6-6.4 10.6Z"
        fill="#fff"
      />
      <circle cx="16" cy="14.9" r="2.6" fill="#0e8478" />
      <path d="M22.6 7.2a9.2 9.2 0 0 1 2.6 4.3" stroke="#ffd2ad" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5" aria-label="Trackwell">
      <LogoMark />
      <span aria-hidden="true" className="text-[19px] leading-none font-bold tracking-[-0.03em] text-ink-900">
        track<span className="text-brand-600">well</span>
      </span>
    </span>
  )
}
