import { GuestOverviewTable } from '../components/GuestOverviewTable'
import { Users } from 'lucide-react'

export function GuestsPage() {
  return (
    <div className="max-w-full">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <Users className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Guest Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your wedding guest list, track RSVPs, and organize invitations
              </p>
            </div>
          </div>
        </div>

        <GuestOverviewTable />
      </div>
    </div>
  )
}