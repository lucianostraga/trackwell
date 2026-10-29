import type { FaqItem } from '../lib/faq'
import { PAID_MONTHS_PER_YEAR } from '../lib/pricing'
import { MINUTES_SAVED_PER_ASSET_PER_MONTH } from '../lib/savings'
import { PLANS } from './pricing'
import { CONTACT_EMAIL } from './sections'

function plan(id: string) {
  const found = PLANS.find((p) => p.id === id)
  if (!found) throw new Error(`Unknown plan: ${id}`)
  return found
}

const usd = (n: number | null) => `$${(n ?? 0).toLocaleString('en-US')}`
const count = (n: number | null) => (n ?? 0).toLocaleString('en-US')

const starter = plan('starter')
const growth = plan('growth')
const monthsFree = 12 - PAID_MONTHS_PER_YEAR

export const FAQ: readonly FaqItem[] = [
  {
    id: 'what-it-does',
    question: 'What does Trackwell do?',
    answer:
      'Trackwell shows every pump, bed, monitor and wheelchair on a live map of your hospital, so care teams stop searching and start caring.',
  },
  {
    id: 'how-tracking-works',
    question: 'How does tracking work?',
    answer:
      'You clip a coin-sized tag onto a device. Ceiling sensors pick up every tag and place it on your floor plan, room by room, updated every few seconds.',
  },
  {
    id: 'equipment-types',
    question: 'What kind of equipment can we tag?',
    answer: 'Pumps, beds, monitors and wheelchairs. Search for a device, such as a ventilator, and see the closest available one on the map.',
  },
  {
    id: 'patient-data',
    question: 'Does Trackwell store patient data?',
    answer: 'No patient data ever touches a tag. Trackwell is encrypted end to end, with role-based access and full audit trails.',
  },
  {
    id: 'integrations',
    question: 'Which integrations does it have?',
    answer: 'Your EHR, work-order and nurse-call systems, with single sign-on and an open API for everything else.',
  },
  {
    id: 'cost',
    question: 'What is the price of each plan?',
    answer: `${starter.name} is ${usd(starter.monthlyPrice)} per month for up to ${count(starter.assetLimit)} assets. ${growth.name} is ${usd(growth.monthlyPrice)} per month for up to ${count(growth.assetLimit)} assets. For Enterprise, contact sales.`,
  },
  {
    id: 'yearly-discount',
    question: 'Is there a discount for paying yearly?',
    answer: `Yes. Pay yearly and get ${monthsFree} months free.`,
  },
  {
    id: 'cleaning',
    question: 'How are cleaned devices handled?',
    answer: 'Used devices are flagged for sterile processing automatically and only show as available once they are clean.',
  },
  {
    id: 'savings',
    question: 'How can I estimate our savings?',
    answer: `Use the savings calculator on this page. Enter how many assets you track and what an hour of nursing time costs. It is based on ${MINUTES_SAVED_PER_ASSET_PER_MONTH} minutes of searching saved per asset each month.`,
  },
  {
    id: 'book-demo',
    question: 'How do I book a demo?',
    answer: `Use the form in the Book a demo section. It is a 30-minute call with a clinical workflow specialist, and we set up a walkthrough on your own floor plan. You can also write to ${CONTACT_EMAIL}.`,
  },
]
