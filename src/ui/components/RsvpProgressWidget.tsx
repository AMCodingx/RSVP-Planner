import { TrendingUp, CheckCircle } from 'lucide-react'
import type { RsvpProgress } from '../../services/business-logic/DashboardService'

interface RsvpProgressWidgetProps {
  progress: RsvpProgress
}

export function RsvpProgressWidget({ progress }: RsvpProgressWidgetProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          RSVP Progress
        </h3>
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
          <TrendingUp className="h-6 w-6 text-rose-500" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {progress.progressPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3">
          <div 
            className="bg-gradient-to-r from-rose-400 to-pink-400 h-4 rounded-full transition-all duration-500 ease-out shadow-soft"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {progress.completedResponses}
          </div>
          <div className="text-sm font-semibold text-green-800 dark:text-green-200 uppercase tracking-wide">
            Responses Received
          </div>
        </div>

        <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {progress.pendingResponses}
          </div>
          <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wide">
            Still Pending
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-rose-500" />
        </div>
        <span className="text-base text-gray-700 dark:text-gray-300">
          <span className="font-bold">{progress.completedResponses}</span> of{' '}
          <span className="font-bold">{progress.totalInvited}</span> guests have responded
        </span>
      </div>
    </div>
  )
}