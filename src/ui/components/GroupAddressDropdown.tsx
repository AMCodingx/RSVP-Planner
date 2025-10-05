import { useState } from 'react'
import { AddressViewDialog } from './AddressViewDialog'
import type { Address } from '../models/Address'
import { Eye } from 'lucide-react'

interface GroupAddressDropdownProps {
  groupId: string
  groupName: string
  currentAddress?: Address | null
  onAddressUpdated: () => void
}

export function GroupAddressDropdown({ 
  groupId, 
  groupName,
  currentAddress, 
  onAddressUpdated 
}: GroupAddressDropdownProps) {
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  if (!currentAddress) {
    return null
  }

  return (
    <div className="relative">
      {/* View Address Button */}
      <button
        onClick={() => setShowAddressDialog(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors shadow-sm text-sm"
      >
        <Eye className="h-4 w-4" />
        <span>View Address</span>
      </button>

      {/* Address View Dialog */}
      <AddressViewDialog
        isOpen={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        address={currentAddress || null}
        groupId={groupId}
        groupName={groupName}
        onAddressUpdated={() => {
          onAddressUpdated()
          setShowAddressDialog(false)
        }}
      />
    </div>
  )
}