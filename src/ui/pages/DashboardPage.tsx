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
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Wedding Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your wedding planning progress and guest responses in real-time
              </p>
            </div>
          </div>
        </div>

        {!hasGuests ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-12 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl inline-block mb-6">
                <Calendar className="h-16 w-16 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Planning?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Your dashboard will come to life once you start adding guests to your wedding. 
                Add your first guests to see beautiful analytics and tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/guests'}
                  className="px-5 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-semibold text-sm shadow-soft hover:shadow-md"
                >
                  Add Your First Guests
                </button>
                <button
                  onClick={() => window.location.href = '/guests'}
                  className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold text-sm shadow-soft hover:shadow-md"
                >
                  Manage Guest List
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Grid - Number-focused layout */
          <div className="space-y-8">
            {/* Top Row - Key Numbers (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Attending Card */}
              <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                        {stats.quickNumbers.totalAttending}
                      </div>
                      <div className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                        Attending
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <span className="font-bold text-gray-900 dark:text-white">{stats.quickNumbers.adultsAttending}</span> adults • 
                      <span className="font-bold text-gray-900 dark:text-white ml-1">{stats.quickNumbers.childrenAttending}</span> children
                    </div>
                  </div>
                </div>
              </div>

              {/* Needs Response Card */}
              <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-amber-500 rounded-2xl shadow-lg">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                        {stats.quickNumbers.needsResponse}
                      </div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Needs Response
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      out of <span className="font-bold text-gray-900 dark:text-white">{stats.attendance.totalInvited}</span> invited
                    </div>
                  </div>
                </div>
              </div>

              {/* Declined Card */}
              <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-red-500 rounded-2xl shadow-lg">
                      <X className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                        {stats.quickNumbers.totalDeclined}
                      </div>
                      <div className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                        Declined
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      not attending
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Demographics & Location (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Age Breakdown */}
              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-purple-500 rounded-2xl shadow-lg">
                    <UserCheck className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Age Groups</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Guest demographics</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-600 rounded-xl shadow-md">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">Adults</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {stats.demographics.adults.confirmed} attending • {stats.demographics.adults.pending} pending
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{stats.demographics.adults.total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                          <Baby className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">Children</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {stats.demographics.children.confirmed} attending • {stats.demographics.children.pending} pending
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{stats.demographics.children.total}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Origins */}
              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guest Origins</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Where guests are from</p>
                  </div>
                </div>

                {stats.countryStats.totalCountries > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4">
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Guests from <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.countryStats.totalCountries}</span> {stats.countryStats.totalCountries === 1 ? 'country' : 'countries'}
                      </div>
                    </div>
                    {stats.countryStats.topCountries.slice(0, 4).map((country, index) => (
                      <div key={country.country} className="bg-white dark:bg-gray-700/30 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded-full shadow-lg ${
                              index === 0 ? 'bg-emerald-500' : 
                              index === 1 ? 'bg-blue-500' : 
                              index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{country.country}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{country.confirmedCount} attending</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{country.guestCount}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl inline-block mb-6">
                      <MapPin className="h-16 w-16 text-emerald-400 dark:text-emerald-500" />
                    </div>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      No address information available yet
                    </p>
                  </div>
                )}
              </div>

              {/* Partner Invites */}
              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-rose-500 rounded-2xl shadow-lg">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inviter Breakdown</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Who invited whom</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(stats.inviterStats).length > 0 ? (
                    Object.entries(stats.inviterStats).map(([coupleName, inviterData], index) => (
                      <div 
                        key={coupleName}
                        className={`rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${
                          index % 2 === 0 
                            ? 'bg-rose-50 dark:bg-rose-900/20' 
                            : 'bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl shadow-md ${
                              index % 2 === 0 
                                ? 'bg-rose-500' 
                                : 'bg-blue-500'
                            }`}>
                              <Heart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{coupleName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {inviterData.confirmed} confirmed • {inviterData.pending} pending
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-gray-900 dark:text-white">{inviterData.total}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-3xl inline-block mb-6">
                        <Heart className="h-16 w-16 text-rose-400 dark:text-rose-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
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