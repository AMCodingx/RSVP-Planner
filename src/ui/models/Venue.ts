export interface Venue {
  id: string
  venueName: {
    en: string
    es?: string
    nl?: string
  }
  venueAddress: {
    en: string
    es?: string
    nl?: string
  }
  country: string
  ceremonyTime?: Date
  ceremonyDetails?: {
    en?: string
    es?: string
    nl?: string
  }
  receptionTime?: Date
  receptionDetails?: {
    en?: string
    es?: string
    nl?: string
  }
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  specialInstructions?: {
    en?: string
    es?: string
    nl?: string
  }
  transportationInfo?: {
    en?: string
    es?: string
    nl?: string
  }
  dateCreated: Date
}

export type SupportedLanguage = 'en' | 'es' | 'nl'