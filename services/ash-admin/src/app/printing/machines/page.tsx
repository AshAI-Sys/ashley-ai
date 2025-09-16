'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Settings, Activity, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, Wrench, Zap, Package2, Palette, Shirt } from 'lucide-react'
import Link from 'next/link'

interface Machine {
  id: string
  name: string
  workcenter: 'PRINTING' | 'HEAT_PRESS' | 'EMB' | 'DRYER'
  is_active: boolean
  specifications: any
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  current_run: {
    id: string
    method: string
    status: string
    order: {
      order_number: string
      brand: { name: string; code: string }
    }
  } | null
  utilization: number
  maintenance_due: boolean
  created_at: string
  updated_at: string
}

const workcenters = {
  PRINTING: { name: 'Screen Printing', icon: Palette, color: 'purple' },
  HEAT_PRESS: { name: 'Heat Press', icon: Zap, color: 'orange' },
  EMB: { name: 'Embroidery', icon: Shirt, color: 'green' },
  DRYER: { name: 'Dryer/Curing', icon: Package2, color: 'blue' }
}

const statusColors = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  BUSY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OFFLINE: 'bg-red-100 text-red-800 border-red-200'
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    workcenter: '',
    status: ''
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  
  const [newMachine, setNewMachine] = useState({
    name: '',
    workcenter: '',
    specifications: {
      bed_size: '',
      max_temp: '',
      lanes: '',
      capacity: '',
      power: ''
    },
    is_active: true
  })

  useEffect(() => {
    fetchMachines()
  }, [filter])

  const fetchMachines = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.workcenter) params.append('workcenter', filter.workcenter)
      if (filter.status === 'active') params.append('active_only', 'true')

      const response = await fetch(`/api/printing/machines?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setMachines(data.data || [])
      } else {
        // Mock data for demo
        setMachines([
          {
            id: '1',
            name: 'M&R Sportsman EX',
            workcenter: 'PRINTING',
            is_active: true,
            specifications: {
              bed_size: '16" x 18"',
              stations: '6',
              colors: '4'
            },
            status: 'BUSY',
            current_run: {
              id: 'run1',
              method: 'SILKSCREEN',
              status: 'IN_PROGRESS',
              order: {
                order_number: 'TCAS-2025-000001',
                brand: { name: 'Trendy Casual', code: 'TCAS' }
              }
            },
            utilization: 85,
            maintenance_due: false,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Epson SureColor F570',
            workcenter: 'PRINTING',
            is_active: true,
            specifications: {
              print_width: '24"',
              resolution: '1440 dpi'
            },
            status: 'AVAILABLE',
            current_run: null,
            utilization: 65,
            maintenance_due: false,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: 'Heat Press Pro 15x15',
            workcenter: 'HEAT_PRESS',
            is_active: true,
            specifications: {
              platen_size: '15" x 15"',
              max_temp: '230°C',
              max_pressure: '60 PSI'
            },
            status: 'AVAILABLE',
            current_run: null,
            utilization: 45,
            maintenance_due: true,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          },
          {
            id: '4',
            name: 'Tajima 16-Head',
            workcenter: 'EMB',
            is_active: true,
            specifications: {
              heads: '16',
              max_speed: '1000 SPM',
              max_area: '360mm x 500mm'
            },
            status: 'AVAILABLE',
            current_run: null,
            utilization: 75,
            maintenance_due: false,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching machines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMachine = async () => {
    try {
      const response = await fetch('/api/printing/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMachine)
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewMachine({
          name: '',
          workcenter: '',
          specifications: {
            bed_size: '',
            max_temp: '',
            lanes: '',
            capacity: '',
            power: ''
          },
          is_active: true
        })
        fetchMachines()
      }
    } catch (error) {
      console.error('Error adding machine:', error)
    }
  }

  const handleToggleActive = async (machineId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/printing/machines/${machineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (response.ok) {
        fetchMachines()
      }
    } catch (error) {
      console.error('Error toggling machine active status:', error)
    }
  }

  const getFilteredMachines = () => {
    return machines.filter(machine => {
      if (filter.workcenter && machine.workcenter !== filter.workcenter) return false
      if (filter.status === 'active' && !machine.is_active) return false
      if (filter.status === 'busy' && machine.status !== 'BUSY') return false
      if (filter.status === 'available' && machine.status !== 'AVAILABLE') return false
      return true
    })
  }

  const getMachineStats = () => {
    const total = machines.length
    const active = machines.filter(m => m.is_active).length
    const busy = machines.filter(m => m.status === 'BUSY').length
    const maintenanceDue = machines.filter(m => m.maintenance_due).length
    
    return { total, active, busy, maintenanceDue }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="w-8 h-8 mx-auto mb-4 animate-pulse" />
            <p>Loading machines...</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = getMachineStats()
  const filteredMachines = getFilteredMachines()

  return (
    <div className="container mx-auto py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/printing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Printing
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Machine Management</h1>
            <p className="text-muted-foreground">Monitor and manage printing equipment</p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>
                Configure a new printing machine
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Machine Name</Label>
                  <Input
                    value={newMachine.name}
                    onChange={(e) => setNewMachine({
                      ...newMachine,
                      name: e.target.value
                    })}
                    placeholder="e.g., M&R Sportsman EX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Workcenter</Label>
                  <Select
                    value={newMachine.workcenter}
                    onValueChange={(value) => setNewMachine({
                      ...newMachine,
                      workcenter: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select workcenter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRINTING">Screen Printing</SelectItem>
                      <SelectItem value="HEAT_PRESS">Heat Press</SelectItem>
                      <SelectItem value="EMB">Embroidery</SelectItem>
                      <SelectItem value="DRYER">Dryer/Curing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specifications</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Bed Size (e.g., 16x18 inches)"
                    value={newMachine.specifications.bed_size}
                    onChange={(e) => setNewMachine({
                      ...newMachine,
                      specifications: {
                        ...newMachine.specifications,
                        bed_size: e.target.value
                      }
                    })}
                  />
                  <Input
                    placeholder="Max Temperature (°C)"
                    value={newMachine.specifications.max_temp}
                    onChange={(e) => setNewMachine({
                      ...newMachine,
                      specifications: {
                        ...newMachine.specifications,
                        max_temp: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Lanes/Stations"
                    value={newMachine.specifications.lanes}
                    onChange={(e) => setNewMachine({
                      ...newMachine,
                      specifications: {
                        ...newMachine.specifications,
                        lanes: e.target.value
                      }
                    })}
                  />
                  <Input
                    placeholder="Hourly Capacity"
                    value={newMachine.specifications.capacity}
                    onChange={(e) => setNewMachine({
                      ...newMachine,
                      specifications: {
                        ...newMachine.specifications,
                        capacity: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMachine}>
                  Add Machine
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Busy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.busy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.maintenanceDue}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Machine Overview</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Workcenter</Label>
                  <Select value={filter.workcenter} onValueChange={(value) => setFilter({...filter, workcenter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All workcenters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All workcenters</SelectItem>
                      <SelectItem value="PRINTING">Screen Printing</SelectItem>
                      <SelectItem value="HEAT_PRESS">Heat Press</SelectItem>
                      <SelectItem value="EMB">Embroidery</SelectItem>
                      <SelectItem value="DRYER">Dryer/Curing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="active">Active only</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setFilter({workcenter: '', status: ''})}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Machines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => {
              const workcenterInfo = workcenters[machine.workcenter]
              const WorkcenterIcon = workcenterInfo.icon

              return (
                <Card key={machine.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${workcenterInfo.color}-100`}>
                          <WorkcenterIcon className={`w-5 h-5 text-${workcenterInfo.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{machine.name}</CardTitle>
                          <CardDescription>{workcenterInfo.name}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={statusColors[machine.status]}>
                          {machine.status}
                        </Badge>
                        {machine.maintenance_due && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Maintenance Due
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Current Job */}
                    {machine.current_run ? (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Current Job</span>
                          <Badge variant="outline">{machine.current_run.method}</Badge>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{machine.current_run.order.order_number}</p>
                          <p className="text-muted-foreground">{machine.current_run.order.brand.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                        <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <span className="text-sm text-green-800">Available for production</span>
                      </div>
                    )}

                    {/* Utilization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Today's Utilization</span>
                        <span>{machine.utilization}%</span>
                      </div>
                      <Progress value={machine.utilization} />
                    </div>

                    {/* Specifications */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Specifications</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {Object.entries(machine.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span>{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleActive(machine.id, machine.is_active)}
                        className={machine.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                      >
                        {machine.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Wrench className="w-3 h-3 mr-1" />
                        Maintain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredMachines.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No machines found matching your filters</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(workcenters).map(([key, workcenter]) => {
              const workcenterMachines = machines.filter(m => m.workcenter === key)
              const avgUtilization = workcenterMachines.length > 0 
                ? workcenterMachines.reduce((sum, m) => sum + m.utilization, 0) / workcenterMachines.length 
                : 0

              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <workcenter.icon className={`w-5 h-5 text-${workcenter.color}-600`} />
                      <CardTitle>{workcenter.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Utilization</span>
                        <span className="text-lg font-bold">{Math.round(avgUtilization)}%</span>
                      </div>
                      <Progress value={avgUtilization} />
                      
                      <div className="space-y-2">
                        {workcenterMachines.map((machine) => (
                          <div key={machine.id} className="flex justify-between items-center text-sm">
                            <span>{machine.name}</span>
                            <div className="flex items-center gap-2">
                              <span>{machine.utilization}%</span>
                              <div className="w-16">
                                <Progress value={machine.utilization} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Machines Requiring Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                {machines.filter(m => m.maintenance_due).length > 0 ? (
                  <div className="space-y-3">
                    {machines.filter(m => m.maintenance_due).map((machine) => (
                      <div key={machine.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{machine.name}</p>
                          <p className="text-sm text-muted-foreground">{workcenters[machine.workcenter].name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Due</Badge>
                          <Button size="sm">
                            <Wrench className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">All machines are up to date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Maintenance scheduling coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}