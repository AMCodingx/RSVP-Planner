import React from 'react'
import type { Address } from '../models/Address'

interface AddressDisplayProps {
  address: Address
  showLabel?: boolean
  className?: string
  compact?: boolean
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  showLabel = false,
  className = '',
  compact = false
}) => {
  const formatAddress = () => {
    const streetWithNumber = address.houseNumber && address.streetAddress 
      ? `${address.houseNumber} ${address.streetAddress}`
      : address.streetAddress

    const parts = [
      streetWithNumber,
      address.city,
      [address.stateProvince, address.postalCode].filter(Boolean).join(' '),
      address.country
    ].filter(Boolean)

    if (compact) {
      return parts.join(', ')
    }

    return parts
  }

  if (compact) {
    return (
      <div className={className}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 mr-2">Address:</span>
        )}
        <span className="text-sm text-gray-600">{formatAddress()}</span>
      </div>
    )
  }

  const addressParts = formatAddress() as string[]

  return (
    <div className={className}>
      {showLabel && (
        <div className="text-sm font-medium text-gray-700 mb-1">Address:</div>
      )}
      <div className="text-sm text-gray-600">
        {addressParts.map((part, index) => (
          <div key={index}>{part}</div>
        ))}
        {address.deliveryInstructions && (
          <div className="text-xs text-gray-500 mt-1 italic">
            {address.deliveryInstructions}
          </div>
        )}
      </div>
    </div>
  )
}

interface AddressCardProps {
  address: Address
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  showActions = true
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <AddressDisplay address={address} />
        
        {showActions && (
          <div className="flex space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                title="Edit address"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
                title="Delete address"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Added {address.dateCreated.toLocaleDateString()}
      </div>
    </div>
  )
}