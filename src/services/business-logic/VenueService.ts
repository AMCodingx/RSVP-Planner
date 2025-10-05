import { VenueRepository } from '../../storage/repositories/VenueRepository'
import { VenueMapper } from '../mappers/VenueMapper'
import type { Venue, SupportedLanguage } from '../../ui/models/Venue'

export class VenueService {
  private venueRepository: VenueRepository

  constructor() {
    this.venueRepository = new VenueRepository()
  }

  async getVenue(): Promise<Venue | null> {
    const dto = await this.venueRepository.getVenue()
    if (!dto) return null
    return VenueMapper.dtoToModel(dto)
  }

  async createVenue(venue: Omit<Venue, 'id' | 'dateCreated'>): Promise<Venue> {
    const dto = VenueMapper.createDtoFromModel(venue)
    const createdDto = await this.venueRepository.createVenue(dto)
    return VenueMapper.dtoToModel(createdDto)
  }

  async updateVenue(id: string, updates: Partial<Omit<Venue, 'id' | 'dateCreated'>>): Promise<Venue> {
    const existingVenue = await this.getVenue()
    if (!existingVenue) {
      throw new Error('Venue not found')
    }

    const updatedVenue = { ...existingVenue, ...updates }
    const updateDto = VenueMapper.modelToDto(updatedVenue)
    const { id: _, ...updateFields } = updateDto
    
    const updatedDto = await this.venueRepository.updateVenue(id, updateFields)
    return VenueMapper.dtoToModel(updatedDto)
  }

  async deleteVenue(id: string): Promise<void> {
    await this.venueRepository.deleteVenue(id)
  }

  async venueExists(): Promise<boolean> {
    return await this.venueRepository.venueExists()
  }

  async ensureVenueExists(): Promise<Venue> {
    const existingVenue = await this.getVenue()
    if (existingVenue) {
      return existingVenue
    }

    // Create a default venue for Curacao wedding if none exists
    const defaultVenue: Omit<Venue, 'id' | 'dateCreated'> = {
      venueName: {
        en: 'Your Wedding Venue',
        es: 'Tu Lugar de Boda',
        nl: 'Jouw Trouwlocatie'
      },
      venueAddress: {
        en: 'Beautiful Beach Location, Curacao',
        es: 'Hermosa Ubicación en la Playa, Curazao',
        nl: 'Prachtige Strandlocatie, Curaçao'
      },
      country: 'Curacao',
      ceremonyTime: new Date('2027-03-15T17:00:00-04:00'),
      ceremonyDetails: {
        en: 'Beach ceremony with Caribbean sunset. Please update ceremony details.',
        es: 'Ceremonia en la playa con atardecer caribeño. Por favor actualice los detalles de la ceremonia.',
        nl: 'Strandceremonie met Caribische zonsondergang. Gelieve de ceremonie details bij te werken.'
      },
      receptionTime: new Date('2027-03-15T19:00:00-04:00'),
      receptionDetails: {
        en: 'Reception with dinner and dancing. Please update reception details.',
        es: 'Recepción con cena y baile. Por favor actualice los detalles de la recepción.',
        nl: 'Receptie met diner en dansen. Gelieve de receptie details bij te werken.'
      },
      transportationInfo: {
        en: 'Transportation details to be arranged',
        es: 'Detalles de transporte por organizar',
        nl: 'Vervoer details worden geregeld'
      },
      contactName: 'Venue Coordinator',
      contactPhone: '+599 9 123-4567',
      contactEmail: 'coordinator@venue.cw',
      specialInstructions: {
        en: 'Please update venue instructions',
        es: 'Por favor actualice las instrucciones del lugar',
        nl: 'Gelieve de locatie instructies bij te werken'
      }
    }

    return await this.createVenue(defaultVenue)
  }

  getLocalizedText(textObject: { en: string; es?: string; nl?: string } | undefined, language: SupportedLanguage = 'en'): string {
    if (!textObject) return ''
    return textObject[language] || textObject.en || ''
  }

  formatVenueAddress(venue: Venue, language: SupportedLanguage = 'en'): string {
    const address = this.getLocalizedText(venue.venueAddress, language)
    return `${address}, ${venue.country}`
  }

  formatCeremonyTime(venue: Venue, language: SupportedLanguage = 'en'): string | null {
    if (!venue.ceremonyTime) return null
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }

    const locale = language === 'es' ? 'es-ES' : language === 'nl' ? 'nl-NL' : 'en-US'
    return venue.ceremonyTime.toLocaleString(locale, options)
  }

  formatReceptionTime(venue: Venue, language: SupportedLanguage = 'en'): string | null {
    if (!venue.receptionTime) return null
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }

    const locale = language === 'es' ? 'es-ES' : language === 'nl' ? 'nl-NL' : 'en-US'
    return venue.receptionTime.toLocaleString(locale, options)
  }
}