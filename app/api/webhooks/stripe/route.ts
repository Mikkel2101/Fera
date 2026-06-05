import { NextRequest, NextResponse } from 'next/server'

// Implementeres i Travel + Shop fasene
export async function POST(request: NextRequest) {
  return NextResponse.json({ received: true })
}
