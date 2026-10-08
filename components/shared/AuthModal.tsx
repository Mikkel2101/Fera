'use client'

import { useEffect, useRef } from 'react'
import { LoginForm } from './LoginForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export function AuthModal({ isOpen, onClose, redirectTo = '/' }: AuthModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Escape lukker, Tab fanges inne i dialogen (fokus-trap), fokus settes på
  // første fokuserbare element ved åpning, og returneres til elementet som
  // åpnet modalen når den lukkes.
  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      )

    getFocusable()[0]?.focus()

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const nodes = getFocusable()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      previouslyFocused.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Logg inn på Fera"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-(--color-border) bg-white p-8 shadow-xl"
      >
        <p className="mb-6 text-center font-display text-2xl font-semibold text-(--color-text)">Logg inn på Fera</p>
        <LoginForm next={redirectTo} />
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-(--color-muted) hover:text-(--color-text)"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
