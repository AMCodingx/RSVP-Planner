import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeService } from '../../services/business-logic/QRCodeService'
import { GuestService } from '../../services/business-logic/GuestService'
import { VenueService } from '../../services/business-logic/VenueService'
import type { Guest, Group } from '../models/Guest'
import type { Venue, SupportedLanguage } from '../models/Venue'
import { Check, X, Heart, Calendar, MapPin, Clock, Users } from 'lucide-react'

export function GuestRSVPPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [venue, setVenue] = useState<Venue | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null)
  const [showLanguageSelector, setShowLanguageSelector] = useState(true)
  const [rsvpResponses, setRsvpResponses] = useState<Record<string, 'confirmed' | 'declined'>>({})
  const [specialNotes, setSpecialNotes] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const qrCodeService = new QRCodeService()
  const guestService = new GuestService()
  const venueService = new VenueService()

  // Dutch first, Spanish second, English third
  const languages: { code: SupportedLanguage; name: string; nativeName: string; flag: string }[] = [
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '��' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' }
  ]

  // Multilingual text for language selection
  const languageSelectionText = {
    title: {
      nl: 'Kies je taal',
      es: 'Elige tu idioma',
      en: 'Choose your language'
    },
    subtitle: {
      nl: 'Selecteer je voorkeurstaal voor deze trouwuitnodiging',
      es: 'Selecciona tu idioma preferido para esta invitación de boda',
      en: 'Select your preferred language for this wedding invitation'
    },
    continue: {
      nl: 'Doorgaan',
      es: 'Continuar',
      en: 'Continue'
    }
  }

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('rsvp-language') as SupportedLanguage
    if (savedLanguage && ['nl', 'es', 'en'].includes(savedLanguage)) {
      setSelectedLanguage(savedLanguage)
      setShowLanguageSelector(false)
    } else {
      // Auto-detect with Dutch priority
      const browserLang = navigator.language.substring(0, 2) as SupportedLanguage
      if (browserLang === 'nl') {
        setSelectedLanguage('nl')
        setShowLanguageSelector(false)
      } else if (browserLang === 'es') {
        setSelectedLanguage('es')
        setShowLanguageSelector(false)
      } else {
        // Show language selector for other languages or default to English
        setSelectedLanguage(null)
        setShowLanguageSelector(true)
      }
    }

    if (!token) {
      setError('Invalid invitation link')
      setIsLoading(false)
      return
    }

    if (!showLanguageSelector) {
      loadGroupData()
    }
  }, [token, showLanguageSelector])

  const handleLanguageSelection = (language: SupportedLanguage) => {
    setSelectedLanguage(language)
    localStorage.setItem('rsvp-language', language)
    setShowLanguageSelector(false)
    loadGroupData()
  }

  const getLocalizedText = (textObject: { en?: string; es?: string; nl?: string } | undefined): string => {
    if (!textObject || !selectedLanguage) return ''
    return textObject[selectedLanguage] || textObject.en || ''
  }

  const formatDateTime = (date: Date | undefined): string => {
    if (!date || !selectedLanguage) return ''
    
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

  const loadGroupData = async () => {
    try {
      setIsLoading(true)
      
      if (!qrCodeService.validateToken(token!)) {
        throw new Error('Invalid or expired invitation link')
      }

      const groupId = qrCodeService.extractGroupIdFromToken(token!)
      if (!groupId) {
        throw new Error('Unable to find invitation details')
      }

      // Load group, guest and venue data
      const [groupData, guestsData, venueData] = await Promise.all([
        guestService.getGroupById(groupId),
        guestService.getGuestsByGroupId(groupId),
        venueService.getVenue()
      ])

      if (!groupData) {
        throw new Error('Invitation group not found')
      }

      setGroup(groupData)
      setGuests(guestsData)
      setVenue(venueData)

      // Initialize RSVP responses with current status
      const initialResponses: Record<string, 'confirmed' | 'declined'> = {}
      const initialNotes: Record<string, string> = {}
      
      guestsData.forEach((guest: Guest) => {
        if (guest.rsvpStatus !== 'pending') {
          initialResponses[guest.id] = guest.rsvpStatus
        }
        if (guest.specialNotes) {
          initialNotes[guest.id] = guest.specialNotes
        }
      })
      
      setRsvpResponses(initialResponses)
      setSpecialNotes(initialNotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRsvpChange = (guestId: string, response: 'confirmed' | 'declined') => {
    setRsvpResponses(prev => ({
      ...prev,
      [guestId]: response
    }))
  }

  const handleNotesChange = (guestId: string, notes: string) => {
    setSpecialNotes(prev => ({
      ...prev,
      [guestId]: notes
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError('')

      // Update each guest's RSVP status
      for (const guest of guests) {
        const newStatus = rsvpResponses[guest.id] || 'pending'
        const notes = specialNotes[guest.id] || ''
        
        await guestService.updateGuest(guest.id, {
          ...guest,
          rsvpStatus: newStatus,
          specialNotes: notes || undefined
        })
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRespondedCount = () => {
    return Object.keys(rsvpResponses).length
  }

  const getConfirmedCount = () => {
    return Object.values(rsvpResponses).filter(r => r === 'confirmed').length
  }

  // Show language selection screen first
  if (showLanguageSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full mb-6 shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{languageSelectionText.title.nl}</h1>
              <h1 className="text-xl font-semibold text-gray-700">{languageSelectionText.title.es}</h1>
              <h1 className="text-lg font-medium text-gray-600">{languageSelectionText.title.en}</h1>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-gray-600 text-sm">{languageSelectionText.subtitle.nl}</p>
              <p className="text-gray-500 text-sm">{languageSelectionText.subtitle.es}</p>
              <p className="text-gray-400 text-sm">{languageSelectionText.subtitle.en}</p>
            </div>
          </div>

          {/* Language Options */}
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelection(lang.code)}
                className="w-full p-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-rose-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 group-hover:text-rose-600">
                        {lang.nativeName}
                      </div>
                      <div className="text-sm text-gray-500">{lang.name}</div>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-rose-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              {languageSelectionText.subtitle.en}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedLanguage === 'nl' ? 'Uitnodiging laden...' : 
             selectedLanguage === 'es' ? 'Cargando invitación...' : 
             'Loading your invitation...'}
          </h2>
          <p className="text-gray-600">
            {selectedLanguage === 'nl' ? 'Even geduld alstublieft' : 
             selectedLanguage === 'es' ? 'Por favor espera' : 
             'Please wait a moment'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {selectedLanguage === 'nl' ? 'Oeps!' : 
             selectedLanguage === 'es' ? '¡Ups!' : 
             'Oops!'}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {selectedLanguage === 'nl' ? 'Naar startpagina' : 
             selectedLanguage === 'es' ? 'Ir al inicio' : 
             'Go to Home'}
          </button>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedLanguage === 'nl' ? 'Dank je wel!' : 
             selectedLanguage === 'es' ? '¡Gracias!' : 
             'Thank You!'}
          </h1>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {selectedLanguage === 'nl' ? 'Je RSVP is succesvol verzonden.' : 
             selectedLanguage === 'es' ? 'Su RSVP ha sido enviado exitosamente.' : 
             'Your RSVP has been submitted successfully.'}
          </p>
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium">
              {selectedLanguage === 'nl' ? 'We zijn opgewonden om met je te vieren!' : 
               selectedLanguage === 'es' ? '¡Estamos emocionados de celebrar contigo!' : 
               "We're excited to celebrate with you!"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full mb-3 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {selectedLanguage === 'nl' ? 'Trouwuitnodiging' : 
                 selectedLanguage === 'es' ? 'Invitación de Boda' : 
                 'Wedding Invitation'}
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {selectedLanguage === 'nl' ? 'Gelieve te reageren op deze uitnodiging' : 
                 selectedLanguage === 'es' ? 'Por favor responda a esta invitación' : 
                 'Please respond to this invitation'}
              </p>
            </div>
            
            {/* Enhanced Language Selector */}
            <div className="flex flex-col items-end space-y-2">
              <div className="text-xs text-gray-500 font-medium">
                {selectedLanguage === 'nl' ? 'Taal' : 
                 selectedLanguage === 'es' ? 'Idioma' : 
                 'Language'}
              </div>
              <div className="flex space-x-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code)
                      localStorage.setItem('rsvp-language', lang.code)
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedLanguage === lang.code
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="block">{lang.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Wedding Details Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {selectedLanguage === 'nl' ? 'Trouwdetails' : 
               selectedLanguage === 'es' ? 'Detalles de la Boda' : 
               'Wedding Details'}
            </h2>
          </div>
          
          {venue ? (
            <div className="space-y-6">
              {/* Venue Name and Address */}
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  {getLocalizedText(venue.venueName) || 'Wedding Venue'}
                </h3>
                <div className="flex items-start gap-4 text-gray-700">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 rounded-lg flex-shrink-0 mt-1">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{getLocalizedText(venue.venueAddress)}</div>
                    {venue.country && <div className="text-sm text-gray-500 mt-1">{venue.country}</div>}
                  </div>
                </div>
              </div>

              {/* Ceremony Details */}
              {venue.ceremonyTime && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border-l-4 border-rose-500">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="inline-flex items-center justify-center w-6 h-6 bg-rose-100 rounded-lg">
                      <Heart className="h-3 w-3 text-rose-600" />
                    </div>
                    {selectedLanguage === 'nl' ? 'Ceremonie' : 
                     selectedLanguage === 'es' ? 'Ceremonia' : 
                     'Ceremony'}
                  </h4>
                  <div className="flex items-center gap-3 text-gray-700 mb-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 rounded-lg">
                      <Clock className="h-4 w-4 text-rose-600" />
                    </div>
                    <span className="font-medium">{formatDateTime(venue.ceremonyTime)}</span>
                  </div>
                  {venue.ceremonyDetails && (
                    <p className="text-gray-600 ml-11 leading-relaxed">
                      {getLocalizedText(venue.ceremonyDetails)}
                    </p>
                  )}
                </div>
              )}

              {/* Reception Details */}
              {venue.receptionTime && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-500">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 rounded-lg">
                      <Users className="h-3 w-3 text-amber-600" />
                    </div>
                    {selectedLanguage === 'nl' ? 'Receptie' : 
                     selectedLanguage === 'es' ? 'Recepción' : 
                     'Reception'}
                  </h4>
                  <div className="flex items-center gap-3 text-gray-700 mb-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="font-medium">{formatDateTime(venue.receptionTime)}</span>
                  </div>
                  {venue.receptionDetails && (
                    <p className="text-gray-600 ml-11 leading-relaxed">
                      {getLocalizedText(venue.receptionDetails)}
                    </p>
                  )}
                </div>
              )}

              {/* Transportation & Special Instructions */}
              {(venue.transportationInfo && getLocalizedText(venue.transportationInfo)) && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-900 mb-3">
                    {selectedLanguage === 'nl' ? 'Vervoer' : 
                     selectedLanguage === 'es' ? 'Transporte' : 
                     'Transportation'}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {getLocalizedText(venue.transportationInfo)}
                  </p>
                </div>
              )}

              {(venue.specialInstructions && getLocalizedText(venue.specialInstructions)) && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-l-4 border-purple-500">
                  <h4 className="font-bold text-gray-900 mb-3">
                    {selectedLanguage === 'nl' ? 'Speciale Instructies' : 
                     selectedLanguage === 'es' ? 'Instrucciones Especiales' : 
                     'Special Instructions'}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {getLocalizedText(venue.specialInstructions)}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              {(venue.contactName || venue.contactPhone || venue.contactEmail) && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-4">
                    {selectedLanguage === 'nl' ? 'Contact' : 
                     selectedLanguage === 'es' ? 'Contacto' : 
                     'Contact'}
                  </h4>
                  <div className="space-y-2">
                    {venue.contactName && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">{venue.contactName}</span>
                      </div>
                    )}
                    {venue.contactPhone && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-gray-600">{venue.contactPhone}</span>
                      </div>
                    )}
                    {venue.contactEmail && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-gray-600">{venue.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                {selectedLanguage === 'nl' ? 'Details volgen binnenkort' : 
                 selectedLanguage === 'es' ? 'Detalles próximamente' : 
                 'Details coming soon'}
              </p>
            </div>
          )}
        </div>

        {/* Group Info */}
        {group && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{group.name}</h2>
                <p className="text-gray-600">
                  {selectedLanguage === 'nl' ? 'Uitnodiging groep' : 
                   selectedLanguage === 'es' ? 'Grupo de invitación' : 
                   'Invitation group'}
                </p>
              </div>
            </div>
            
            {group.address && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectedLanguage === 'nl' ? 'Uitnodiging verzonden naar:' : 
                   selectedLanguage === 'es' ? 'Invitación enviada a:' : 
                   'Invitation sent to:'}
                </p>
                <div className="space-y-1 text-gray-800">
                  <p className="font-medium">{group.address.streetAddress}</p>
                  <p>
                    {group.address.city}, {group.address.stateProvince} {group.address.postalCode}
                  </p>
                  {group.address.country && <p>{group.address.country}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RSVP Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {selectedLanguage === 'nl' ? 'Gelieve te antwoorden' : 
                 selectedLanguage === 'es' ? 'Por favor responder' : 
                 'Please Respond'}
              </h2>
              <p className="text-gray-600">
                {selectedLanguage === 'nl' ? 'Laat ons weten of je aanwezig bent' : 
                 selectedLanguage === 'es' ? 'Háznos saber si asistirás' : 
                 'Let us know if you will attend'}
              </p>
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            {guests.map((guest) => (
              <div key={guest.id} className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </h3>
                    {guest.ageCategory === 'child' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                        {selectedLanguage === 'nl' ? 'Kind' : 
                         selectedLanguage === 'es' ? 'Niño' : 
                         'Child'}
                      </span>
                    )}
                  </div>
                </div>

                {/* RSVP Buttons */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                  <button
                    onClick={() => handleRsvpChange(guest.id, 'confirmed')}
                    className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      rsvpResponses[guest.id] === 'confirmed'
                        ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'border-gray-300 hover:border-green-300 text-gray-700 bg-white hover:bg-green-50'
                    }`}
                  >
                    <Check className="h-6 w-6 mx-auto mb-2" />
                    <span className="block text-sm md:text-base font-bold">
                      {selectedLanguage === 'nl' ? 'Zal aanwezig zijn' : 
                       selectedLanguage === 'es' ? 'Asistiré' : 
                       'Will Attend'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleRsvpChange(guest.id, 'declined')}
                    className={`py-4 px-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      rsvpResponses[guest.id] === 'declined'
                        ? 'border-red-500 bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                        : 'border-gray-300 hover:border-red-300 text-gray-700 bg-white hover:bg-red-50'
                    }`}
                  >
                    <X className="h-6 w-6 mx-auto mb-2" />
                    <span className="block text-sm md:text-base font-bold">
                      {selectedLanguage === 'nl' ? 'Kan niet aanwezig zijn' : 
                       selectedLanguage === 'es' ? 'No podré asistir' : 
                       'Cannot Attend'}
                    </span>
                  </button>
                </div>

                {/* Special Notes */}
                <div>
                  <label htmlFor={`notes-${guest.id}`} className="block text-sm font-bold text-gray-700 mb-3">
                    {selectedLanguage === 'nl' ? 'Dieetbeperkingen of speciale verzoeken (optioneel)' : 
                     selectedLanguage === 'es' ? 'Restricciones dietéticas o solicitudes especiales (opcional)' : 
                     'Dietary restrictions or special requests (optional)'}
                  </label>
                  <textarea
                    id={`notes-${guest.id}`}
                    rows={3}
                    value={specialNotes[guest.id] || ''}
                    onChange={(e) => handleNotesChange(guest.id, e.target.value)}
                    placeholder={
                      selectedLanguage === 'nl' ? 'Dieetbeperkingen, toegankelijkheidswensen of speciale verzoeken...' : 
                      selectedLanguage === 'es' ? 'Restricciones dietéticas, necesidades de accesibilidad o solicitudes especiales...' : 
                      'Any dietary restrictions, accessibility needs, or special requests...'
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-rose-500 transition-colors duration-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">
                {selectedLanguage === 'nl' ? 'Voortgang' : 
                 selectedLanguage === 'es' ? 'Progreso' : 
                 'Progress'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-indigo-100">
                <div className="text-2xl font-bold text-indigo-600">{getRespondedCount()}</div>
                <div className="text-sm text-gray-600">
                  {selectedLanguage === 'nl' ? 'van' : selectedLanguage === 'es' ? 'de' : 'of'} {guests.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedLanguage === 'nl' ? 'Reacties voltooid' : 
                   selectedLanguage === 'es' ? 'Respuestas completadas' : 
                   'Responses completed'}
                </div>
              </div>
              
              {getConfirmedCount() > 0 && (
                <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{getConfirmedCount()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedLanguage === 'nl' ? 'Bevestigd aanwezig' : 
                     selectedLanguage === 'es' ? 'Confirmados asistir' : 
                     'Confirmed attending'}
                  </div>
                </div>
              )}
              
              {Object.values(rsvpResponses).filter(r => r === 'declined').length > 0 && (
                <div className="text-center p-4 bg-white rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(rsvpResponses).filter(r => r === 'declined').length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedLanguage === 'nl' ? 'Afwezig' : 
                     selectedLanguage === 'es' ? 'No asistirán' : 
                     'Cannot attend'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {selectedLanguage === 'nl' ? 'Voltooiingspercentage' : 
                   selectedLanguage === 'es' ? 'Porcentaje de finalización' : 
                   'Completion percentage'}
                </span>
                <span>{Math.round((getRespondedCount() / guests.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(getRespondedCount() / guests.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || getRespondedCount() === 0}
              className="w-full md:w-auto min-w-64 py-4 px-8 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {selectedLanguage === 'nl' ? 'Verzenden...' : 
                     selectedLanguage === 'es' ? 'Enviando...' : 
                     'Submitting...'}
                  </span>
                </div>
              ) : (
                <span>
                  {selectedLanguage === 'nl' ? 'RSVP Verzenden' : 
                   selectedLanguage === 'es' ? 'Enviar RSVP' : 
                   'Submit RSVP'}
                </span>
              )}
            </button>

            {getRespondedCount() === 0 && (
              <p className="text-sm text-gray-500 mt-4 max-w-md mx-auto">
                {selectedLanguage === 'nl' ? 'Gelieve voor tenminste één gast te reageren om te verzenden' : 
                 selectedLanguage === 'es' ? 'Por favor responda por al menos un invitado para enviar' : 
                 'Please respond for at least one guest to submit'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="text-sm">
              {selectedLanguage === 'nl' ? 'Met liefde gemaakt voor jullie speciale dag' : 
               selectedLanguage === 'es' ? 'Hecho con amor para su día especial' : 
               'Made with love for your special day'}
            </span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  )
}