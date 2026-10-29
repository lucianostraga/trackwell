import { CUSTOMER_LOGOS, type WordmarkStyle } from '../content/logos'
import { Container } from './ui/Section'
import { cn } from './ui/cn'

const WORDMARK: Record<WordmarkStyle, string> = {
  sans: 'font-sans text-[16px] font-semibold tracking-[-0.02em]',
  serif: 'font-serif text-[18px] font-semibold italic tracking-[-0.01em]',
  caps: 'font-sans text-[13px] font-bold tracking-[0.16em] uppercase',
  rounded: 'font-sans text-[16px] font-extrabold tracking-[-0.03em]',
}

/** "Trusted by care teams at" and a row of fictional hospital wordmarks, in grayscale. */
export function TrustBar() {
  return (
    <section aria-labelledby="trust-title" className="relative pt-6 pb-16 sm:pb-20" data-testid="trust-bar">
      <Container>
        <h2 id="trust-title" className="text-center text-sm font-medium text-ink-500">
          Trusted by care teams at
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 xl:flex-nowrap xl:justify-between xl:gap-x-6">
          {CUSTOMER_LOGOS.map(({ id, name, icon: Icon, style }) => (
            <li
              key={id}
              data-testid="customer-logo"
              className="flex items-center gap-2 text-ink-400 transition-colors duration-200 hover:text-ink-700"
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={style === 'caps' ? 2.4 : 2} />
              <span className={cn('whitespace-nowrap', WORDMARK[style])}>{name}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
