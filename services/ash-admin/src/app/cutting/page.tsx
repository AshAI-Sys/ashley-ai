'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'

export default function CuttingPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1>Cutting Operations</h1>
      </div>
    </DashboardLayout>
  )
}