import { ArrowRight, CalendarCheck, Clock, Mail, MapPinned } from 'lucide-react'
import { CONTACT_EMAIL, SECTION } from '../content/sections'
import { Container, SectionHeading } from './ui/Section'

const EXPECT = [
  { icon: Clock, text: 'A 30-minute call with a clinical workflow specialist' },
  { icon: MapPinned, text: 'One of your units mapped and shown live' },
  { icon: CalendarCheck, text: 'A rollout plan sized to your hospital' },
]

/** "Talk to us": where every "Book a demo" button lands. */
export function Contact() {
  return (
    <section id={SECTION.contact} aria-labelledby="contact-title" className="py-24 sm:py-28" data-testid="contact">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            id="contact-title"
            align="left"
            eyebrow="Talk to us"
            title="Book a demo"
            description="Tell us about your hospital and we will set up a walkthrough on your own floor plan."
          />
          <ul className="mt-8 space-y-4">
            {EXPECT.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] text-ink-700">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100 ring-inset">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-page-subtle p-8 ring-1 ring-ink-150 sm:p-10">
          <span className="grid size-12 place-items-center rounded-2xl bg-surface text-brand-600 shadow-card ring-1 ring-ink-150">
            <Mail aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink-900">Email our team</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
            We reply within one business day.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-testid="contact-email"
            className="group mt-6 flex items-center justify-between gap-4 rounded-2xl bg-surface px-5 py-4 text-lg font-semibold text-brand-700 shadow-card ring-1 ring-ink-150 transition hover:shadow-raised hover:ring-brand-200"
          >
            {CONTACT_EMAIL}
            <ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </Container>
    </section>
  )
}
