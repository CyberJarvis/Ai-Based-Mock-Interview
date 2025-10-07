"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const DSAInterviewInterface = dynamic(() => import('@/components/DSAInterviewInterface'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading DSA Interview...</div>
})

export default function DSAInterviewPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div>
      <DSAInterviewInterface 
        interviewId="standalone-dsa"
        onComplete={handleComplete}
      />
    </div>
  )
}