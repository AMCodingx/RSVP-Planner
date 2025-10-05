import { useState, useEffect } from 'react'
import { groupService } from '../../services/business-logic/GroupService'
import { AddressForm } from './AddressForm'
import { AddressDisplay } from './AddressDisplay'
import type { Group, Guest } from '../models/Guest'
import type { AddressFormData } from '../models/Address'
import { X, Save, Trash2, Plus } from 'lucide-react'

interface GroupManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated?: (group: Group) => void
  onGroupUpdated?: (group: Group) => void
  onGroupDeleted?: (groupId: string) => void
  editingGroup?: Group | null
}

export function GroupManagementModal({
  isOpen,
  onClose,
  onGroupCreated,
  onGroupUpdated,
  onGroupDeleted,
  editingGroup
}: GroupManagementModalProps) {
  const [groupName, setGroupName] = useState('')
  const [addressFormData, setAddressFormData] = useState<AddressFormData | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [useStructuredAddress, setUseStructuredAddress] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [groupGuests, setGroupGuests] = useState<Guest[]>([])

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name)
      
      // Check if group has structured address
      if (editingGroup.address) {
        setUseStructuredAddress(true)
        setAddressFormData({
          houseNumber: editingGroup.address.houseNumber || '',
          streetAddress: editingGroup.address.streetAddress,
          city: editingGroup.address.city,
          stateProvince: editingGroup.address.stateProvince || '',
          postalCode: editingGroup.address.postalCode,
          country: editingGroup.address.country,
          deliveryInstructions: editingGroup.address.deliveryInstructions || ''
        })
      } else {
        setUseStructuredAddress(false)
        setAddressFormData(null)
      }
      
      loadGroupGuests(editingGroup.id)
    } else {
      setGroupName('')
      setAddressFormData(null)
      setUseStructuredAddress(false)
      setGroupGuests([])
    }
    setError(null)
    setShowDeleteConfirm(false)
    setShowAddressForm(false)
  }, [editingGroup, isOpen])

  const loadGroupGuests = async (groupId: string) => {
    try {
      const guests = await groupService.getGuestsInGroup(groupId)
      setGroupGuests(guests)
    } catch (err) {
      console.error('Failed to load group guests:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const groupData = {
        name: groupName.trim(),
        addressData: useStructuredAddress ? addressFormData || undefined : undefined
      }

      if (editingGroup) {
        const updatedGroup = await groupService.updateGroup(editingGroup.id, groupData)
        onGroupUpdated?.(updatedGroup)
      } else {
        const newGroup = await groupService.createGroup(groupData)
        onGroupCreated?.(newGroup)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressTypeChange = (useStructured: boolean) => {
    setUseStructuredAddress(useStructured)
    if (useStructured && !addressFormData) {
      setAddressFormData({
        houseNumber: '',
        streetAddress: '',
        city: '',
        stateProvince: '',
        postalCode: '',
        country: 'USA',
        deliveryInstructions: ''
      })
    }
  }

  const handleAddressFormSubmit = (formData: AddressFormData) => {
    setAddressFormData(formData)
    setShowAddressForm(false)
  }

  const handleDelete = async () => {
    if (!editingGroup) return

    setIsLoading(true)
    setError(null)

    try {
      await groupService.deleteGroup(editingGroup.id)
      onGroupDeleted?.(editingGroup.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Enter group name"
              disabled={isLoading}
              required
            />
          </div>

          {/* Address Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invitation Address (Optional)
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useStructuredAddress}
                  onChange={(e) => handleAddressTypeChange(e.target.checked)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Add structured address for invitations
                </span>
              </label>
            </div>
          </div>

          {/* Address Input */}
          {useStructuredAddress && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Structured Address
                </label>
                {addressFormData && !showAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {showAddressForm || !addressFormData ? (
                <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                  <AddressForm
                    initialData={addressFormData || undefined}
                    onSubmit={handleAddressFormSubmit}
                    onCancel={() => setShowAddressForm(false)}
                    isSubmitting={isLoading}
                    submitButtonText="Save Address"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                  <AddressDisplay
                    address={{
                      id: '',
                      streetAddress: addressFormData.streetAddress,
                      city: addressFormData.city,
                      stateProvince: addressFormData.stateProvince || undefined,
                      postalCode: addressFormData.postalCode,
                      country: addressFormData.country,
                      deliveryInstructions: addressFormData.deliveryInstructions || undefined,
                      dateCreated: new Date()
                    }}
                    compact={true}
                  />
                  {!addressFormData.streetAddress && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-2"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add address details
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {editingGroup && groupGuests.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guests in this Group ({groupGuests.length})
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                {groupGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {guest.firstName} {guest.lastName}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      guest.rsvpStatus === 'confirmed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : guest.rsvpStatus === 'declined'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {guest.rsvpStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>

        {editingGroup && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Group
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Are you sure you want to delete this group?
                  </p>
                  {groupGuests.length > 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      This will ungroup {groupGuests.length} guest(s). They will become individual guests.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    {isLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}