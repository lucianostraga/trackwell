export type DemoField = 'fullName' | 'email' | 'hospital' | 'role' | 'beds' | 'message'

export interface DemoFormValues {
  fullName: string
  email: string
  hospital: string
  role: string
  beds: string
  message: string
}

export type DemoFormErrors = Partial<Record<DemoField, string>>

export const PERSONAL_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
]

export const BEDS_LIMITS = { min: 1, max: 5000 } as const
export const NAME_MIN_LENGTH = 2

export const DEMO_ROLES: readonly string[] = [
  'Nursing leadership',
  'Clinical engineering / biomed',
  'Operations',
  'IT',
  'Supply chain',
  'Other',
]

export const EMPTY_DEMO_FORM: DemoFormValues = {
  fullName: '',
  email: '',
  hospital: '',
  role: '',
  beds: '',
  message: '',
}

const EMAIL_PATTERN = /^[^@\s]+@([a-z0-9-]+\.)+[a-z]{2,}$/i
const BEDS_PATTERN = /^(\d+|\d{1,3}(,\d{3})+)$/

export function validateDemoField(field: DemoField, values: DemoFormValues): string | undefined {
  const value = (values[field] ?? '').trim()
  switch (field) {
    case 'fullName':
      return value.length >= NAME_MIN_LENGTH
        ? undefined
        : 'Enter your full name (at least 2 characters).'
    case 'email': {
      if (value === '') return 'Enter your work email.'
      if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address, like name@hospital.org.'
      const domain = value.slice(value.indexOf('@') + 1).toLowerCase()
      if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
        return "Use your work email. Personal addresses like gmail.com aren't accepted."
      }
      return undefined
    }
    case 'hospital':
      return value.length >= NAME_MIN_LENGTH
        ? undefined
        : "Enter your hospital's name (at least 2 characters)."
    case 'role':
      return DEMO_ROLES.includes(value) ? undefined : 'Choose your role.'
    case 'beds': {
      const message = 'Enter the number of beds as a whole number from 1 to 5,000.'
      if (!BEDS_PATTERN.test(value)) return message
      const beds = Number(value.replace(/,/g, ''))
      return beds >= BEDS_LIMITS.min && beds <= BEDS_LIMITS.max ? undefined : message
    }
    case 'message':
      // Optional, no length rule decided by the team.
      return undefined
  }
}

export function validateDemoForm(values: DemoFormValues): DemoFormErrors {
  const fields: DemoField[] = ['fullName', 'email', 'hospital', 'role', 'beds', 'message']
  const errors: DemoFormErrors = {}
  for (const field of fields) {
    const error = validateDemoField(field, values)
    if (error) errors[field] = error
  }
  return errors
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? ''
}

export function confirmationMessage(fullName: string): string {
  return `Thanks, ${firstName(fullName)}! We'll reach out within one business day.`
}
