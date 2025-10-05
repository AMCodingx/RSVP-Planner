import React, { useState, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import type { AddressFormData, Country } from '../models/Address'

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitButtonText?: string
  showButtons?: boolean
}

const countries: Country[] = [
  { code: 'NL', name: 'Netherlands', states: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant', 'Gelderland', 'Overijssel', 'Groningen', 'Friesland', 'Drenthe', 'Flevoland', 'Zeeland', 'Limburg'] },
  { code: 'CW', name: 'Curacao' },
  { code: 'US', name: 'USA', states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'] },
  { code: 'AW', name: 'Aruba' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'OTHER', name: 'Other' }
]

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Save Address',
  showButtons = true
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    houseNumber: initialData.houseNumber || '',
    streetAddress: initialData.streetAddress || '',
    city: initialData.city || '',
    stateProvince: initialData.stateProvince || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'NL',
    deliveryInstructions: initialData.deliveryInstructions || ''
  })

  const [errors, setErrors] = useState<string[]>([])
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    countries.find(c => c.code === formData.country)
  )

  useEffect(() => {
    const country = countries.find(c => c.code === formData.country)
    setSelectedCountry(country)
    // Clear state when country changes
    if (country?.code !== selectedCountry?.code) {
      setFormData(prev => ({ ...prev, stateProvince: '' }))
    }
  }, [formData.country])

  // Auto-submit when showButtons is false and form data changes
  useEffect(() => {
    if (!showButtons) {
      onSubmit(formData)
    }
  }, [formData, showButtons]) // Removed onSubmit from dependencies

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear general errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }

    // Generate address suggestions for street address
    if (field === 'streetAddress' && value.length > 2) {
      generateAddressSuggestions(value)
    } else if (field === 'streetAddress') {
      setShowSuggestions(false)
    }
  }

  const generateAddressSuggestions = (partial: string) => {
    // Mock address suggestions - in real app, you'd use Google Places API or similar
    const mockSuggestions = [
      `${partial} Street`,
      `${partial} Avenue`,
      `${partial} Drive`,
      `${partial} Boulevard`,
      `${partial} Road`
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(partial.toLowerCase()) && 
      suggestion.toLowerCase() !== partial.toLowerCase()
    )
    
    setAddressSuggestions(mockSuggestions.slice(0, 5))
    setShowSuggestions(mockSuggestions.length > 0)
  }

  const selectAddressSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, streetAddress: suggestion }))
    setShowSuggestions(false)
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.country.trim()) {
      newErrors.push('Country is required')
    }

    if (!formData.streetAddress.trim()) {
      newErrors.push('Street address is required')
    }

    if (!formData.city.trim()) {
      newErrors.push('City is required')
    }

    if (!formData.postalCode.trim()) {
      newErrors.push('Postal code is required')
    }

    // State validation for countries that have states
    if (selectedCountry?.states && !formData.stateProvince.trim()) {
      newErrors.push(`State/Province is required for ${selectedCountry.name}`)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-red-800 dark:text-red-400 text-sm">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Country Selection - First Priority */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Country
        </label>
        <div className="relative">
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none pr-10"
            required
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Address Fields - Only show after country is selected */}
      {formData.country && (
        <>
          {/* House Number and Street Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                House Number
              </label>
              <input
                type="text"
                id="houseNumber"
                value={formData.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="123"
                required
              />
            </div>

            <div className="md:col-span-2 relative">
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => formData.streetAddress.length > 2 && generateAddressSuggestions(formData.streetAddress)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Main Street"
                  required
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              {/* Address Suggestions */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAddressSuggestion(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <MapPin className="inline h-3 w-3 mr-2 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* City and State/Province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="City"
                required
              />
            </div>

            <div>
              <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State/Province
              </label>
              {selectedCountry?.states ? (
                <div className="relative">
                  <select
                    id="stateProvince"
                    value={formData.stateProvince}
                    onChange={(e) => handleInputChange('stateProvince', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none pr-10"
                    required
                  >
                    <option value="">Select state/province</option>
                    {selectedCountry.states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  id="stateProvince"
                  value={formData.stateProvince}
                  onChange={(e) => handleInputChange('stateProvince', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="State or Province"
                />
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder={
                  selectedCountry?.code === 'US' ? '12345' : 
                  selectedCountry?.code === 'NL' ? '1234 AB' : 
                  selectedCountry?.code === 'CW' ? '0000' :
                  selectedCountry?.code === 'AW' ? '00000' :
                  selectedCountry?.code === 'DO' ? '00000' :
                  'Postal Code'
                }
                required
              />
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Instructions
            </label>
            <textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Optional delivery instructions (e.g., apartment number, gate code, special instructions)"
            />
          </div>
        </>
      )}

      {showButtons && (
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-rose-500 border border-transparent rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : submitButtonText}
          </button>
        </div>
      )}
    </form>
  )
}