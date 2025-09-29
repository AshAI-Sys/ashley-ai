'use client'

import DashboardLayout from '@/components/dashboard-layout'
import RoleSpecificDashboard from '@/components/role-dashboards/RoleSpecificDashboard'

export default function DashboardPage() {

  return (
    <DashboardLayout>
      <RoleSpecificDashboard />
    </DashboardLayout>
  )
}