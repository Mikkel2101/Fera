'use client'

const STEPS = [
  { n: 1, label: 'Opplysninger' },
  { n: 2, label: 'Rom & tilvalg' },
  { n: 3, label: 'Betaling' },
] as const

export default function ProgressBar({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map(({ n, label }, i) => (
        <div key={n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${n <= currentStep
                  ? 'bg-(--color-cta) text-white'
                  : 'bg-(--color-border) text-(--color-muted)'
                }`}
            >
              {n < currentStep ? '✓' : n}
            </div>
            <span
              className={`text-xs mt-1 whitespace-nowrap
                ${n === currentStep ? 'text-(--color-text) font-medium' : 'text-(--color-muted)'}`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-4
                ${n < currentStep ? 'bg-(--color-cta)' : 'bg-(--color-border)'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
