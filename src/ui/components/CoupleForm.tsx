import React, { useState } from 'react'

export interface CoupleFormData {
  firstName: string
  lastName: string
  email: string
}

interface CoupleFormProps {
  initialData?: Partial<CoupleFormData>
  onSubmit: (data: CoupleFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitButtonText?: string
  hideEmail?: boolean
}

export const CoupleForm: React.FC<CoupleFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Save Couple',
  hideEmail = false
}) => {
  const [formData, setFormData] = useState<CoupleFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || ''
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof CoupleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.firstName.trim()) {
      newErrors.push('First name is required')
    }

    if (!formData.lastName.trim()) {
      newErrors.push('Last name is required')
    }

    if (!hideEmail) {
      if (!formData.email.trim()) {
        newErrors.push('Email is required')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.push('Please enter a valid email address')
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-red-800 font-medium mb-2">Please correct the following errors:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
          First Name *
        </label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          placeholder="Enter first name"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
          Last Name *
        </label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          placeholder="Enter last name"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Email */}
      {!hideEmail && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            placeholder="Enter email address"
            disabled={isSubmitting}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            This should match the email address used to log in to the system.
          </p>
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  )
}