'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { Gauge, TrendingUp, TrendingDown } from 'lucide-react'

interface EfficiencyData {
  department: string
  efficiency: number
  target: number
  color: string
}

interface EfficiencyGaugeChartProps {
  data?: EfficiencyData[]
  title?: string
  description?: string
}

const defaultData: EfficiencyData[] = [
  { department: 'Cutting', efficiency: 87, target: 90, color: '#3B82F6' },
  { department: 'Printing', efficiency: 92, target: 90, color: '#10B981' },
  { department: 'Sewing', efficiency: 78, target: 85, color: '#F59E0B' },
  { department: 'Finishing', efficiency: 95, target: 90, color: '#8B5CF6' }
]

export default function EfficiencyGaugeChart({
  data = defaultData,
  title = 'Efficiency by Department',
  description = 'Real-time efficiency tracking across production stages'
}: EfficiencyGaugeChartProps) {
  // Transform data for radial bar chart
  const chartData = data.map((item) => ({
    name: item.department,
    efficiency: item.efficiency,
    fill: item.color,
    target: item.target
  }))

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center gap-2">
          <Gauge className="w-5 h-5 text-purple-500" />
          {title}
        </CardTitle>
        <CardDescription className="dark:text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="90%"
            barSize={18}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="efficiency"
              cornerRadius={10}
              label={{
                position: 'insideStart',
                fill: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                formatter: (value: number) => `${value}%`
              }}
            />
            <Legend
              iconSize={10}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Efficiency Details */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {data.map((item) => {
            const isAboveTarget = item.efficiency >= item.target
            const difference = Math.abs(item.efficiency - item.target)

            return (
              <div
                key={item.department}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.department}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Target: {item.target}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.efficiency}%
                  </p>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isAboveTarget
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isAboveTarget ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {isAboveTarget ? '+' : '-'}
                      {difference}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Overall Efficiency */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Overall Efficiency
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Average across all departments
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(data.reduce((sum, item) => sum + item.efficiency, 0) / data.length)}%
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                {data.filter(item => item.efficiency >= item.target).length}/{data.length} on target
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
