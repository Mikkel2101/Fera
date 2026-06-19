'use client'

import { createContext, useContext } from 'react'

const DEFAULT_RATE = 11.80

const CurrencyContext = createContext<number>(DEFAULT_RATE)

export function CurrencyProvider({
  rate,
  children,
}: {
  rate: number
  children: React.ReactNode
}) {
  return <CurrencyContext.Provider value={rate}>{children}</CurrencyContext.Provider>
}

export function useNokRate(): number {
  return useContext(CurrencyContext)
}
