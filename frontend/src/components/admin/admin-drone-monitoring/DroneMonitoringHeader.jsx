import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import SafeIcon from '@/components/common/SafeIcon'

export default function DroneMonitoringHeader({
  totalDrones,
  activeDrones,
  maintenanceDrones,
  standbyDrones
}) {
  const stats = [
    {
      label: 'Total Drones',
      value: totalDrones,
      icon: 'Plane',
      color: 'bg-blue-600/10 text-blue-600'
    },
    {
      label: 'Active',
      value: activeDrones,
      icon: 'CheckCircle',
      color: 'bg-emerald-600/10 text-emerald-600'
    },
    {
      label: 'Maintenance',
      value: maintenanceDrones,
      icon: 'Wrench',
      color: 'bg-yellow-600/10 text-yellow-600'
    },
    {
      label: 'Standby',
      value: standbyDrones,
      icon: 'Shield',
      color: 'bg-amber-600/10 text-amber-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border hover:border-red-400 hover:shadow-[0_0_10px_rgba(255,0,0,0.35)] transition-all duration-300"
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <SafeIcon name={stat.icon} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}