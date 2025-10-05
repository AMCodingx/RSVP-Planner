import React, { useState } from 'react'
import { AddressForm } from './AddressForm'
import { AddressService } from '../../services/business-logic/AddressService'
import type { Address, AddressFormData } from '../models/Address'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: Address) => void
  initialAddress?: Address
  title?: string
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  title
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addressService = new AddressService()

  if (!isOpen) return null

  const handleSubmit = async (formData: AddressFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      let savedAddress: Address

      if (initialAddress) {
        // Update existing address
        savedAddress = await addressService.updateAddress(initialAddress.id, formData)
      } else {
        // Create new address
        savedAddress = await addressService.createAddress(formData)
      }

      onSave(savedAddress)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setError(null)
    onClose()
  }

  const getInitialFormData = (): Partial<AddressFormData> => {
    if (!initialAddress) return {}

    return {
      streetAddress: initialAddress.streetAddress,
      city: initialAddress.city,
      stateProvince: initialAddress.stateProvince || '',
      postalCode: initialAddress.postalCode,
      country: initialAddress.country,
      deliveryInstructions: initialAddress.deliveryInstructions || ''
    }
  }

  const modalTitle = title || (initialAddress ? 'Edit Address' : 'Add Address')
  const submitButtonText = initialAddress ? 'Update Address' : 'Save Address'

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {modalTitle}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              disabled={isSubmitting}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Form */}
          <AddressForm
            initialData={getInitialFormData()}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
          />
        </div>
      </div>
    </div>
  )
}