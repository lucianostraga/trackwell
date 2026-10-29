import { ArrowRight } from 'lucide-react'
import { NAV_LINKS, SECTION } from '../content/sections'
import type { BuildInfo } from '../lib/build-info'
import { sectionHref } from '../lib/sections'
import { EnvironmentBadge } from './EnvironmentBadge'
import { Logo } from './Logo'
import { ButtonLink } from './ui/Button'

/** Sticky top bar: logo, section links and the main call to action. Previews also show their badge. */
export function Navbar({ build }: { build: BuildInfo }) {
  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 border-b border-ink-150/80 bg-page/90 backdrop-blur-xl backdrop-saturate-150"
    >
      <nav aria-label="Main" className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="rounded-lg" aria-label="Trackwell home">
          <Logo />
        </a>
        {build.environment === 'preview' && (
          <span className="hidden sm:inline-flex">
            <EnvironmentBadge info={build} />
          </span>
        )}
        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={sectionHref(link.id)}
                className="rounded-lg px-3 py-2 text-[15px] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <ButtonLink
          href={sectionHref(SECTION.contact)}
          size="sm"
          className="ml-auto md:ml-3"
          data-testid="nav-book-demo"
        >
          Book a demo
          <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </nav>
    </header>
  )
}
