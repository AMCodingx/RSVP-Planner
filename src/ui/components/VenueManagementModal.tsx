import { useState, useEffect } from 'react'
import { MapPin, Clock, Phone, Car, Save, X } from 'lucide-react'
import { VenueService } from '../../services/business-logic/VenueService'
import type { Venue, SupportedLanguage } from '../models/Venue'

interface VenueManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onVenueUpdated?: (venue: Venue) => void
}

interface VenueFormData {
  venueName: { en: string; es: string; nl: string }
  venueAddress: { en: string; es: string; nl: string }
  country: string
  ceremonyTime: string
  ceremonyDetails: { en: string; es: string; nl: string }
  receptionTime: string
  receptionDetails: { en: string; es: string; nl: string }
  contactName: string
  contactPhone: string
  contactEmail: string
  specialInstructions: { en: string; es: string; nl: string }
  transportationInfo: { en: string; es: string; nl: string }
}

export function VenueManagementModal({ isOpen, onClose, onVenueUpdated }: VenueManagementModalProps) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('en')

  const [formData, setFormData] = useState<VenueFormData>({
    venueName: { en: '', es: '', nl: '' },
    venueAddress: { en: '', es: '', nl: '' },
    country: 'Curacao',
    ceremonyTime: '',
    ceremonyDetails: { en: '', es: '', nl: '' },
    receptionTime: '',
    receptionDetails: { en: '', es: '', nl: '' },
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialInstructions: { en: '', es: '', nl: '' },
    transportationInfo: { en: '', es: '', nl: '' }
  })

  const venueService = new VenueService()

  const languages: { code: SupportedLanguage; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ]

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, loading venue...')
      loadVenue()
    }
  }, [isOpen])

  const loadVenue = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Starting venue loading in modal...')
      const venueData = await venueService.ensureVenueExists()
      console.log('Venue data loaded in modal:', venueData)
      setVenue(venueData)
      setFormData({
        venueName: {
          en: venueData.venueName.en || '',
          es: venueData.venueName.es || '',
          nl: venueData.venueName.nl || ''
        },
        venueAddress: {
          en: venueData.venueAddress.en || '',
          es: venueData.venueAddress.es || '',
          nl: venueData.venueAddress.nl || ''
        },
        country: venueData.country || 'Curacao',
        ceremonyTime: venueData.ceremonyTime ? venueData.ceremonyTime.toISOString().slice(0, 16) : '',
        ceremonyDetails: {
          en: venueData.ceremonyDetails?.en || '',
          es: venueData.ceremonyDetails?.es || '',
          nl: venueData.ceremonyDetails?.nl || ''
        },
        receptionTime: venueData.receptionTime ? venueData.receptionTime.toISOString().slice(0, 16) : '',
        receptionDetails: {
          en: venueData.receptionDetails?.en || '',
          es: venueData.receptionDetails?.es || '',
          nl: venueData.receptionDetails?.nl || ''
        },
        contactName: venueData.contactName || '',
        contactPhone: venueData.contactPhone || '',
        contactEmail: venueData.contactEmail || '',
        specialInstructions: {
          en: venueData.specialInstructions?.en || '',
          es: venueData.specialInstructions?.es || '',
          nl: venueData.specialInstructions?.nl || ''
        },
        transportationInfo: {
          en: venueData.transportationInfo?.en || '',
          es: venueData.transportationInfo?.es || '',
          nl: venueData.transportationInfo?.nl || ''
        }
      })
    } catch (err) {
      console.error('Failed to load venue in modal:', err)
      setError(`Failed to load venue information: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateLanguageField = (field: 'venueName' | 'venueAddress' | 'ceremonyDetails' | 'receptionDetails' | 'specialInstructions' | 'transportationInfo', language: SupportedLanguage, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }))
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      setError(null)
      
      const venueData = {
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        country: formData.country,
        ceremonyTime: formData.ceremonyTime ? new Date(formData.ceremonyTime) : undefined,
        ceremonyDetails: formData.ceremonyDetails,
        receptionTime: formData.receptionTime ? new Date(formData.receptionTime) : undefined,
        receptionDetails: formData.receptionDetails,
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        specialInstructions: formData.specialInstructions,
        transportationInfo: formData.transportationInfo
      }

      let updatedVenue: Venue
      if (venue?.id) {
        updatedVenue = await venueService.updateVenue(venue.id, venueData)
      } else {
        updatedVenue = await venueService.createVenue({
          ...venueData,
          country: formData.country
        })
      }

      setVenue(updatedVenue)
      onVenueUpdated?.(updatedVenue)
      onClose()
    } catch (err) {
      console.error('Failed to update venue:', err)
      setError('Failed to update venue information')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-rose-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Venue Management
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                      Unable to Load Venue Data
                    </h4>
                    <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
                    {error.includes('table does not exist') && (
                      <div className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded p-3 mt-3">
                        <p className="font-medium mb-1">Setup Required:</p>
                        <p>Please run the <code className="bg-red-200 dark:bg-red-800 px-1 rounded">sql/05_create_venues_table.sql</code> migration in your Supabase database.</p>
                        <p className="mt-1">See VENUE_SETUP.md for detailed instructions.</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={loadVenue}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Language Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setActiveLanguage(lang.code)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeLanguage === lang.code
                              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Venue Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin className="h-5 w-5 text-rose-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Venue Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Venue Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Venue Name ({languages.find(l => l.code === activeLanguage)?.name})
                        </label>
                        <input
                          type="text"
                          value={formData.venueName[activeLanguage]}
                          onChange={(e) => updateLanguageField('venueName', activeLanguage, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={`Enter venue name in ${languages.find(l => l.code === activeLanguage)?.name}`}
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => updateField('country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    {/* Venue Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Venue Address ({languages.find(l => l.code === activeLanguage)?.name})
                      </label>
                      <textarea
                        value={formData.venueAddress[activeLanguage]}
                        onChange={(e) => updateLanguageField('venueAddress', activeLanguage, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Enter venue address in ${languages.find(l => l.code === activeLanguage)?.name}`}
                      />
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Special Instructions ({languages.find(l => l.code === activeLanguage)?.name})
                      </label>
                      <textarea
                        value={formData.specialInstructions[activeLanguage]}
                        onChange={(e) => updateLanguageField('specialInstructions', activeLanguage, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Enter special instructions in ${languages.find(l => l.code === activeLanguage)?.name}`}
                      />
                    </div>
                  </div>

                  {/* Event Schedule Section */}
                  <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="h-5 w-5 text-rose-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Event Schedule
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Ceremony Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ceremony Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.ceremonyTime}
                          onChange={(e) => updateField('ceremonyTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Reception Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reception Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.receptionTime}
                          onChange={(e) => updateField('receptionTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Ceremony Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ceremony Details ({languages.find(l => l.code === activeLanguage)?.name})
                      </label>
                      <textarea
                        value={formData.ceremonyDetails[activeLanguage]}
                        onChange={(e) => updateLanguageField('ceremonyDetails', activeLanguage, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Enter ceremony details in ${languages.find(l => l.code === activeLanguage)?.name}`}
                      />
                    </div>

                    {/* Reception Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reception Details ({languages.find(l => l.code === activeLanguage)?.name})
                      </label>
                      <textarea
                        value={formData.receptionDetails[activeLanguage]}
                        onChange={(e) => updateLanguageField('receptionDetails', activeLanguage, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Enter reception details in ${languages.find(l => l.code === activeLanguage)?.name}`}
                      />
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Phone className="h-5 w-5 text-rose-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Contact Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={formData.contactName}
                          onChange={(e) => updateField('contactName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Contact person"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => updateField('contactPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => updateField('contactEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transportation Section */}
                  <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Car className="h-5 w-5 text-rose-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Transportation
                      </h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transportation Information ({languages.find(l => l.code === activeLanguage)?.name})
                      </label>
                      <textarea
                        value={formData.transportationInfo[activeLanguage]}
                        onChange={(e) => updateLanguageField('transportationInfo', activeLanguage, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Enter transportation information in ${languages.find(l => l.code === activeLanguage)?.name}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isLoading && !error && (
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}