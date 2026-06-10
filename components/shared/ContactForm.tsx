'use client'

import { useState, FormEvent } from 'react'

interface Field {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  fullWidth?: boolean
}

interface Props {
  type: string
  fields: Field[]
  messageLabel?: string
  messagePlaceholder?: string
  submitLabel?: string
  successMessage?: string
}

export default function ContactForm({
  type,
  fields,
  messageLabel = 'Melding',
  messagePlaceholder = 'Fortell oss om ønskene dine…',
  submitLabel = 'Send forespørsel →',
  successMessage = 'Takk! Vi tar kontakt innen 24 timer.',
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [values, setValues] = useState<Record<string, string>>({})

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...values }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-(--color-success)/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-(--color-success)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold text-lg mb-2">{successMessage}</p>
        <p className="text-white/60 text-sm">Vi svarer alltid innen én arbeidsdag.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
            <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">
              {field.label} {field.required && '*'}
            </label>
            <input
              type={field.type ?? 'text'}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] ?? ''}
              onChange={(e) => set(field.name, e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">{messageLabel}</label>
        <textarea
          rows={4}
          name="melding"
          placeholder={messagePlaceholder}
          value={values.melding ?? ''}
          onChange={(e) => set('melding', e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50 resize-none transition-colors"
        />
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm">Noe gikk galt. Prøv igjen eller send e-post til post@ferabrand.com</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-white text-(--color-dark) font-semibold py-3.5 rounded-full hover:bg-(--color-sand) transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Sender…
          </>
        ) : submitLabel}
      </button>
    </form>
  )
}
