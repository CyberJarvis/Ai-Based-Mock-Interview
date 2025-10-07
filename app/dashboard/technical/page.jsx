"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const TechnicalInterviewInterface = dynamic(() => import('@/components/TechnicalInterviewInterface'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading Technical Interview...</div>
})

export default function TechnicalInterviewPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div>
      <TechnicalInterviewInterface 
        interviewId="standalone-technical"
        onComplete={handleComplete}
      />
    </div>
  )
}