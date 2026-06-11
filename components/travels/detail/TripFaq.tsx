'use client'

import { useState } from 'react'

type FaqItem = { question: string; answer: string }

export default function TripFaq({ faq }: { faq: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faq.length) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 bg-(--color-ice-light)">
      <div className="max-w-4xl mx-auto">
        <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">FAQ</p>
        <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-10">Ofte stilte spørsmål</h2>
        <div className="space-y-2">
          {faq.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-(--color-border) rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-(--color-ice-light) transition-colors"
              >
                <span className="font-medium text-(--color-text) text-sm sm:text-base pr-4">{item.question}</span>
                <span className={`shrink-0 w-6 h-6 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-muted) text-sm transition-transform ${openIndex === i ? 'rotate-45 bg-(--color-dark) border-(--color-dark) text-white' : ''}`}>+</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 border-t border-(--color-border)">
                  <p className="text-(--color-muted) text-sm leading-relaxed pt-4">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
