import { describe, expect, it } from 'vitest'
import {
  BEDS_LIMITS,
  confirmationMessage,
  DEMO_ROLES,
  EMPTY_DEMO_FORM,
  firstName,
  NAME_MIN_LENGTH,
  PERSONAL_EMAIL_DOMAINS,
  validateDemoField,
  validateDemoForm,
} from '../../src/lib/demo-form'
import type { DemoFormValues } from '../../src/lib/demo-form'

function makeValues(overrides: Partial<DemoFormValues> = {}): DemoFormValues {
  return {
    fullName: 'Ana María López',
    email: 'ana.lopez@stmarys-hospital.org',
    hospital: "St. Mary's Hospital",
    role: 'Nursing leadership',
    beds: '120',
    message: '',
    ...overrides,
  }
}

describe('constants', () => {
  it('lists the five personal email domains', () => {
    expect(PERSONAL_EMAIL_DOMAINS).toEqual(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'])
  })

  it('limits beds to a whole number from 1 to 5,000', () => {
    expect(BEDS_LIMITS).toEqual({ min: 1, max: 5000 })
  })

  it('requires at least 2 characters for name and hospital', () => {
    expect(NAME_MIN_LENGTH).toBe(2)
  })

  it('lists the six demo roles', () => {
    expect(DEMO_ROLES).toEqual([
      'Nursing leadership',
      'Clinical engineering / biomed',
      'Operations',
      'IT',
      'Supply chain',
      'Other',
    ])
  })

  it('starts an empty form with every field as an empty string', () => {
    expect(EMPTY_DEMO_FORM).toEqual({ fullName: '', email: '', hospital: '', role: '', beds: '', message: '' })
  })
})

describe('validateDemoField', () => {
  describe('fullName', () => {
    it('accepts a full name', () => {
      expect(validateDemoField('fullName', makeValues())).toBeUndefined()
    })

    it('accepts the boundary of 2 characters after trimming', () => {
      expect(validateDemoField('fullName', makeValues({ fullName: '  Ana  ' }))).toBeUndefined()
    })

    it('rejects 1 character with the exact message', () => {
      expect(validateDemoField('fullName', makeValues({ fullName: ' A ' }))).toBe(
        'Enter your full name (at least 2 characters).',
      )
    })

    it('rejects an empty or whitespace-only name', () => {
      expect(validateDemoField('fullName', makeValues({ fullName: '' }))).toBe(
        'Enter your full name (at least 2 characters).',
      )
      expect(validateDemoField('fullName', makeValues({ fullName: '   ' }))).toBe(
        'Enter your full name (at least 2 characters).',
      )
    })
  })

  describe('email', () => {
    it('accepts a work email', () => {
      expect(validateDemoField('email', makeValues())).toBeUndefined()
    })

    it('rejects an empty email', () => {
      expect(validateDemoField('email', makeValues({ email: '' }))).toBe('Enter your work email.')
      expect(validateDemoField('email', makeValues({ email: '   ' }))).toBe('Enter your work email.')
    })

    it.each(['ana', 'ana@', '@x.org', 'ana@hospital', 'a b@x.org'])(
      'rejects a malformed address %p with the exact message',
      (email) => {
        expect(validateDemoField('email', makeValues({ email }))).toBe(
          'Enter a valid email address, like name@hospital.org.',
        )
      },
    )

    it.each(['GMAIL.COM', 'Yahoo.com', 'HOTMAIL.COM', 'Outlook.Com', 'ICloud.com'])(
      'rejects the personal domain %p whatever the capitalization',
      (domain) => {
        expect(validateDemoField('email', makeValues({ email: `ana.lopez@${domain}` }))).toBe(
          "Use your work email. Personal addresses like gmail.com aren't accepted.",
        )
      },
    )

    it('rejects the personal domain in the plain form gmail.com', () => {
      expect(validateDemoField('email', makeValues({ email: 'ana@gmail.com' }))).toBe(
        "Use your work email. Personal addresses like gmail.com aren't accepted.",
      )
    })

    it('accepts subdomains and country variants of personal domains (exact-domain match only)', () => {
      expect(validateDemoField('email', makeValues({ email: 'ana@mail.gmail.com' }))).toBeUndefined()
      expect(validateDemoField('email', makeValues({ email: 'ana@gmail.com.au' }))).toBeUndefined()
    })

    it('accepts domains that are similar but not personal, like stmarys-gmail.org', () => {
      expect(validateDemoField('email', makeValues({ email: 'ana@stmarys-gmail.org' }))).toBeUndefined()
    })
  })

  describe('hospital', () => {
    it('accepts a hospital name', () => {
      expect(validateDemoField('hospital', makeValues())).toBeUndefined()
    })

    it('accepts the boundary of 2 characters after trimming', () => {
      expect(validateDemoField('hospital', makeValues({ hospital: '  St  ' }))).toBeUndefined()
    })

    it('rejects 1 character with the exact message', () => {
      expect(validateDemoField('hospital', makeValues({ hospital: ' S ' }))).toBe(
        "Enter your hospital's name (at least 2 characters).",
      )
    })

    it('rejects an empty hospital', () => {
      expect(validateDemoField('hospital', makeValues({ hospital: '' }))).toBe(
        "Enter your hospital's name (at least 2 characters).",
      )
    })
  })

  describe('role', () => {
    it('accepts a role from the list', () => {
      for (const role of DEMO_ROLES) {
        expect(validateDemoField('role', makeValues({ role }))).toBeUndefined()
      }
    })

    it('rejects an empty role', () => {
      expect(validateDemoField('role', makeValues({ role: '' }))).toBe('Choose your role.')
    })

    it('rejects a value that is not in DEMO_ROLES', () => {
      expect(validateDemoField('role', makeValues({ role: 'Volunteer' }))).toBe('Choose your role.')
    })
  })

  describe('beds', () => {
    const message = 'Enter the number of beds as a whole number from 1 to 5,000.'

    it('accepts a whole number of beds', () => {
      expect(validateDemoField('beds', makeValues({ beds: '120' }))).toBeUndefined()
    })

    it('accepts the lower boundary 1', () => {
      expect(validateDemoField('beds', makeValues({ beds: '1' }))).toBeUndefined()
    })

    it('accepts the upper boundary 5,000 with a thousands comma', () => {
      expect(validateDemoField('beds', makeValues({ beds: '5,000' }))).toBeUndefined()
    })

    it('accepts thousands commas in the middle of the range', () => {
      expect(validateDemoField('beds', makeValues({ beds: '1,200' }))).toBeUndefined()
    })

    it('rejects 0, just below the lower boundary', () => {
      expect(validateDemoField('beds', makeValues({ beds: '0' }))).toBe(message)
    })

    it('rejects 5001, just above the upper boundary', () => {
      expect(validateDemoField('beds', makeValues({ beds: '5001' }))).toBe(message)
    })

    it.each(['12.5', '-3', 'abc', ''])(
      'rejects %p with the exact message',
      (beds) => {
        expect(validateDemoField('beds', makeValues({ beds }))).toBe(message)
      },
    )

    it('trims surrounding spaces before checking', () => {
      expect(validateDemoField('beds', makeValues({ beds: '  120  ' }))).toBeUndefined()
    })
  })

  describe('message', () => {
    it('never errors: an empty message is optional', () => {
      expect(validateDemoField('message', makeValues({ message: '' }))).toBeUndefined()
    })

    it('never errors: there is no length rule, so a 5,000-character message is fine', () => {
      expect(validateDemoField('message', makeValues({ message: 'a'.repeat(5000) }))).toBeUndefined()
    })
  })
})

describe('validateDemoForm', () => {
  it('returns {} for a completely valid form', () => {
    expect(validateDemoForm(makeValues())).toEqual({})
  })

  it('returns only the invalid fields', () => {
    const errors = validateDemoForm(
      makeValues({
        fullName: 'A',
        email: 'ana@gmail.com',
        hospital: '',
        role: '',
        beds: '0',
        message: '',
      }),
    )
    expect(errors).toEqual({
      fullName: 'Enter your full name (at least 2 characters).',
      email: "Use your work email. Personal addresses like gmail.com aren't accepted.",
      hospital: "Enter your hospital's name (at least 2 characters).",
      role: 'Choose your role.',
      beds: 'Enter the number of beds as a whole number from 1 to 5,000.',
    })
  })

  it('omits a valid field from the errors even when its neighbours are invalid', () => {
    const errors = validateDemoForm(
      makeValues({
        beds: 'abc',
      }),
    )
    expect(errors).toEqual({ beds: 'Enter the number of beds as a whole number from 1 to 5,000.' })
  })

  it('flags every field of an empty form except message', () => {
    const errors = validateDemoForm(EMPTY_DEMO_FORM)
    expect(errors).toEqual({
      fullName: 'Enter your full name (at least 2 characters).',
      email: 'Enter your work email.',
      hospital: "Enter your hospital's name (at least 2 characters).",
      role: 'Choose your role.',
      beds: 'Enter the number of beds as a whole number from 1 to 5,000.',
    })
    expect(errors.message).toBeUndefined()
  })

  it('agrees with validateDemoField for every field of a valid form', () => {
    const values = makeValues()
    for (const field of ['fullName', 'email', 'hospital', 'role', 'beds', 'message'] as const) {
      expect(validateDemoField(field, values)).toBeUndefined()
    }
    expect(validateDemoForm(values)).toEqual({})
  })
})

describe('firstName', () => {
  it('returns the first word of a trimmed name', () => {
    expect(firstName('  Ana María López ')).toBe('Ana')
  })

  it('handles a single-word name and extra whitespace between words', () => {
    expect(firstName('Ana')).toBe('Ana')
    expect(firstName('  Ana   María  ')).toBe('Ana')
  })

  it('returns an empty string for a blank name', () => {
    expect(firstName('   ')).toBe('')
  })
})

describe('confirmationMessage', () => {
  it('uses the first name in the exact team wording', () => {
    expect(confirmationMessage('Ana María López')).toBe(
      "Thanks, Ana! We'll reach out within one business day.",
    )
  })

  it('trims the name before taking the first word', () => {
    expect(confirmationMessage('  María García ')).toBe(
      "Thanks, María! We'll reach out within one business day.",
    )
  })
})
