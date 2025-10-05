import React, { useState, useEffect } from 'react'
import { GuestService } from '../../services/business-logic/GuestService'
import { QRCodeService } from '../../services/business-logic/QRCodeService'
import { ExcelExportService } from '../../services/business-logic/ExcelExportService'
import type { Guest, GroupWithGuests } from '../../ui/models/Guest'
import { EditGuestModal } from './EditGuestModal'
import { AddGuestWizard } from './AddGuestWizard'
import { GroupAddressDropdown } from './GroupAddressDropdown'
import { Edit, Trash2, Search, Filter, Users, UserCheck, UserX, Clock, Home, ChevronDown, ChevronRight, ChevronLeft, Download, QrCode, RotateCcw, CheckCircle, Plus, FileSpreadsheet } from 'lucide-react'

export function GuestOverviewTable() {
  const [groups, setGroups] = useState<GroupWithGuests[]>([])
  const [individualGuests, setIndividualGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all')
  const [ageFilter, setAgeFilter] = useState<'all' | 'adult' | 'child'>('all')
  const [inviterFilter, setInviterFilter] = useState<string>('all')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [openQRDropdowns, setOpenQRDropdowns] = useState<Set<string>>(new Set())
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [showAddWizard, setShowAddWizard] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const guestService = new GuestService()
  const qrCodeService = new QRCodeService()
  const excelExportService = new ExcelExportService()

  useEffect(() => {
    loadGuestsGroupedData()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.qr-dropdown')) {
        setOpenQRDropdowns(new Set())
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, ageFilter, inviterFilter])

  const loadGuestsGroupedData = async () => {
    try {
      setIsLoading(true)
      const guestsData = await guestService.getGuestsGroupedByInvitation()
      
      setGroups(guestsData.groups)
      setIndividualGuests(guestsData.individualGuests)
      
      // Expand all groups by default
      setExpandedGroups(new Set(guestsData.groups.map(g => g.id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guests')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const toggleQRDropdown = (groupId: string) => {
    setOpenQRDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const handleGenerateQRCode = async (groupId: string, groupName: string) => {
    try {
      const qrCodeDataURL = await qrCodeService.generateAndSaveQRCode(groupId)
      qrCodeService.downloadQRCode(qrCodeDataURL, groupName)
      await loadGuestsGroupedData() // Refresh to show updated QR status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code')
    }
  }

  const handleRegenerateQRCode = async (groupId: string, groupName: string) => {
    try {
      const qrCodeDataURL = await qrCodeService.regenerateQRCode(groupId)
      qrCodeService.downloadQRCode(qrCodeDataURL, groupName)
      await loadGuestsGroupedData() // Refresh to show updated QR status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate QR code')
    }
  }

  const handleDownloadExistingQRCode = async (groupId: string, groupName: string) => {
    try {
      const qrCodeDataURL = await qrCodeService.generateQRCodeDataURL(groupId)
      qrCodeService.downloadQRCode(qrCodeDataURL, groupName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download QR code')
    }
  }

  const filterGuests = (guests: Guest[]) => {
    return guests.filter(guest => {
      const matchesSearch = 
        guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.groupName && guest.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || guest.rsvpStatus === statusFilter
      const matchesAge = ageFilter === 'all' || guest.ageCategory === ageFilter
      const matchesInviter = inviterFilter === 'all' || guest.invitedByName === inviterFilter
      
      return matchesSearch && matchesStatus && matchesAge && matchesInviter
    })
  }

  const getAllGuests = () => {
    const allGuests = [...individualGuests]
    groups.forEach(group => {
      allGuests.push(...group.guests)
    })
    return allGuests
  }

  const getAvailableAgeCategories = () => {
    const allGuests = getAllGuests()
    const hasAdults = allGuests.some(guest => guest.ageCategory === 'adult')
    const hasChildren = allGuests.some(guest => guest.ageCategory === 'child')
    return { hasAdults, hasChildren }
  }

  const getAvailableInviters = () => {
    const allGuests = getAllGuests()
    const inviterNames = new Set(
      allGuests
        .map(guest => guest.invitedByName)
        .filter(name => name && name.trim() !== '')
    )
    return Array.from(inviterNames).sort()
  }

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return
    
    try {
      await guestService.deleteGuest(guestId)
      await loadGuestsGroupedData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guest')
    }
  }

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest)
  }

  const handleSaveGuest = async (updatedGuest: Guest) => {
    try {
      await guestService.updateGuest(updatedGuest.id, updatedGuest)
      await loadGuestsGroupedData()
      setEditingGuest(null)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save guest')
    }
  }

  const handleExportGroups = () => {
    try {
      const exportGroups = statusFilter === 'all' && ageFilter === 'all' && inviterFilter === 'all' && searchTerm === ''
        ? groups
        : groups.map(group => ({
            ...group,
            guests: filterGuests(group.guests)
          })).filter(group => group.guests.length > 0)
      
      excelExportService.exportGroupsToExcel(exportGroups, 'wedding-guest-groups')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export groups')
    }
  }

  const getStatusBadge = (status: Guest['rsvpStatus']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1'
    
    switch (status) {
      case 'confirmed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`}>
            <UserCheck className="h-3 w-3" />
            Confirmed
          </span>
        )
      case 'declined':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`}>
            <UserX className="h-3 w-3" />
            Declined
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`}>
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  const getAgeBadge = (ageCategory: Guest['ageCategory']) => {
    return ageCategory === 'adult' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
        Adult
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
        Child
      </span>
    )
  }

  const renderGuestRow = (guest: Guest, isInGroup = false) => (
    <tr key={guest.id} className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-all duration-300 ${isInGroup ? 'bg-gray-25/50 dark:bg-gray-900/30' : ''}`}>
      <td className={`px-8 py-6 whitespace-nowrap ${isInGroup ? 'pl-16' : ''}`}>
        <div className="flex items-center gap-3">
          {isInGroup && (
            <div className="w-3 h-3 bg-rose-400 dark:bg-rose-500 rounded-full shadow-sm"></div>
          )}
          <div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {guest.firstName} {guest.lastName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="space-y-1">
          {guest.email && <div className="text-sm font-medium text-gray-900 dark:text-white">{guest.email}</div>}
          {guest.phone && <div className="text-sm text-gray-500 dark:text-gray-400">{guest.phone}</div>}
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {guest.groupName || 'Individual'}
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        {getStatusBadge(guest.rsvpStatus)}
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        {getAgeBadge(guest.ageCategory)}
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {guest.invitedByName || 'Unknown'}
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleEditGuest(guest)}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            title="Edit Guest"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteGuest(guest.id)}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            title="Delete Guest"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  const allGuests = getAllGuests()
  const filteredGroups = groups.map(group => ({
    ...group,
    guests: filterGuests(group.guests)
  })).filter(group => group.guests.length > 0 || searchTerm === '')
  
  const filteredIndividualGuests = filterGuests(individualGuests)

  // Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="w-full space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${filtersExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getAllGuests().length} total guests
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={handleExportGroups}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium">Export Excel</span>
          </button>
          
          <button 
            onClick={() => setShowAddWizard(true)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {filtersExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filter Guests</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Refine your guest list view</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                RSVP Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {/* Age Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Age Category
              </label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Ages</option>
                {getAvailableAgeCategories().hasAdults && (
                  <option value="adult">Adults</option>
                )}
                {getAvailableAgeCategories().hasChildren && (
                  <option value="child">Children</option>
                )}
              </select>
            </div>

            {/* Inviter Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Invited By
              </label>
              <select
                value={inviterFilter}
                onChange={(e) => setInviterFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Inviters</option>
                {getAvailableInviters().map(inviterName => (
                  <option key={inviterName} value={inviterName}>
                    {inviterName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {allGuests.length}
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Total Guests
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-2xl shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {allGuests.filter(g => g.rsvpStatus === 'confirmed').length}
              </div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                Confirmed
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500 rounded-2xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {allGuests.filter(g => g.rsvpStatus === 'pending').length}
              </div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Pending
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500 rounded-2xl shadow-lg">
              <UserX className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {allGuests.filter(g => g.rsvpStatus === 'declined').length}
              </div>
              <div className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Declined
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Grouped Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm">
              <tr>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Invited By
                </th>
                <th className="px-8 py-6 text-right text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
              {/* Group Sections */}
              {paginatedGroups.map((group) => (
                <React.Fragment key={group.id}>
                  {/* Group Header */}
                  <tr className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 border-t-4 border-rose-300 dark:border-rose-600 shadow-lg">
                    <td colSpan={7} className="px-8 py-6">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleGroupExpanded(group.id)}
                          className="flex items-center gap-4 text-left hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-2xl p-4 -m-4 transition-all duration-300 group"
                        >
                          {expandedGroups.has(group.id) ? (
                            <ChevronDown className="h-6 w-6 text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors" />
                          ) : (
                            <ChevronRight className="h-6 w-6 text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors" />
                          )}
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-200 dark:bg-rose-700/50 rounded-2xl shadow-md">
                              <Home className="h-6 w-6 text-rose-700 dark:text-rose-300" />
                            </div>
                            <div>
                              <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {group.name}
                              </span>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {group.guestCount} guest{group.guestCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-4">
                          {/* QR Code Dropdown Menu */}
                          <div className="relative qr-dropdown">
                            <button
                              onClick={() => toggleQRDropdown(group.id)}
                              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors shadow-sm ${
                                group.qrCodeGenerated
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                              }`}
                              title={group.qrCodeGenerated ? "QR Code Options" : "Generate QR Code"}
                            >
                              {group.qrCodeGenerated ? (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">QR Ready</span>
                                </>
                              ) : (
                                <>
                                  <QrCode className="h-4 w-4" />
                                  <span className="text-sm font-medium">QR Code</span>
                                </>
                              )}
                              <ChevronDown className={`h-4 w-4 transition-transform ${openQRDropdowns.has(group.id) ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {openQRDropdowns.has(group.id) && (
                              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                <div className="py-1">
                                  {group.qrCodeGenerated ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleDownloadExistingQRCode(group.id, group.name)
                                          toggleQRDropdown(group.id)
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <Download className="h-4 w-4 text-blue-500" />
                                        Download QR Code
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleRegenerateQRCode(group.id, group.name)
                                          toggleQRDropdown(group.id)
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <RotateCcw className="h-4 w-4 text-amber-500" />
                                        Regenerate QR Code
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleGenerateQRCode(group.id, group.name)
                                        toggleQRDropdown(group.id)
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <QrCode className="h-4 w-4 text-rose-500" />
                                      Generate QR Code
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Address Management */}
                          <GroupAddressDropdown
                            groupId={group.id}
                            groupName={group.name}
                            currentAddress={group.address}
                            onAddressUpdated={loadGuestsGroupedData}
                          />

                          {/* Group Stats */}
                          <div className="flex items-center gap-2">
                            {group.confirmedCount > 0 && (
                              <span className="text-xs px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium border border-green-200 dark:border-green-700">
                                ✓ {group.confirmedCount} confirmed
                              </span>
                            )}
                            {group.pendingCount > 0 && (
                              <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full font-medium border border-yellow-200 dark:border-yellow-700">
                                ⏳ {group.pendingCount} pending
                              </span>
                            )}
                            {group.declinedCount > 0 && (
                              <span className="text-xs px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium border border-red-200 dark:border-red-700">
                                ✗ {group.declinedCount} declined
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Group Guests */}
                  {expandedGroups.has(group.id) && group.guests.map(guest => renderGuestRow(guest, true))}
                </React.Fragment>
              ))}

              {/* Individual Guests Section - show only on first page or if no groups */}
              {(currentPage === 1 || paginatedGroups.length === 0) && filteredIndividualGuests.length > 0 && (
                <>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-t-4 border-blue-300 dark:border-blue-600 shadow-lg">
                    <td colSpan={7} className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-200 dark:bg-blue-700/50 rounded-2xl shadow-md">
                          <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Individual Guests
                          </span>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {filteredIndividualGuests.length} guest{filteredIndividualGuests.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {filteredIndividualGuests.map(guest => renderGuestRow(guest, false))}
                </>
              )}
            </tbody>
          </table>
          
          {paginatedGroups.length === 0 && filteredIndividualGuests.length === 0 && (
            <tr>
              <td colSpan={7} className="px-8 py-16">
                <div className="text-center">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl w-fit mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">
                    {allGuests.length === 0 ? 'No guests added yet' : 'No guests match the current filters'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {allGuests.length === 0 ? 'Add your first guest to get started' : 'Try adjusting your filter settings'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 px-8 py-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredGroups.length)} of {filteredGroups.length} groups
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrentPage = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isCurrentPage
                      ? 'bg-rose-500 text-white'
                      : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {editingGuest && (
        <EditGuestModal
          guest={editingGuest}
          isOpen={!!editingGuest}
          onClose={() => setEditingGuest(null)}
          onSave={handleSaveGuest}
        />
      )}

      {/* Add Guest Wizard */}
      <AddGuestWizard
        isOpen={showAddWizard}
        onClose={() => setShowAddWizard(false)}
        onSuccess={() => {
          loadGuestsGroupedData()
          setShowAddWizard(false)
        }}
      />
    </div>
  )
}