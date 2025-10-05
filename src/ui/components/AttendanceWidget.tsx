import { Users, UserCheck, UserX, Clock } from 'lucide-react'
import type { AttendanceSummary } from '../../services/business-logic/DashboardService'

interface AttendanceWidgetProps {
  attendance: AttendanceSummary
}

export function AttendanceWidget({ attendance }: AttendanceWidgetProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance Summary
        </h3>
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
          <Users className="h-6 w-6 text-rose-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {attendance.totalInvited}
          </div>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Invited
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {attendance.confirmed}
          </div>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Confirmed
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {attendance.declined}
          </div>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Declined
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {attendance.pending}
          </div>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Pending
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-base font-semibold text-green-900 dark:text-green-100">
              Confirmed Rate
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {attendance.confirmedRate}%
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-base font-semibold text-red-900 dark:text-red-100">
              Declined Rate
            </span>
          </div>
          <span className="text-lg font-bold text-red-600">
            {attendance.declinedRate}%
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-base font-semibold text-blue-900 dark:text-blue-100">
              Response Rate
            </span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {attendance.responseRate}%
          </span>
        </div>
      </div>
    </div>
  )
}