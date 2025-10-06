import { useState } from 'react'
import { X, Plus, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { GuestService } from '../../services/business-logic/GuestService'
import { AddressService } from '../../services/business-logic/AddressService'
import { useAuth } from '../../services/AuthContext'
import { AddressForm } from './AddressForm'
import type { Group } from '../models/Guest'
import type { AddressFormData } from '../models/Address'

interface AddGuestWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type WizardStep = 'guest-details' | 'group-assignment' | 'confirmation'

interface StepInfo {
  label: string
  stepType: 'guest' | 'group' | 'confirm'
  guestIndex?: number
}

interface GuestFormData {
  firstName: string
  lastName: string
  phone: string
  ageCategory: 'adult' | 'child'
  specialNotes: string
}

interface GroupAssignmentData {
  type: 'existing' | 'new'
  existingGroupId?: string
  newGroupName?: string
  address?: AddressFormData
}

const initialGuestData: GuestFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  ageCategory: 'adult',
  specialNotes: ''
}

export function AddGuestWizard({ isOpen, onClose, onSuccess }: AddGuestWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<WizardStep>('guest-details')
  const [currentGuestIndex, setCurrentGuestIndex] = useState(0)
  const [guests, setGuests] = useState<GuestFormData[]>([{ ...initialGuestData }])
  const [groupAssignment, setGroupAssignment] = useState<GroupAssignmentData>({ type: 'new' })
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const guestService = new GuestService()
  const addressService = new AddressService()

  const generateSteps = (): StepInfo[] => {
    const steps: StepInfo[] = []
    
    // Add guest detail steps
    guests.forEach((_, index) => {
      steps.push({
        label: index === 0 ? 'Details' : `Guest ${index + 1}`,
        stepType: 'guest',
        guestIndex: index
      })
    })
    
    // Add group and confirm steps
    steps.push({ label: 'Group', stepType: 'group' })
    steps.push({ label: 'Confirm', stepType: 'confirm' })
    
    return steps
  }

  const resetWizard = () => {
    setCurrentStep('guest-details')
    setCurrentGuestIndex(0)
    setGuests([{ ...initialGuestData }])
    setGroupAssignment({ type: 'new' })
    setError('')
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetWizard()
    onClose()
  }

  const addGuest = () => {
    const newGuests = [...guests, { ...initialGuestData }]
    setGuests(newGuests)
    setCurrentGuestIndex(newGuests.length - 1)
  }

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      const newGuests = guests.filter((_, i) => i !== index)
      setGuests(newGuests)
      
      // Adjust current guest index if needed
      if (currentGuestIndex >= newGuests.length) {
        setCurrentGuestIndex(newGuests.length - 1)
      } else if (currentGuestIndex > index) {
        setCurrentGuestIndex(currentGuestIndex - 1)
      }
    }
  }

  const updateGuest = (index: number, updates: Partial<GuestFormData>) => {
    const updated = [...guests]
    updated[index] = { ...updated[index], ...updates }
    setGuests(updated)
  }

  const handleDetailsNext = async () => {
    const hasValidGuests = guests.every(guest => 
      guest.firstName.trim() && guest.lastName.trim()
    )
    
    if (!hasValidGuests) {
      setError('All guests must have first name and last name')
      return
    }
    
    const groups = await guestService.getAllGroups()
    setAvailableGroups(groups)
    setCurrentStep('group-assignment')
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    // Validate before submitting
    const errors = validateGroupAssignment()
    if (errors.length > 0) {
      setError('Please fix the following issues:\n' + errors.join('\n'))
      return
    }
    
    setIsSubmitting(true)
    setError('')

    try {
      let groupId: string | undefined

      if (groupAssignment.type === 'existing' && groupAssignment.existingGroupId) {
        groupId = groupAssignment.existingGroupId
      } else if (groupAssignment.type === 'new' && groupAssignment.newGroupName) {
        let addressId: string | undefined
        
        if (groupAssignment.address) {
          const savedAddress = await addressService.createAddress({
            houseNumber: groupAssignment.address.houseNumber,
            streetAddress: groupAssignment.address.streetAddress,
            city: groupAssignment.address.city,
            stateProvince: groupAssignment.address.stateProvince || '',
            postalCode: groupAssignment.address.postalCode,
            country: groupAssignment.address.country,
            deliveryInstructions: groupAssignment.address.deliveryInstructions || ''
          })
          addressId = savedAddress.id
        }

        const newGroup = await guestService.createGroup({
          name: groupAssignment.newGroupName,
          addressId,
          qrCodeGenerated: false
        })
        groupId = newGroup.id
      }

      for (const guest of guests) {
        if (!user?.id) {
          throw new Error('User not authenticated')
        }
        
        await guestService.createGuestWithCouple({
          ...guest,
          groupId,
          rsvpStatus: 'pending'
        }, user.id)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add guests')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateGroupAssignment = (): string[] => {
    const errors: string[] = []
    
    if (groupAssignment.type === 'existing') {
      if (!groupAssignment.existingGroupId) {
        errors.push('Please select an existing group')
      }
    } else if (groupAssignment.type === 'new') {
      if (!groupAssignment.newGroupName?.trim()) {
        errors.push('Group name is required')
      }
    }
    
    return errors
  }

  const canProceed = () => {
    if (currentStep === 'guest-details') {
      return guests[currentGuestIndex]?.firstName.trim() && guests[currentGuestIndex]?.lastName.trim()
    }
    if (currentStep === 'group-assignment') {
      const errors = validateGroupAssignment()
      return errors.length === 0
    }
    return true
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Add Guests
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-start overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-max">
                {generateSteps().map((step, index) => {
                  const stepNumber = index + 1
                  const isActive = 
                    (currentStep === 'guest-details' && step.stepType === 'guest' && step.guestIndex === currentGuestIndex) ||
                    (currentStep === 'group-assignment' && step.stepType === 'group') ||
                    (currentStep === 'confirmation' && step.stepType === 'confirm')
                  
                  const isCompleted = 
                    (step.stepType === 'guest' && currentStep === 'group-assignment') ||
                    (step.stepType === 'guest' && currentStep === 'confirmation') ||
                    (step.stepType === 'group' && currentStep === 'confirmation')

                  return (
                    <div key={`${step.stepType}-${step.guestIndex || 0}`} className="flex items-center">
                      <button
                        onClick={() => {
                          if (step.stepType === 'guest') {
                            setCurrentStep('guest-details')
                            setCurrentGuestIndex(step.guestIndex || 0)
                          } else if (step.stepType === 'group') {
                            setCurrentStep('group-assignment')
                          }
                        }}
                        disabled={step.stepType === 'confirm'}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                          ${isCompleted ? 'bg-green-500 text-white' : 
                            isActive ? 'bg-rose-500 text-white' : 
                            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                          ${step.stepType !== 'confirm' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
                        `}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepNumber}
                      </button>
                      <span className="ml-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {step.label}
                      </span>
                      {index < generateSteps().length - 1 && (
                        <div className={`
                          w-4 sm:w-6 h-0.5 mx-1 sm:mx-2
                          ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                        `} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 'guest-details' && (
            <CurrentGuestForm
              guest={guests[currentGuestIndex]}
              guestNumber={currentGuestIndex + 1}
              totalGuests={guests.length}
              onUpdate={(updates) => updateGuest(currentGuestIndex, updates)}
              onAdd={addGuest}
              onRemove={() => removeGuest(currentGuestIndex)}
              onPrevious={currentGuestIndex > 0 ? () => setCurrentGuestIndex(currentGuestIndex - 1) : undefined}
              onNext={currentGuestIndex < guests.length - 1 ? () => setCurrentGuestIndex(currentGuestIndex + 1) : undefined}
            />
          )}

          {/* Group Assignment */}
          {currentStep === 'group-assignment' && (
            <GroupAssignmentForm
              assignment={groupAssignment}
              onChange={setGroupAssignment}
              availableGroups={availableGroups}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={currentStep === 'guest-details' ? handleClose : () => {
              setCurrentStep('guest-details')
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            {currentStep === 'guest-details' ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={currentStep === 'group-assignment' ? handleSubmit : () => {
              if (currentStep === 'guest-details') {
                handleDetailsNext()
              }
            }}
            disabled={!canProceed() || isSubmitting}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-300 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              'Adding...'
            ) : currentStep === 'group-assignment' ? (
              'Add Guests'
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 inline ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function CurrentGuestForm({ 
  guest, 
  guestNumber,
  totalGuests,
  onUpdate, 
  onAdd, 
  onRemove,
  onPrevious,
  onNext
}: { 
  guest: GuestFormData
  guestNumber: number
  totalGuests: number
  onUpdate: (updates: Partial<GuestFormData>) => void
  onAdd: () => void
  onRemove: () => void
  onPrevious?: () => void
  onNext?: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
            Guest {guestNumber} Details
          </h3>
          <div className="flex items-center gap-2">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 font-medium"
              >
                ← Previous
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalGuests > 1 && (
            <button
              onClick={onRemove}
              className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm font-medium rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
          <button
            onClick={onAdd}
            className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 sm:p-5">
        <SingleGuestForm
          guest={guest}
          onChange={onUpdate}
        />
      </div>
    </div>
  )
}
function SingleGuestForm({ guest, onChange }: { guest: GuestFormData, onChange: (guest: GuestFormData) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={guest.firstName}
            onChange={(e) => onChange({ ...guest, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={guest.lastName}
            onChange={(e) => onChange({ ...guest, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={guest.phone}
            onChange={(e) => onChange({ ...guest, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age Category
          </label>
          <select
            value={guest.ageCategory}
            onChange={(e) => onChange({ ...guest, ageCategory: e.target.value as 'adult' | 'child' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
          >
            <option value="adult">Adult (18+)</option>
            <option value="child">Child (Under 18)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Special Notes
        </label>
        <textarea
          value={guest.specialNotes}
          onChange={(e) => onChange({ ...guest, specialNotes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 resize-none"
          placeholder="Any special notes about this guest..."
        />
      </div>
    </div>
  )
}

function GroupAssignmentForm({
  assignment,
  onChange,
  availableGroups
}: {
  assignment: GroupAssignmentData
  onChange: (assignment: GroupAssignmentData) => void
  availableGroups: Group[]
}) {
  const handleAddressChange = (addressData: AddressFormData) => {
    onChange({ ...assignment, address: addressData })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
          Group Setup
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Add to existing group or create new
        </span>
      </div>

      <div className="space-y-4">
        {availableGroups.length > 0 && (
          <div>
            <label className="flex items-center mb-2">
              <input
                type="radio"
                name="groupType"
                checked={assignment.type === 'existing'}
                onChange={() => onChange({ type: 'existing', existingGroupId: availableGroups[0]?.id })}
                className="mr-2 text-rose-500 focus:ring-rose-500 w-4 h-4"
              />
              <span className="text-sm text-gray-900 dark:text-white font-medium">Add to existing group</span>
            </label>
            {assignment.type === 'existing' && (
              <select
                value={assignment.existingGroupId || ''}
                onChange={(e) => onChange({ ...assignment, existingGroupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select a group</option>
                {availableGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="groupType"
              checked={assignment.type === 'new'}
              onChange={() => onChange({ type: 'new', newGroupName: '' })}
              className="mr-2 text-rose-500 focus:ring-rose-500 w-4 h-4"
            />
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              Create new group
            </span>
          </label>
          {assignment.type === 'new' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter group name"
                value={assignment.newGroupName || ''}
                onChange={(e) => onChange({ ...assignment, newGroupName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
              />
              <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Invitation Address
                </h4>
                <AddressForm
                  initialData={assignment.address}
                  onSubmit={handleAddressChange}
                  onCancel={() => {}}
                  showButtons={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}