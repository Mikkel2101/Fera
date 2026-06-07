'use client'

import { useState } from 'react'

type FaqItem = { question: string; answer: string }

export default function TripFaq({ faq }: { faq: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faq.length) return null

  return (
    <section className="bg-(--color-surface) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-(--color-text) mb-6">FAQ</h2>
        <div className="flex flex-col">
          {faq.map((item, i) => (
            <div key={i} className="border-b border-(--color-border)">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left text-(--color-text) font-medium hover:text-(--color-gold) transition-colors"
              >
                <span>{item.question}</span>
                <span className="shrink-0 ml-4 text-(--color-muted)">
                  {openIndex === i ? '▴' : '▾'}
                </span>
              </button>
              {openIndex === i && (
                <p className="pb-4 text-(--color-muted) leading-relaxed">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
