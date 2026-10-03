'use client'

import { useState } from 'react'
import ProgressBar from './ProgressBar'
import Step1PersonInfo from './Step1PersonInfo'
import Step2RoomExtras from './Step2RoomExtras'
import Step3Confirm from './Step3Confirm'
import type { Step1Data, Step2Data } from '@/lib/booking/schema'

type Extra = { name: string; price_eur: number }

type TripProps = {
  id: string
  title: string
  extras: Extra[]
  deposit_eur: number
  price_double_eur: number
  price_single_eur: number
}

type Prefill = Pick<Step1Data, 'first_name' | 'last_name' | 'email'> & { phone: string }

export default function BookingShell({ trip, prefill }: { trip: TripProps; prefill: Prefill }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>(prefill)
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({
    room_type: 'Dobbel',
    selected_extras: [],
  })

  return (
    <div className="mt-8">
      <ProgressBar currentStep={step} />
      {step === 1 && (
        <Step1PersonInfo
          data={step1Data}
          lockedEmail={prefill.email}
          onNext={(d) => { setStep1Data(d); setStep(2) }}
        />
      )}
      {step === 2 && (
        <Step2RoomExtras
          trip={trip}
          data={step2Data}
          onBack={() => setStep(1)}
          onNext={(d) => { setStep2Data(d); setStep(3) }}
        />
      )}
      {step === 3 && (
        <Step3Confirm
          trip={trip}
          step1={step1Data as Step1Data}
          step2={step2Data as Step2Data}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  )
}
