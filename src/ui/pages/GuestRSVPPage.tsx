import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeService } from '../../services/business-logic/QRCodeService'
import { GuestService } from '../../services/business-logic/GuestService'
import { VenueService } from '../../services/business-logic/VenueService'
import type { Guest } from '../models/Guest'
import type { Venue, SupportedLanguage } from '../models/Venue'
import { Check, X, Heart, Calendar, MapPin, Clock, Users } from 'lucide-react'
import coupleImage from '../../assets/couple.png'
import usImage from '../../assets/us.png'

export function GuestRSVPPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [guests, setGuests] = useState<Guest[]>([])
  const [venue, setVenue] = useState<Venue | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null)
  const [showLanguageSelector, setShowLanguageSelector] = useState(true)
  const [rsvpResponses, setRsvpResponses] = useState<Record<string, 'confirmed' | 'declined'>>({})
  const [guestEmails, setGuestEmails] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  const qrCodeService = new QRCodeService()
  const guestService = new GuestService()
  const venueService = new VenueService()

  // Dutch first, Spanish second, English third
  const languages: { code: SupportedLanguage; name: string; nativeName: string; flag: string }[] = [
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
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

  const text = {
    hero: {
      subtitle: {
        nl: 'U bent uitgenodigd om onze speciale dag te vieren',
        es: 'Estás invitado a celebrar nuestro día especial',
        en: 'You are invited to celebrate our special day'
      }
    },
    wedding: {
      title: {
        nl: 'Bruiloft Details',
        es: 'Detalles de la Boda',
        en: 'Wedding Details'
      }
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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'wedding-details', 'rsvp-form']
      const scrollPosition = window.scrollY + window.innerHeight / 3

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 20
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

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
      minute: '2-digit'
    }

    const locale = selectedLanguage === 'es' ? 'es-ES' : selectedLanguage === 'nl' ? 'nl-NL' : 'en-US'
    const dateString = date.toLocaleString(locale, options)
    
    const timeZoneText = selectedLanguage === 'nl' ? 'Curaçao tijd' :
                        selectedLanguage === 'es' ? 'Hora Curazao' :
                        'Curaçao Time'

    return `${dateString} (${timeZoneText})`
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

      setGuests(guestsData)
      setVenue(venueData)

      // Initialize RSVP responses and emails with current status
      const initialResponses: Record<string, 'confirmed' | 'declined'> = {}
      const initialEmails: Record<string, string> = {}
      
      guestsData.forEach((guest: Guest) => {
        if (guest.rsvpStatus !== 'pending') {
          initialResponses[guest.id] = guest.rsvpStatus
        }
        if (guest.email) {
          initialEmails[guest.id] = guest.email
        }
      })
      
      setRsvpResponses(initialResponses)
      setGuestEmails(initialEmails)
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

  const handleEmailChange = (guestId: string, email: string) => {
    setGuestEmails(prev => ({
      ...prev,
      [guestId]: email
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError('')

      // Update each guest's RSVP status and email
      for (const guest of guests) {
        const newStatus = rsvpResponses[guest.id] || 'pending'
        const guestEmail = guestEmails[guest.id] || guest.email || undefined
        
        await guestService.updateGuest(guest.id, {
          ...guest,
          rsvpStatus: newStatus,
          email: guestEmail
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Couple Image Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-rose-200 shadow-sm">
                <img 
                  src={coupleImage} 
                  alt="Couple" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-sm">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{languageSelectionText.title.nl}</h1>
              <h1 className="text-base font-medium text-gray-800 dark:text-gray-200">{languageSelectionText.title.es}</h1>
              <h1 className="text-sm font-medium text-gray-700 dark:text-gray-300">{languageSelectionText.title.en}</h1>
            </div>
            
            <div className="max-w-md mx-auto space-y-0.5">
              <p className="text-xs text-gray-600 dark:text-gray-400">{languageSelectionText.subtitle.nl}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{languageSelectionText.subtitle.es}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{languageSelectionText.subtitle.en}</p>
            </div>
          </div>

          {/* Language Options */}
          <div className="space-y-3 max-w-md mx-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelection(lang.code)}
                className="w-full p-4 bg-white dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-gray-100 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                        {lang.nativeName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <Heart className="h-3 w-3 text-rose-400 dark:text-rose-500 fill-current" />
              <p className="text-xs">
                {languageSelectionText.subtitle.en}
              </p>
              <Heart className="h-3 w-3 text-rose-400 dark:text-rose-500 fill-current" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-4 border-rose-100 dark:border-rose-900/30 border-t-rose-500 dark:border-t-rose-400 rounded-full animate-spin mx-auto"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-rose-500 dark:text-rose-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
            {selectedLanguage === 'nl' ? 'Uitnodiging laden...' : 
             selectedLanguage === 'es' ? 'Cargando invitación...' : 
             'Loading your invitation...'}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {selectedLanguage === 'nl' ? 'Even geduld' : 
             selectedLanguage === 'es' ? 'Por favor espera' : 
             'Please wait'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
            {selectedLanguage === 'nl' ? 'Oeps!' : 
             selectedLanguage === 'es' ? '¡Ups!' : 
             'Oops!'}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-rose-500 text-white font-medium text-sm rounded-lg hover:bg-rose-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
            <Check className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {selectedLanguage === 'nl' ? 'Dank je wel!' : 
             selectedLanguage === 'es' ? '¡Gracias!' : 
             'Thank You!'}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {selectedLanguage === 'nl' ? 'Je RSVP is succesvol verzonden.' : 
             selectedLanguage === 'es' ? 'Su RSVP ha sido enviado exitosamente.' : 
             'Your RSVP has been submitted successfully.'}
          </p>
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4 border border-rose-100 dark:border-rose-900/30">
            <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">
              {selectedLanguage === 'nl' ? 'We zijn opgewonden om met je te vieren!' : 
               selectedLanguage === 'es' ? '¡Estamos emocionados de celebrar contigo!' : 
               "We're excited to celebrate with you!"}
            </p>
          </div>
          
          {/* Couple Image */}
          <div className="mt-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-200 dark:border-rose-800 mx-auto shadow-sm">
              <img 
                src={coupleImage} 
                alt="Couple" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Glassmorphism Navigation - Right Middle (Always Open) */}
      <div className="fixed right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-50">
        {/* Navigation Panel */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700/40 rounded-lg shadow-sm">
          <div className="flex flex-col p-1">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollToSection('hero')}
              className={`w-9 h-9 transition-all duration-200 flex items-center justify-center rounded ${
                activeSection === 'hero' 
                  ? 'bg-rose-500/20 dark:bg-rose-500/30' 
                  : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
              aria-label="Go to invitation"
            >
              <Heart
                className={`transition-all duration-200 ${
                  activeSection === 'hero'
                    ? 'h-4 w-4 text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400'
                    : 'h-3.5 w-3.5 text-gray-900 dark:text-gray-100 hover:text-rose-500'
                }`}
              />
            </button>

            <button
              onClick={() => scrollToSection('wedding-details')}
              className={`w-9 h-9 transition-all duration-200 flex items-center justify-center rounded ${
                activeSection === 'wedding-details' 
                  ? 'bg-rose-500/20 dark:bg-rose-500/30' 
                  : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
              aria-label="Go to wedding details"
            >
              <Calendar
                className={`transition-all duration-200 ${
                  activeSection === 'wedding-details'
                    ? 'h-4 w-4 text-rose-600 dark:text-rose-400'
                    : 'h-3.5 w-3.5 text-gray-900 dark:text-gray-100 hover:text-rose-500'
                }`}
              />
            </button>

            <button
              onClick={() => scrollToSection('rsvp-form')}
              className={`w-9 h-9 transition-all duration-200 flex items-center justify-center rounded ${
                activeSection === 'rsvp-form' 
                  ? 'bg-rose-500/20 dark:bg-rose-500/30' 
                  : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
              aria-label="Go to RSVP form"
            >
              <Check
                className={`transition-all duration-200 ${
                  activeSection === 'rsvp-form'
                    ? 'h-4 w-4 text-rose-600 dark:text-rose-400'
                    : 'h-3.5 w-3.5 text-gray-900 dark:text-gray-100 hover:text-rose-500'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section with Couple Image */}
      <div id="hero" className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
        <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-12">
          <div className="text-center">
            {/* Couple Image */}
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-rose-200 dark:border-rose-800 shadow-sm mx-auto">
                  <img 
                    src={usImage} 
                    alt="Wedding Couple" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-10 h-10 md:w-12 md:h-12 bg-rose-500 dark:bg-rose-600 rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="h-5 w-5 md:h-6 md:w-6 text-white fill-current" />
                </div>
              </div>
            </div>

            {/* Names and Date */}
            <div className="space-y-2 mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                {selectedLanguage === 'nl' ? 'Trouwuitnodiging' : 
                 selectedLanguage === 'es' ? 'Invitación de Boda' : 
                 'Wedding Invitation'}
              </h1>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                {text.hero.subtitle[selectedLanguage || 'en']}
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex justify-center gap-2 mb-6">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code)
                    localStorage.setItem('rsvp-language', lang.code)
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedLanguage === lang.code
                      ? 'bg-rose-500 dark:bg-rose-600 text-white shadow-sm'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="ml-2 hidden sm:inline">{lang.nativeName}</span>
                </button>
              ))}
            </div>

            {/* Decorative Hearts */}
            <div className="flex justify-center gap-2 text-rose-400 dark:text-rose-500">
              <Heart className="h-3 w-3 fill-current" />
              <Heart className="h-3 w-3 fill-current" />
              <Heart className="h-3 w-3 fill-current" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
        {/* Wedding Details Card */}
        <div id="wedding-details" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {text.wedding.title[selectedLanguage || 'en']}
              </h2>
            </div>
          </div>
          
          {venue ? (
            <div className="space-y-4">
              {/* Venue Name and Address */}
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4 border border-rose-100 dark:border-rose-900/30">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {getLocalizedText(venue.venueName) || 'Wedding Venue'}
                </h3>
                <div className="flex items-start gap-2 text-gray-800 dark:text-gray-200">
                  <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-medium">{getLocalizedText(venue.venueAddress)}</div>
                    {venue.country && <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{venue.country}</div>}
                  </div>
                </div>
              </div>

              {/* Ceremony Details */}
              {venue.ceremonyTime && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                      {selectedLanguage === 'nl' ? 'Ceremonie' : 
                       selectedLanguage === 'es' ? 'Ceremonia' : 
                       'Ceremony'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium">{formatDateTime(venue.ceremonyTime)}</span>
                  </div>
                  {venue.ceremonyDetails && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {getLocalizedText(venue.ceremonyDetails)}
                    </p>
                  )}
                </div>
              )}

              {/* Reception Details */}
              {venue.receptionTime && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                      {selectedLanguage === 'nl' ? 'Receptie' : 
                       selectedLanguage === 'es' ? 'Recepción' : 
                       'Reception'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium">{formatDateTime(venue.receptionTime)}</span>
                  </div>
                  {venue.receptionDetails && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {getLocalizedText(venue.receptionDetails)}
                    </p>
                  )}
                </div>
              )}

              {/* Transportation & Special Instructions */}
              {(venue.transportationInfo && getLocalizedText(venue.transportationInfo)) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedLanguage === 'nl' ? 'Vervoer' : 
                     selectedLanguage === 'es' ? 'Transporte' : 
                     'Transportation'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {getLocalizedText(venue.transportationInfo)}
                  </p>
                </div>
              )}

              {(venue.specialInstructions && getLocalizedText(venue.specialInstructions)) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedLanguage === 'nl' ? 'Speciale Instructies' : 
                     selectedLanguage === 'es' ? 'Instrucciones Especiales' : 
                     'Special Instructions'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {getLocalizedText(venue.specialInstructions)}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              {(venue.contactName || venue.contactPhone || venue.contactEmail) && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">
                    {selectedLanguage === 'nl' ? 'Contact' : 
                     selectedLanguage === 'es' ? 'Contacto' : 
                     'Contact'}
                  </h4>
                  <div className="space-y-2">
                    {venue.contactName && (
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                        <span className="font-medium">{venue.contactName}</span>
                      </div>
                    )}
                    {venue.contactPhone && (
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                        <span>{venue.contactPhone}</span>
                      </div>
                    )}
                    {venue.contactEmail && (
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                        <span>{venue.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedLanguage === 'nl' ? 'Details volgen binnenkort' : 
                 selectedLanguage === 'es' ? 'Detalles próximamente' : 
                 'Details coming soon'}
              </p>
            </div>
          )}
        </div>

        {/* RSVP Form */}
        <div id="rsvp-form" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500 rounded-lg">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedLanguage === 'nl' ? 'Gelieve te antwoorden' : 
                 selectedLanguage === 'es' ? 'Por favor responder' : 
                 'Please Respond'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedLanguage === 'nl' ? 'Laat ons weten of je aanwezig bent' : 
                 selectedLanguage === 'es' ? 'Háznos saber si asistirás' : 
                 'Let us know if you will attend'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {guests.map((guest) => (
              <div key={guest.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {guest.firstName} {guest.lastName}
                    </h3>
                    {guest.ageCategory === 'child' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 mt-1">
                        {selectedLanguage === 'nl' ? 'Kind' : 
                         selectedLanguage === 'es' ? 'Niño' : 
                         'Child'}
                      </span>
                    )}
                  </div>
                </div>

                {/* RSVP Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => handleRsvpChange(guest.id, 'confirmed')}
                    className={`py-2.5 px-3 rounded-lg border transition-all duration-200 ${
                      rsvpResponses[guest.id] === 'confirmed'
                        ? 'border-green-500 bg-green-500 text-white shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    <Check className="h-4 w-4 mx-auto mb-1" />
                    <span className="block text-xs font-medium">
                      {selectedLanguage === 'nl' ? 'Aanwezig' : 
                       selectedLanguage === 'es' ? 'Asistiré' : 
                       'Will Attend'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleRsvpChange(guest.id, 'declined')}
                    className={`py-2.5 px-3 rounded-lg border transition-all duration-200 ${
                      rsvpResponses[guest.id] === 'declined'
                        ? 'border-red-500 bg-red-500 text-white shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-400 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <X className="h-4 w-4 mx-auto mb-1" />
                    <span className="block text-xs font-medium">
                      {selectedLanguage === 'nl' ? 'Afwezig' : 
                       selectedLanguage === 'es' ? 'No podré' : 
                       'Cannot Attend'}
                    </span>
                  </button>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor={`email-${guest.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {selectedLanguage === 'nl' ? 'E-mailadres (optioneel)' : 
                     selectedLanguage === 'es' ? 'Correo electrónico (opcional)' : 
                     'Email address (optional)'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {selectedLanguage === 'nl' ? 'Blijf op de hoogte door je e-mail toe te voegen' : 
                     selectedLanguage === 'es' ? 'Mantente informado agregando tu correo' : 
                     'Stay informed by adding your email'}
                  </p>
                  <input
                    type="email"
                    id={`email-${guest.id}`}
                    value={guestEmails[guest.id] || ''}
                    onChange={(e) => handleEmailChange(guest.id, e.target.value)}
                    placeholder={
                      selectedLanguage === 'nl' ? 'naam@voorbeeld.nl' : 
                      selectedLanguage === 'es' ? 'nombre@ejemplo.com' : 
                      'name@example.com'
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                {selectedLanguage === 'nl' ? 'Voortgang' : 
                 selectedLanguage === 'es' ? 'Progreso' : 
                 'Progress'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{getRespondedCount()}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedLanguage === 'nl' ? 'van' : selectedLanguage === 'es' ? 'de' : 'of'} {guests.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedLanguage === 'nl' ? 'Reacties' : 
                   selectedLanguage === 'es' ? 'Respuestas' : 
                   'Responses'}
                </div>
              </div>
              
              {getConfirmedCount() > 0 && (
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{getConfirmedCount()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedLanguage === 'nl' ? 'Aanwezig' : 
                     selectedLanguage === 'es' ? 'Asistirán' : 
                     'Attending'}
                  </div>
                </div>
              )}
              
              {Object.values(rsvpResponses).filter(r => r === 'declined').length > 0 && (
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {Object.values(rsvpResponses).filter(r => r === 'declined').length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedLanguage === 'nl' ? 'Afwezig' : 
                     selectedLanguage === 'es' ? 'No asistirán' : 
                     'Cannot attend'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span>
                  {selectedLanguage === 'nl' ? 'Voltooiing' : 
                   selectedLanguage === 'es' ? 'Finalización' : 
                   'Completion'}
                </span>
                <span className="font-medium">{Math.round((getRespondedCount() / guests.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-rose-500 dark:bg-rose-600 h-2 rounded-full transition-all duration-500"
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
              className="w-full sm:w-auto min-w-64 py-2.5 px-6 bg-rose-500 dark:bg-rose-600 text-white font-medium text-sm rounded-lg hover:bg-rose-600 dark:hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                {selectedLanguage === 'nl' ? 'Gelieve voor tenminste één gast te reageren' : 
                 selectedLanguage === 'es' ? 'Por favor responda por al menos un invitado' : 
                 'Please respond for at least one guest'}
              </p>
            )}
          </div>
        </div>

        {/* Footer with Couple Image */}
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-200 dark:border-rose-800 mx-auto shadow-sm">
            <img 
              src={coupleImage} 
              alt="Couple" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}