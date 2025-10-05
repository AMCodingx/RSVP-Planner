import type { Venue } from '../../ui/models/Venue'
import type { VenueDto } from '../../storage/dto/VenueDto'

export class VenueMapper {
  static dtoToModel(dto: VenueDto): Venue {
    return {
      id: dto.id,
      venueName: {
        en: dto.venue_name_en,
        es: dto.venue_name_es || undefined,
        nl: dto.venue_name_nl || undefined
      },
      venueAddress: {
        en: dto.venue_address_en,
        es: dto.venue_address_es || undefined,
        nl: dto.venue_address_nl || undefined
      },
      country: dto.country,
      ceremonyTime: dto.ceremony_time ? new Date(dto.ceremony_time) : undefined,
      ceremonyDetails: {
        en: dto.ceremony_details_en || undefined,
        es: dto.ceremony_details_es || undefined,
        nl: dto.ceremony_details_nl || undefined
      },
      receptionTime: dto.reception_time ? new Date(dto.reception_time) : undefined,
      receptionDetails: {
        en: dto.reception_details_en || undefined,
        es: dto.reception_details_es || undefined,
        nl: dto.reception_details_nl || undefined
      },
      contactName: dto.contact_name || undefined,
      contactPhone: dto.contact_phone || undefined,
      contactEmail: dto.contact_email || undefined,
      specialInstructions: {
        en: dto.special_instructions_en || undefined,
        es: dto.special_instructions_es || undefined,
        nl: dto.special_instructions_nl || undefined
      },
      transportationInfo: {
        en: dto.transportation_info_en || undefined,
        es: dto.transportation_info_es || undefined,
        nl: dto.transportation_info_nl || undefined
      },
      dateCreated: new Date(dto.created_at)
    }
  }

  static modelToDto(model: Venue): Omit<VenueDto, 'created_at'> {
    return {
      id: model.id,
      venue_name_en: model.venueName.en,
      venue_name_es: model.venueName.es || null,
      venue_name_nl: model.venueName.nl || null,
      venue_address_en: model.venueAddress.en,
      venue_address_es: model.venueAddress.es || null,
      venue_address_nl: model.venueAddress.nl || null,
      country: model.country,
      ceremony_time: model.ceremonyTime ? model.ceremonyTime.toISOString() : null,
      ceremony_details_en: model.ceremonyDetails?.en || null,
      ceremony_details_es: model.ceremonyDetails?.es || null,
      ceremony_details_nl: model.ceremonyDetails?.nl || null,
      reception_time: model.receptionTime ? model.receptionTime.toISOString() : null,
      reception_details_en: model.receptionDetails?.en || null,
      reception_details_es: model.receptionDetails?.es || null,
      reception_details_nl: model.receptionDetails?.nl || null,
      contact_name: model.contactName || null,
      contact_phone: model.contactPhone || null,
      contact_email: model.contactEmail || null,
      special_instructions_en: model.specialInstructions?.en || null,
      special_instructions_es: model.specialInstructions?.es || null,
      special_instructions_nl: model.specialInstructions?.nl || null,
      transportation_info_en: model.transportationInfo?.en || null,
      transportation_info_es: model.transportationInfo?.es || null,
      transportation_info_nl: model.transportationInfo?.nl || null
    }
  }

  static createDtoFromModel(model: Omit<Venue, 'id' | 'dateCreated'>): Omit<VenueDto, 'id' | 'created_at'> {
    return {
      venue_name_en: model.venueName.en,
      venue_name_es: model.venueName.es || null,
      venue_name_nl: model.venueName.nl || null,
      venue_address_en: model.venueAddress.en,
      venue_address_es: model.venueAddress.es || null,
      venue_address_nl: model.venueAddress.nl || null,
      country: model.country,
      ceremony_time: model.ceremonyTime ? model.ceremonyTime.toISOString() : null,
      ceremony_details_en: model.ceremonyDetails?.en || null,
      ceremony_details_es: model.ceremonyDetails?.es || null,
      ceremony_details_nl: model.ceremonyDetails?.nl || null,
      reception_time: model.receptionTime ? model.receptionTime.toISOString() : null,
      reception_details_en: model.receptionDetails?.en || null,
      reception_details_es: model.receptionDetails?.es || null,
      reception_details_nl: model.receptionDetails?.nl || null,
      contact_name: model.contactName || null,
      contact_phone: model.contactPhone || null,
      contact_email: model.contactEmail || null,
      special_instructions_en: model.specialInstructions?.en || null,
      special_instructions_es: model.specialInstructions?.es || null,
      special_instructions_nl: model.specialInstructions?.nl || null,
      transportation_info_en: model.transportationInfo?.en || null,
      transportation_info_es: model.transportationInfo?.es || null,
      transportation_info_nl: model.transportationInfo?.nl || null
    }
  }
}