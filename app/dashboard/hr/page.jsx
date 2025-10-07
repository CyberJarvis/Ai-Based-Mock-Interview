"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const HRInterviewInterface = dynamic(() => import('@/components/HRInterviewInterface'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading HR Interview...</div>
})

export default function HRInterviewPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div>
      <HRInterviewInterface 
        interviewId="standalone-hr"
        onComplete={handleComplete}
      />
    </div>
  )
}