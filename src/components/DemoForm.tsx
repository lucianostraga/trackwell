import { CircleCheck } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  DEMO_ROLES,
  EMPTY_DEMO_FORM,
  confirmationMessage,
  validateDemoField,
  validateDemoForm,
  type DemoField,
  type DemoFormErrors,
  type DemoFormValues,
} from '../lib/demo-form'
import { cn } from './ui/cn'

const ORDER: DemoField[] = ['fullName', 'email', 'hospital', 'role', 'beds', 'message']

const CONTROL =
  'block w-full rounded-xl bg-surface px-3.5 text-[15px] text-ink-900 shadow-card ring-1 outline-none placeholder:text-ink-400 transition'

interface FieldProps {
  field: DemoField
  label: string
  optional?: boolean
  error?: string
  className?: string
  children: (props: Record<string, unknown>) => ReactNode
}

function Field({ field, label, optional, error, className, children }: FieldProps) {
  const id = `demo-${field}`
  const errorId = `${id}-error`
  const control = children({
    id,
    name: field,
    'data-testid': id,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    className: cn(CONTROL, error ? 'ring-2 ring-bad-500' : 'ring-ink-150 focus:ring-2 focus:ring-brand-500'),
  })
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {optional && <span className="font-normal text-ink-500"> (optional)</span>}
      </label>
      {control}
      <p
        id={errorId}
        data-testid={error ? `${id}-error` : undefined}
        className={cn('text-sm font-medium text-bad-700', error ? 'pt-1' : 'hidden')}
      >
        {error}
      </p>
    </div>
  )
}

/** Book a demo form: validates on blur and on submit, then shows a confirmation (no backend). */
export function DemoForm() {
  const [values, setValues] = useState<DemoFormValues>(EMPTY_DEMO_FORM)
  const [errors, setErrors] = useState<DemoFormErrors>({})
  const [done, setDone] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)

  // The submit button disappears with the form: move focus to the confirmation so it is read out.
  useEffect(() => {
    if (done) confirmationRef.current?.focus()
  }, [done])

  const update = (field: DemoField, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validateDemoField(field, next) }))
  }
  const blur = (field: DemoField) =>
    setErrors((e) => ({ ...e, [field]: validateDemoField(field, values) }))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const all = validateDemoForm(values)
    setErrors(all)
    const first = ORDER.find((f) => all[f])
    if (first) {
      document.getElementById(`demo-${first}`)?.focus()
      return
    }
    setDone(confirmationMessage(values.fullName))
  }

  if (done) {
    return (
      <div ref={confirmationRef} tabIndex={-1} role="status" data-testid="demo-confirmation" className="outline-none flex min-h-[28rem] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 ring-inset">
          <CircleCheck aria-hidden="true" className="size-7" />
        </span>
        <p className="mt-6 max-w-sm text-xl font-semibold tracking-[-0.02em] text-ink-900">{done}</p>
      </div>
    )
  }

  const bind = (field: DemoField) => ({
    value: values[field],
    onChange: (e: { target: { value: string } }) => update(field, e.target.value),
    onBlur: () => blur(field),
  })

  return (
    <form noValidate onSubmit={submit} data-testid="demo-form" className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
      <Field field="fullName" label="Full name" error={errors.fullName}>
        {(p) => <input {...p} {...bind('fullName')} type="text" autoComplete="name" className={cn(p.className as string, 'h-11')} />}
      </Field>
      <Field field="email" label="Work email" error={errors.email}>
        {(p) => <input {...p} {...bind('email')} type="email" autoComplete="email" placeholder="name@hospital.org" className={cn(p.className as string, 'h-11')} />}
      </Field>
      <Field field="hospital" label="Hospital" error={errors.hospital}>
        {(p) => <input {...p} {...bind('hospital')} type="text" autoComplete="organization" className={cn(p.className as string, 'h-11')} />}
      </Field>
      <Field field="role" label="Your role" error={errors.role}>
        {(p) => (
          <select {...p} {...bind('role')} className={cn(p.className as string, 'h-11')}>
            <option value="">Select your role</option>
            {DEMO_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field field="beds" label="Number of beds" error={errors.beds} className="sm:col-span-2">
        {(p) => <input {...p} {...bind('beds')} type="text" inputMode="numeric" placeholder="e.g. 450" className={cn(p.className as string, 'h-11 sm:max-w-[calc(50%-0.5rem)]')} />}
      </Field>
      <Field field="message" label="Message" optional error={errors.message} className="sm:col-span-2">
        {(p) => <textarea {...p} {...bind('message')} rows={3} className={cn(p.className as string, 'resize-none py-2.5')} />}
      </Field>
      <div className="sm:col-span-2">
        <button
          type="submit"
          data-testid="demo-submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-semibold tracking-[-0.01em] text-white shadow-button transition-colors hover:bg-brand-700 active:bg-brand-800"
        >
          Request a demo
        </button>
      </div>
    </form>
  )
}
