import { useState, useEffect } from 'react'
import { Heart, Calendar, MapPin, Check, Clock, X, UserCheck, Baby } from 'lucide-react'
import { DashboardService } from '../../services/business-logic/DashboardService'
import type { DashboardStats } from '../../services/business-logic/DashboardService'

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const dashboardService = new DashboardService()
        const dashboardStats = await dashboardService.getDashboardStats()
        setStats(dashboardStats)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Dashboard</h3>
            <p className="text-base text-gray-600 dark:text-gray-400">Please wait while we gather your wedding data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl inline-block mb-6">
              <Heart className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {error || 'Something went wrong while loading your dashboard.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-semibold shadow-soft hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasGuests = stats.attendance.totalInvited > 0

  return (
    <div className="max-w-full">
      <div className="p-6">
        {/* Header - H1 Level */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Wedding Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Track your wedding planning progress and guest responses
              </p>
            </div>
          </div>
        </div>

        {!hasGuests ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 border border-gray-200 dark:border-gray-700 max-w-xl mx-auto">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl inline-block mb-4">
                <Calendar className="h-12 w-12 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Start Planning?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Your dashboard will come to life once you start adding guests to your wedding.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/guests'}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium text-sm"
                >
                  Add Your First Guests
                </button>
                <button
                  onClick={() => window.location.href = '/guests'}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  Manage Guest List
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Grid - Number-focused layout */
          <div className="space-y-4">
            {/* Top Row - Key Numbers (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Attending Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-green-500 rounded-lg">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Attending
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {stats.quickNumbers.totalAttending}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.quickNumbers.adultsAttending}</span> adults • 
                    <span className="font-semibold text-gray-900 dark:text-white ml-1">{stats.quickNumbers.childrenAttending}</span> children
                  </div>
                </div>
              </div>

              {/* Needs Response Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Needs Response
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {stats.quickNumbers.needsResponse}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    out of <span className="font-semibold text-gray-900 dark:text-white">{stats.attendance.totalInvited}</span> invited
                  </div>
                </div>
              </div>

              {/* Declined Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-red-500 rounded-lg">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Declined
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {stats.quickNumbers.totalDeclined}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    not attending
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Demographics & Location (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Age Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Age Groups</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Guest demographics</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-600 rounded-md">
                          <UserCheck className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Adults</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.demographics.adults.confirmed} attending • {stats.demographics.adults.pending} pending
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.demographics.adults.total}</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-md">
                          <Baby className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Children</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.demographics.children.confirmed} attending • {stats.demographics.children.pending} pending
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.demographics.children.total}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Origins */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Guest Origins</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Where guests are from</p>
                  </div>
                </div>

                {stats.countryStats.totalCountries > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Guests from <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.countryStats.totalCountries}</span> {stats.countryStats.totalCountries === 1 ? 'country' : 'countries'}
                      </div>
                    </div>
                    {stats.countryStats.topCountries.slice(0, 4).map((country, index) => (
                      <div key={country.country} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              index === 0 ? 'bg-emerald-500' : 
                              index === 1 ? 'bg-blue-500' : 
                              index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{country.country}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{country.confirmedCount} attending</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{country.guestCount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl inline-block mb-3">
                      <MapPin className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      No address information available yet
                    </p>
                  </div>
                )}
              </div>

              {/* Partner Invites */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-rose-500 rounded-lg">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Inviter Breakdown</h2>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(stats.inviterStats).length > 0 ? (
                    Object.entries(stats.inviterStats).map(([coupleName, inviterData], index) => (
                      <div 
                        key={coupleName}
                        className={`rounded-lg p-4 ${
                          index % 2 === 0 
                            ? 'bg-rose-50 dark:bg-rose-900/20' 
                            : 'bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-md ${
                              index % 2 === 0 
                                ? 'bg-rose-500' 
                                : 'bg-blue-500'
                            }`}>
                              <Heart className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{coupleName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {inviterData.confirmed} confirmed • {inviterData.pending} pending
                              </div>
                            </div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{inviterData.total}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl inline-block mb-3">
                        <Heart className="h-10 w-10 text-rose-400 dark:text-rose-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        No couple data available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}