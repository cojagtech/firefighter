'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import SafeIcon from '@/components/common/SafeIcon'
import { MOCK_SOPS, MOCK_INCIDENT_CATEGORIES } from '@/data/SOPData'

export default function SOPManagementPage() {
  const [sops, setSops] = useState(MOCK_SOPS)
  const [filteredSops, setFilteredSops] = useState(MOCK_SOPS)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = sops

    if (searchTerm) {
      filtered = filtered.filter(
        sop =>
          sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sop.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sop => sop.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sop => sop.incidentCategory === categoryFilter)
    }

    setFilteredSops(filtered)
  }, [searchTerm, statusFilter, categoryFilter, sops])

  const getStatusColor = status => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-600 text-white'
      case 'Draft':
        return 'bg-amber-600 text-white'
      case 'Archived':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const handleDelete = id => {
    setSops(sops.filter(sop => sop.id !== id))
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!mounted) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-48 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOP Management</h1>
          <p className="text-muted-foreground">
            Create and manage Standard Operating Procedures
          </p>
        </div>

        <Button variant="outline" onClick={() => (window.location.href = './create-sop.html')} className="gap-2 active:scale-98">
          <SafeIcon name="Plus" size={18} />
          Create New SOP
        </Button>

      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by title or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-input"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Incident Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {MOCK_INCIDENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* SOP Table */}
      <Card>
        <CardHeader>
          <CardTitle>Standard Operating Procedures</CardTitle>
          <CardDescription>
            {filteredSops.length} SOP{filteredSops.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredSops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <SafeIcon name="FileText" size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No SOPs found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSops.map(sop => (
                    <TableRow key={sop.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{sop.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sop.incidentCategory}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sop.relatedStation}
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(sop.status)}>{sop.status}</Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(sop.lastUpdated)}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <SafeIcon name="MoreVertical" size={18} />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                (window.location.href = `./sop-details.html?id=${sop.id}`)
                              }
                            >
                              <SafeIcon name="Eye" size={16} className="mr-2" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                (window.location.href = `./edit-sop.html?id=${sop.id}`)
                              }
                            >
                              <SafeIcon name="Edit" size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(sop.id)}
                              className="text-destructive"
                            >
                              <SafeIcon name="Trash2" size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total SOPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sops.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active SOPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {sops.filter(s => s.status === 'Active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft SOPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {sops.filter(s => s.status === 'Draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
