import { useState, useEffect } from 'react'
import { groupService } from '../../services/business-logic/GroupService'
import { GroupManagementModal } from './GroupManagementModal'
import type { Group } from '../models/Guest'
import { Users, QrCode, Search, Filter, Plus, Edit, MapPin } from 'lucide-react'

export function GroupOverviewTable() {
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [qrFilter, setQrFilter] = useState<'all' | 'generated' | 'not-generated'>('all')
  const [sortColumn, setSortColumn] = useState<keyof Group>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    filterAndSortGroups()
  }, [groups, searchTerm, qrFilter, sortColumn, sortDirection])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const allGroups = await groupService.getAllGroups()
      setGroups(allGroups)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortGroups = () => {
    let filtered = groups.filter(group => {
      const matchesSearch = 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.address && (
          group.address.streetAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.address.country.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      
      const matchesQr = qrFilter === 'all' || 
        (qrFilter === 'generated' && group.qrCodeGenerated) ||
        (qrFilter === 'not-generated' && !group.qrCodeGenerated)
      
      return matchesSearch && matchesQr
    })

    filtered.sort((a, b) => {
      const aValue = a[sortColumn] || ''
      const bValue = b[sortColumn] || ''
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredGroups(filtered)
  }

  const handleSort = (column: keyof Group) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleCreateGroup = () => {
    setEditingGroup(null)
    setIsModalOpen(true)
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setIsModalOpen(true)
  }

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [newGroup, ...prev])
  }

  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroups(prev => prev.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ))
  }

  const handleGroupDeleted = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId))
  }

  const handleGenerateQrCode = async (group: Group) => {
    try {
      const qrCodeUrl = await groupService.generateQrCodeForGroup(group.id)
      setGroups(prev => prev.map(g => 
        g.id === group.id 
          ? { ...g, qrCodeGenerated: true, qrCodeUrl } 
          : g
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code')
    }
  }

  const getResponseRate = (group: Group) => {
    if (group.guestCount === 0) return 0
    return Math.round(((group.confirmedCount + group.declinedCount) / group.guestCount) * 100)
  }

  const getTotalGuests = () => groups.reduce((sum, group) => sum + group.guestCount, 0)
  const getTotalConfirmed = () => groups.reduce((sum, group) => sum + group.confirmedCount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Group Management
          </h1>
        </div>
        <button 
          onClick={handleCreateGroup}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-md transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* QR Code Filter */}
          <select
            value={qrFilter}
            onChange={(e) => setQrFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="all">All QR Status</option>
            <option value="generated">QR Generated</option>
            <option value="not-generated">QR Not Generated</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Groups</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-blue-600">{getTotalGuests()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Guests</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-green-600">{getTotalConfirmed()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Confirmed</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">{groups.filter(g => g.qrCodeGenerated).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">QR Generated</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('name')}
                >
                  Group Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('guestCount')}
                >
                  Guests {sortColumn === 'guestCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RSVP Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Response Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                      {group.address ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="truncate">
                            {groupService.formatGroupAddress(group)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">No address</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.guestCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-green-600">Confirmed:</span>
                        <span className="font-medium">{group.confirmedCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-600">Pending:</span>
                        <span className="font-medium">{group.pendingCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-600">Declined:</span>
                        <span className="font-medium">{group.declinedCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {getResponseRate(group)}%
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getResponseRate(group)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {group.qrCodeGenerated ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          ✓ Generated
                        </span>
                        {group.qrCodeUrl && (
                          <a
                            href={group.qrCodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                            title="View QR Code"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateQrCode(group)}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        Generate
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {group.qrCodeGenerated && group.qrCodeUrl && (
                        <a
                          href={group.qrCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                          title="View QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded"
                        title="Edit Group"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredGroups.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {groups.length === 0 ? 'No groups created yet. Create your first group to get started!' : 'No groups match the current filters.'}
            </div>
          )}
        </div>
      </div>

      <GroupManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={handleGroupCreated}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
        editingGroup={editingGroup}
      />
    </div>
  )
}