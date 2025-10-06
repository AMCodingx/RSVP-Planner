import { GuestOverviewTable } from '../components/GuestOverviewTable'
import { Users } from 'lucide-react'

export function GuestsPage() {
  return (
    <div className="max-w-full">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <Users className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Guest Management
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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