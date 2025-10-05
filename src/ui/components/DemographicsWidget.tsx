import { Users, Baby, Heart } from 'lucide-react'
import type { Demographics, InviterStats } from '../../services/business-logic/DashboardService'

interface DemographicsWidgetProps {
  demographics: Demographics
  inviterStats: InviterStats
}

export function DemographicsWidget({ demographics, inviterStats }: DemographicsWidgetProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Demographics
        </h3>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
      </div>

      {/* Age Demographics */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Age Categories
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-base font-semibold text-blue-900 dark:text-blue-100">
                  Adults
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {demographics.adults.total}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium text-blue-700 dark:text-blue-300">
              <span>✓ {demographics.adults.confirmed}</span>
              <span>✗ {demographics.adults.declined}</span>
              <span>⏳ {demographics.adults.pending}</span>
            </div>
          </div>

          <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                  <Baby className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-base font-semibold text-purple-900 dark:text-purple-100">
                  Children
                </span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {demographics.children.total}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium text-purple-700 dark:text-purple-300">
              <span>✓ {demographics.children.confirmed}</span>
              <span>✗ {demographics.children.declined}</span>
              <span>⏳ {demographics.children.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inviter Statistics */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Invited By
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-800/50 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <span className="text-base font-semibold text-pink-900 dark:text-pink-100">
                  Partner 1
                </span>
              </div>
              <span className="text-2xl font-bold text-pink-600">
                {inviterStats.partner1.total}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium text-pink-700 dark:text-pink-300 mb-2">
              <span>✓ {inviterStats.partner1.confirmed}</span>
              <span>✗ {inviterStats.partner1.declined}</span>
              <span>⏳ {inviterStats.partner1.pending}</span>
            </div>
            <div className="text-sm text-pink-600 font-semibold text-center">
              {inviterStats.partner1.responseRate}% responded
            </div>
          </div>

          <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-800/50 rounded-lg">
                  <Heart className="h-5 w-5 text-rose-600" />
                </div>
                <span className="text-base font-semibold text-rose-900 dark:text-rose-100">
                  Partner 2
                </span>
              </div>
              <span className="text-2xl font-bold text-rose-600">
                {inviterStats.partner2.total}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">
              <span>✓ {inviterStats.partner2.confirmed}</span>
              <span>✗ {inviterStats.partner2.declined}</span>
              <span>⏳ {inviterStats.partner2.pending}</span>
            </div>
            <div className="text-sm text-rose-600 font-semibold text-center">
              {inviterStats.partner2.responseRate}% responded
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <div className="flex justify-between items-center text-base mb-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Total Attending:</span>
          <span className="font-bold text-green-600 text-lg">{demographics.totalAttending}</span>
        </div>
        <div className="flex justify-between items-center text-base">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Total Declined:</span>
          <span className="font-bold text-red-600 text-lg">{demographics.totalDeclined}</span>
        </div>
      </div>
    </div>
  )
}