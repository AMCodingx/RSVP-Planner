import { useState } from 'react'
import { X, AlertCircle, Users, User, Home, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import type { ImportedGroup, ImportedGuest, ImportValidationError } from '../../services/business-logic/ExcelImportService'

interface ImportReviewModalProps {
  isOpen: boolean
  onClose: () => void
  groups: ImportedGroup[]
  individualGuests: ImportedGuest[]
  errors: ImportValidationError[]
  onConfirm: (groups: ImportedGroup[], individualGuests: ImportedGuest[]) => Promise<void>
}

export function ImportReviewModal({
  isOpen,
  onClose,
  groups: initialGroups,
  individualGuests: initialIndividualGuests,
  errors,
  onConfirm
}: ImportReviewModalProps) {
  const [groups, setGroups] = useState<ImportedGroup[]>(initialGroups)
  const [individualGuests, setIndividualGuests] = useState<ImportedGuest[]>(initialIndividualGuests)
  const [editingGuest, setEditingGuest] = useState<{ type: 'group' | 'individual', groupIndex?: number, guestIndex: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const totalGuests = groups.reduce((sum, group) => sum + group.guests.length, 0) + individualGuests.length

  const handleEditGuest = (type: 'group' | 'individual', guestIndex: number, groupIndex?: number) => {
    setEditingGuest({ type, guestIndex, groupIndex })
  }

  const handleSaveGuest = (updatedGuest: ImportedGuest) => {
    if (!editingGuest) return

    if (editingGuest.type === 'group' && editingGuest.groupIndex !== undefined) {
      const newGroups = [...groups]
      newGroups[editingGuest.groupIndex].guests[editingGuest.guestIndex] = updatedGuest
      setGroups(newGroups)
    } else if (editingGuest.type === 'individual') {
      const newIndividualGuests = [...individualGuests]
      newIndividualGuests[editingGuest.guestIndex] = updatedGuest
      setIndividualGuests(newIndividualGuests)
    }

    setEditingGuest(null)
  }

  const handleDeleteGuest = (type: 'group' | 'individual', guestIndex: number, groupIndex?: number) => {
    if (type === 'group' && groupIndex !== undefined) {
      const newGroups = [...groups]
      newGroups[groupIndex].guests.splice(guestIndex, 1)
      
      if (newGroups[groupIndex].guests.length === 0) {
        newGroups.splice(groupIndex, 1)
      }
      
      setGroups(newGroups)
    } else if (type === 'individual') {
      const newIndividualGuests = [...individualGuests]
      newIndividualGuests.splice(guestIndex, 1)
      setIndividualGuests(newIndividualGuests)
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(groups, individualGuests)
      onClose()
    } catch (error) {
      console.error('Failed to import guests:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEditingGuest = (): ImportedGuest | null => {
    if (!editingGuest) return null

    if (editingGuest.type === 'group' && editingGuest.groupIndex !== undefined) {
      return groups[editingGuest.groupIndex].guests[editingGuest.guestIndex]
    } else if (editingGuest.type === 'individual') {
      return individualGuests[editingGuest.guestIndex]
    }

    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Review Import
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Review and edit guests before importing
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                    Import Errors ({errors.length})
                  </h3>
                  <div className="space-y-1 text-xs text-red-700 dark:text-red-400">
                    {errors.slice(0, 5).map((error, index) => (
                      <div key={index}>
                        Row {error.row}, {error.field}: {error.message}
                      </div>
                    ))}
                    {errors.length > 5 && (
                      <div className="text-red-600 dark:text-red-500 font-medium">
                        ... and {errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Groups</span>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{groups.length}</span>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-900 dark:text-purple-300">Individual</span>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{individualGuests.length}</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-900 dark:text-green-300">Total Guests</span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalGuests}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({group.guests.length} {group.guests.length === 1 ? 'guest' : 'guests'})
                        </span>
                      </div>
                      {group.address && (
                        <div className="flex items-start gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <Home className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span>
                            {group.address.houseNumber && `${group.address.houseNumber} `}
                            {group.address.streetAddress}, {group.address.city}, {group.address.postalCode}, {group.address.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.guests.map((guest, guestIndex) => (
                    <div key={guestIndex} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {guest.firstName} {guest.lastName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              guest.ageCategory === 'adult' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}>
                              {guest.ageCategory === 'adult' ? 'Adult' : 'Child'}
                            </span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {guest.email && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">{guest.email}</div>
                            )}
                            {guest.phone && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">{guest.phone}</div>
                            )}
                            {guest.specialNotes && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 italic">{guest.specialNotes}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditGuest('group', guestIndex, groupIndex)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Edit Guest"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest('group', guestIndex, groupIndex)}
                            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete Guest"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {individualGuests.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Individual Guests</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({individualGuests.length})
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {individualGuests.map((guest, guestIndex) => (
                    <div key={guestIndex} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {guest.firstName} {guest.lastName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              guest.ageCategory === 'adult' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}>
                              {guest.ageCategory === 'adult' ? 'Adult' : 'Child'}
                            </span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {guest.email && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">{guest.email}</div>
                            )}
                            {guest.phone && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">{guest.phone}</div>
                            )}
                            {guest.specialNotes && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 italic">{guest.specialNotes}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditGuest('individual', guestIndex)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Edit Guest"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest('individual', guestIndex)}
                            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete Guest"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalGuests === 0 && (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No guests to import</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={totalGuests === 0 || errors.length > 0 || isSubmitting}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-300 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? 'Importing...' : `Import ${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'}`}
          </button>
        </div>
      </div>

      {editingGuest && getEditingGuest() && (
        <EditImportedGuestModal
          guest={getEditingGuest()!}
          onSave={handleSaveGuest}
          onClose={() => setEditingGuest(null)}
        />
      )}
    </div>
  )
}

function EditImportedGuestModal({
  guest,
  onSave,
  onClose
}: {
  guest: ImportedGuest
  onSave: (guest: ImportedGuest) => void
  onClose: () => void
}) {
  const [editedGuest, setEditedGuest] = useState<ImportedGuest>({ ...guest })

  const handleSave = () => {
    onSave(editedGuest)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-3">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Edit Guest</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={editedGuest.firstName}
                onChange={(e) => setEditedGuest({ ...editedGuest, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={editedGuest.lastName}
                onChange={(e) => setEditedGuest({ ...editedGuest, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editedGuest.email || ''}
                onChange={(e) => setEditedGuest({ ...editedGuest, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editedGuest.phone || ''}
                onChange={(e) => setEditedGuest({ ...editedGuest, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age Category
            </label>
            <select
              value={editedGuest.ageCategory}
              onChange={(e) => setEditedGuest({ ...editedGuest, ageCategory: e.target.value as 'adult' | 'child' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Special Notes
            </label>
            <textarea
              value={editedGuest.specialNotes || ''}
              onChange={(e) => setEditedGuest({ ...editedGuest, specialNotes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editedGuest.firstName || !editedGuest.lastName}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-300 disabled:cursor-not-allowed text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
