import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Phone, Car, Settings } from 'lucide-react'
import { VenueService } from '../../services/business-logic/VenueService'
import type { Venue, SupportedLanguage } from '../models/Venue'

export function VenuePage() {
  const navigate = useNavigate()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en')

  const venueService = new VenueService()

  const languages: { code: SupportedLanguage; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ]

  useEffect(() => {
    loadVenue()
  }, [])

  const loadVenue = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Loading venue data...')
      const venueData = await venueService.ensureVenueExists()
      console.log('Venue data loaded:', venueData)
      setVenue(venueData)
    } catch (err) {
      console.error('Failed to load venue:', err)
      setError(`Failed to load venue information: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditVenue = () => {
    console.log('Navigating to venue edit page...')
    navigate('/venue-edit')
  }

  const getLocalizedText = (textObject: { en?: string; es?: string; nl?: string } | undefined): string => {
    if (!textObject) return ''
    return textObject[selectedLanguage] || textObject.en || ''
  }

  const formatDateTime = (date: Date | undefined): string => {
    if (!date) return 'Not set'
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }

    const locale = selectedLanguage === 'es' ? 'es-ES' : selectedLanguage === 'nl' ? 'nl-NL' : 'en-US'
    return date.toLocaleString(locale, options)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Venue</h3>
          <p className="text-base text-gray-600 dark:text-gray-400">Please wait while we load your venue information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-red-200 dark:border-red-800 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl inline-block mb-4">
              <MapPin className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-4">
              Unable to Load Venue Data
            </h3>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-lg text-red-600 dark:text-red-400 text-center">{error}</p>
            
            {error.includes('table does not exist') && (
              <div className="text-base text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/40 rounded-xl p-4">
                <p className="font-semibold mb-2">Setup Required:</p>
                <p className="mb-2">Please run the <code className="bg-red-200 dark:bg-red-800 px-2 py-1 rounded font-mono text-sm">sql/05_create_venues_table.sql</code> migration in your Supabase database.</p>
                <p>See VENUE_SETUP.md for detailed instructions.</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <button
              onClick={loadVenue}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold shadow-soft hover:shadow-md transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="p-6 space-y-8">
        {/* Header - H1 Level */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <MapPin className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Venue Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage your wedding venue details and information
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      selectedLanguage === lang.code
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleEditVenue}
                className="flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Settings className="h-5 w-5" />
                <span>Edit Venue</span>
              </button>
            </div>
          </div>
        </div>

        {venue && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Venue Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-rose-500 rounded-2xl shadow-lg">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Venue Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    Venue Name
                  </label>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {getLocalizedText(venue.venueName) || 'Not set'}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    Address
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {getLocalizedText(venue.venueAddress) || 'Not set'}
                    {venue.country && `, ${venue.country}`}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    Special Instructions
                  </label>
                  <p className="text-base text-gray-900 dark:text-white leading-relaxed">
                    {getLocalizedText(venue.specialInstructions) || 'None'}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Event Schedule
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ceremony & reception times</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    Ceremony Time
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {formatDateTime(venue.ceremonyTime)}
                  </p>
                  {venue.ceremonyDetails && (
                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getLocalizedText(venue.ceremonyDetails)}
                    </p>
                  )}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    Reception Time
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {formatDateTime(venue.receptionTime)}
                  </p>
                  {venue.receptionDetails && (
                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getLocalizedText(venue.receptionDetails)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-green-500 rounded-2xl shadow-lg">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Contact Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Venue contact details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {venue.contactName && (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-6">
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      Contact Person
                    </label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{venue.contactName}</p>
                  </div>
                )}
                
                {venue.contactPhone && (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-6">
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      Phone
                    </label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{venue.contactPhone}</p>
                  </div>
                )}
                
                {venue.contactEmail && (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-6">
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      Email
                    </label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{venue.contactEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transportation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-purple-500 rounded-2xl shadow-lg">
                  <Car className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transportation
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Getting to the venue</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    Transportation Information
                  </label>
                  <p className="text-base text-gray-900 dark:text-white leading-relaxed">
                    {getLocalizedText(venue.transportationInfo) || 'No transportation information provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}