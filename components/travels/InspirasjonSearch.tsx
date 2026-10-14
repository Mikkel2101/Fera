'use client'

import { useEffect, useRef, useState } from 'react'

function IconSearch() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

export default function InspirasjonSearch({
  activeCategory,
  defaultValue,
}: {
  activeCategory: string | null
  defaultValue?: string
}) {
  const [expanded, setExpanded] = useState(Boolean(defaultValue))
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  function handleIconClick() {
    if (!expanded) {
      setExpanded(true)
      return
    }
    formRef.current?.requestSubmit()
  }

  return (
    <>
      {/* Desktop/nettbrett — alltid synlig felt */}
      <form action="/travels/inspirasjon" method="get" role="search" className="hidden sm:flex w-full max-w-sm items-center gap-2 sm:w-auto">
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <label htmlFor="article-search-desktop" className="sr-only">Søk i artikler</label>
        <input
          id="article-search-desktop"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Søk i artikler"
          className="min-w-0 flex-1 border-b border-(--color-border) bg-transparent px-2 py-2 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:border-(--color-cta) focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Søk"
          className="grid size-9 shrink-0 place-items-center rounded-md bg-(--color-sand-light) text-(--color-dark) transition-colors hover:bg-(--color-sand-warm)"
        >
          <IconSearch />
        </button>
      </form>

      {/* Mobil — kollapset ikon som glir ut over knappene og dekker dem, i stedet for å skyve dem ned */}
      <form
        ref={formRef}
        action="/travels/inspirasjon"
        method="get"
        role="search"
        className={`sm:hidden absolute right-0 top-0 z-10 transition-[width] duration-300 ease-out ${expanded ? 'w-full' : 'w-9'}`}
      >
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <label htmlFor="article-search-mobile" className="sr-only">Søk i artikler</label>
        <div className="flex h-9 items-center rounded-md bg-(--color-sand-light)">
          <input
            ref={inputRef}
            id="article-search-mobile"
            name="q"
            type="search"
            defaultValue={defaultValue}
            placeholder="Søk i artikler"
            onBlur={() => {
              if (!inputRef.current?.value) setExpanded(false)
            }}
            className={`min-w-0 flex-1 bg-transparent py-2 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:outline-none transition-opacity duration-200 ${
              expanded ? 'px-2 opacity-100' : 'w-0 px-0 opacity-0'
            }`}
          />
          <button
            type="button"
            onClick={handleIconClick}
            aria-label="Søk"
            className="grid size-9 shrink-0 place-items-center text-(--color-dark)"
          >
            <IconSearch />
          </button>
        </div>
      </form>
    </>
  )
}
