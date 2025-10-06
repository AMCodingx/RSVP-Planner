import React, { useState, useEffect, useRef } from 'react'
import { GuestService } from '../../services/business-logic/GuestService'
import { QRCodeService } from '../../services/business-logic/QRCodeService'
import { ExcelExportService } from '../../services/business-logic/ExcelExportService'
import { ExcelImportService } from '../../services/business-logic/ExcelImportService'
import type { Guest, GroupWithGuests } from '../../ui/models/Guest'
import type { ImportedGroup, ImportedGuest } from '../../services/business-logic/ExcelImportService'
import { EditGuestModal } from './EditGuestModal'
import { AddGuestWizard } from './AddGuestWizard'
import { GroupAddressDropdown } from './GroupAddressDropdown'
import { ImportReviewModal } from './ImportReviewModal'
import { Edit, Trash2, Search, Filter, Users, UserCheck, UserX, Clock, Home, ChevronDown, ChevronRight, ChevronLeft, Download, QrCode, RotateCcw, CheckCircle, Plus, FileSpreadsheet, Upload } from 'lucide-react'
import { useAuth } from '../../services/AuthContext'

export function GuestOverviewTable() {
  const { user } = useAuth()
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
  const [itemsPerPage] = useState(5)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [showImportReview, setShowImportReview] = useState(false)
  const [importData, setImportData] = useState<{ groups: ImportedGroup[], individualGuests: ImportedGuest[], errors: any[] } | null>(null)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const guestDropdownRef = useRef<HTMLDivElement>(null)

  const guestService = new GuestService()
  const qrCodeService = new QRCodeService()
  const excelExportService = new ExcelExportService()
  const excelImportService = new ExcelImportService()

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
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(target)) {
        setShowGuestDropdown(false)
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

  const handleDownloadTemplate = () => {
    try {
      excelImportService.generateTemplate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError('')
      const result = await excelImportService.parseExcelFile(file)
      setImportData(result)
      setShowImportReview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmImport = async (groups: ImportedGroup[], individualGuests: ImportedGuest[]) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      for (const group of groups) {
        let addressId: string | undefined

        if (group.address) {
          const addressService = await import('../../services/business-logic/AddressService')
          const service = new addressService.AddressService()
          const savedAddress = await service.createAddress(group.address)
          addressId = savedAddress.id
        }

        const newGroup = await guestService.createGroup({
          name: group.name,
          addressId,
          qrCodeGenerated: false
        })

        for (const guest of group.guests) {
          await guestService.createGuestWithCouple({
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phone: guest.phone,
            ageCategory: guest.ageCategory,
            specialNotes: guest.specialNotes,
            groupId: newGroup.id,
            rsvpStatus: 'pending'
          }, user.id)
        }
      }

      for (const guest of individualGuests) {
        await guestService.createGuestWithCouple({
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          ageCategory: guest.ageCategory,
          specialNotes: guest.specialNotes,
          rsvpStatus: 'pending'
        }, user.id)
      }

      await loadGuestsGroupedData()
      setShowImportReview(false)
      setImportData(null)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to import guests')
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
    <tr key={guest.id} className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-all ${isInGroup ? 'bg-gray-25/50 dark:bg-gray-900/30' : ''}`}>
      <td className={`px-6 py-4 whitespace-nowrap ${isInGroup ? 'pl-12' : ''}`}>
        <div className="flex items-center gap-2">
          {isInGroup && (
            <div className="w-2 h-2 bg-rose-400 dark:bg-rose-500 rounded-full"></div>
          )}
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {guest.firstName} {guest.lastName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-0.5">
          {guest.email && <div className="text-xs font-medium text-gray-900 dark:text-white">{guest.email}</div>}
          {guest.phone && <div className="text-xs text-gray-500 dark:text-gray-400">{guest.phone}</div>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-xs font-medium text-gray-900 dark:text-white">
          {guest.groupName || 'Individual'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(guest.rsvpStatus)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getAgeBadge(guest.ageCategory)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white">
        {guest.invitedByName || 'Unknown'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEditGuest(guest)}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
            title="Edit Guest"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteGuest(guest.id)}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Delete Guest"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  const renderGuestCard = (guest: Guest, isInGroup = false) => (
    <div key={guest.id} className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 ${isInGroup ? 'ml-4' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isInGroup && (
            <div className="w-2 h-2 bg-rose-400 dark:bg-rose-500 rounded-full mt-1"></div>
          )}
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {guest.firstName} {guest.lastName}
            </div>
            {guest.groupName && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {guest.groupName}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditGuest(guest)}
            className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
            title="Edit Guest"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteGuest(guest.id)}
            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Delete Guest"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {guest.email && (
          <div className="text-xs text-gray-900 dark:text-white">
            {guest.email}
          </div>
        )}
        {guest.phone && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {guest.phone}
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap pt-2">
          {getStatusBadge(guest.rsvpStatus)}
          {getAgeBadge(guest.ageCategory)}
          {guest.invitedByName && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              by {guest.invitedByName}
            </span>
          )}
        </div>
      </div>
    </div>
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
    <div className="w-full space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium text-sm">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {getAllGuests().length} total guests
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative" ref={guestDropdownRef}>
            <button
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium text-sm hidden sm:inline">Guest</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showGuestDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    handleDownloadTemplate()
                    setShowGuestDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors first:rounded-t-lg"
                >
                  <Download className="h-4 w-4" />
                  Template
                </button>
                <button
                  onClick={() => {
                    handleImportClick()
                    setShowGuestDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors last:rounded-b-lg"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleExportGroups}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium text-sm hidden sm:inline">Export</span>
          </button>
          
          <button 
            onClick={() => setShowAddWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {filtersExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filter Guests</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Refine your guest list view</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                RSVP Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {/* Age Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Age Category
              </label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Invited By
              </label>
              <select
                value={inviterFilter}
                onChange={(e) => setInviterFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Total
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {allGuests.length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Confirmed
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {allGuests.filter(g => g.rsvpStatus === 'confirmed').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-amber-500 rounded-lg">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Pending
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {allGuests.filter(g => g.rsvpStatus === 'pending').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-red-500 rounded-lg">
                <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Declined
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {allGuests.filter(g => g.rsvpStatus === 'declined').length}
                </div>
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedGroups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Group Header */}
            <div className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 border-b-2 border-rose-300 dark:border-rose-600 p-4">
              <button
                onClick={() => toggleGroupExpanded(group.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <div className="p-2 bg-rose-200 dark:bg-rose-700/50 rounded-lg">
                    <Home className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {group.guestCount} guest{group.guestCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Group Actions */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {/* QR Code Button */}
                <div className="relative qr-dropdown">
                  <button
                    onClick={() => toggleQRDropdown(group.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg transition-colors text-xs font-medium ${
                      group.qrCodeGenerated
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700'
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700'
                    }`}
                  >
                    {group.qrCodeGenerated ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>QR</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="h-3 w-3" />
                        <span>QR</span>
                      </>
                    )}
                  </button>

                  {openQRDropdowns.has(group.id) && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-10">
                      <div className="py-1">
                        {group.qrCodeGenerated ? (
                          <>
                            <button
                              onClick={() => {
                                handleDownloadExistingQRCode(group.id, group.name)
                                toggleQRDropdown(group.id)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Download className="h-3.5 w-3.5 text-blue-500" />
                              Download QR
                            </button>
                            <button
                              onClick={() => {
                                handleRegenerateQRCode(group.id, group.name)
                                toggleQRDropdown(group.id)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                              Regenerate
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              handleGenerateQRCode(group.id, group.name)
                              toggleQRDropdown(group.id)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <QrCode className="h-3.5 w-3.5 text-rose-500" />
                            Generate QR
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Badges */}
                {group.confirmedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
                    ✓ {group.confirmedCount}
                  </span>
                )}
                {group.pendingCount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full font-medium">
                    ⏳ {group.pendingCount}
                  </span>
                )}
                {group.declinedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium">
                    ✗ {group.declinedCount}
                  </span>
                )}
              </div>
            </div>
            
            {/* Group Guests */}
            {expandedGroups.has(group.id) && (
              <div className="p-3 space-y-2">
                {group.guests.map(guest => renderGuestCard(guest, true))}
              </div>
            )}
          </div>
        ))}

        {/* Individual Guests - Mobile */}
        {(currentPage === 1 || paginatedGroups.length === 0) && filteredIndividualGuests.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-b-2 border-blue-300 dark:border-blue-600 p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-200 dark:bg-blue-700/50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Individual Guests
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {filteredIndividualGuests.length} guest{filteredIndividualGuests.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {filteredIndividualGuests.map(guest => renderGuestCard(guest, false))}
            </div>
          </div>
        )}

        {/* Empty State - Mobile */}
        {paginatedGroups.length === 0 && filteredIndividualGuests.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-fit mx-auto mb-3">
                <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {allGuests.length === 0 ? 'No guests added yet' : 'No guests match the current filters'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {allGuests.length === 0 ? 'Add your first guest to get started' : 'Try adjusting your filter settings'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Group
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Invited By
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
              {/* Group Sections */}
              {paginatedGroups.map((group) => (
                <React.Fragment key={group.id}>
                  {/* Group Header */}
                  <tr className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 border-t-2 border-rose-300 dark:border-rose-600">
                    <td colSpan={7} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleGroupExpanded(group.id)}
                          className="flex items-center gap-3 text-left hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg p-2 -m-2 transition-all group"
                        >
                          {expandedGroups.has(group.id) ? (
                            <ChevronDown className="h-5 w-5 text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors" />
                          )}
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-200 dark:bg-rose-700/50 rounded-lg">
                              <Home className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {group.name}
                              </span>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {group.guestCount} guest{group.guestCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-3">
                          {/* QR Code Dropdown Menu */}
                          <div className="relative qr-dropdown">
                            <button
                              onClick={() => toggleQRDropdown(group.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors text-xs font-medium ${
                                group.qrCodeGenerated
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                              }`}
                              title={group.qrCodeGenerated ? "QR Code Options" : "Generate QR Code"}
                            >
                              {group.qrCodeGenerated ? (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>QR Ready</span>
                                </>
                              ) : (
                                <>
                                  <QrCode className="h-3.5 w-3.5" />
                                  <span>QR Code</span>
                                </>
                              )}
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openQRDropdowns.has(group.id) ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {openQRDropdowns.has(group.id) && (
                              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-10">
                                <div className="py-1">
                                  {group.qrCodeGenerated ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleDownloadExistingQRCode(group.id, group.name)
                                          toggleQRDropdown(group.id)
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <Download className="h-3.5 w-3.5 text-blue-500" />
                                        Download QR Code
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleRegenerateQRCode(group.id, group.name)
                                          toggleQRDropdown(group.id)
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                                        Regenerate QR Code
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleGenerateQRCode(group.id, group.name)
                                        toggleQRDropdown(group.id)
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <QrCode className="h-3.5 w-3.5 text-rose-500" />
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
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium border border-green-200 dark:border-green-700">
                                ✓ {group.confirmedCount} confirmed
                              </span>
                            )}
                            {group.pendingCount > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full font-medium border border-yellow-200 dark:border-yellow-700">
                                ⏳ {group.pendingCount} pending
                              </span>
                            )}
                            {group.declinedCount > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium border border-red-200 dark:border-red-700">
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
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-t-2 border-blue-300 dark:border-blue-600">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-200 dark:bg-blue-700/50 rounded-lg">
                          <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Individual Guests
                          </span>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
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
              <td colSpan={7} className="px-6 py-12">
                <div className="text-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-fit mx-auto mb-3">
                    <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {allGuests.length === 0 ? 'No guests added yet' : 'No guests match the current filters'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center sm:text-left">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredGroups.length)} of {filteredGroups.length} groups
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page Numbers - Hide some on mobile */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrentPage = pageNum === currentPage
              const showOnMobile = isCurrentPage || pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                    showOnMobile ? '' : 'hidden sm:inline-flex'
                  } ${
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
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
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

      {/* Import Review Modal */}
      {showImportReview && importData && (
        <ImportReviewModal
          isOpen={showImportReview}
          onClose={() => {
            setShowImportReview(false)
            setImportData(null)
          }}
          groups={importData.groups}
          individualGuests={importData.individualGuests}
          errors={importData.errors}
          onConfirm={handleConfirmImport}
        />
      )}
    </div>
  )
}