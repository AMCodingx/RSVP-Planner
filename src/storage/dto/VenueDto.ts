export interface VenueDto {
  id: string
  venue_name_en: string
  venue_name_es: string | null
  venue_name_nl: string | null
  venue_address_en: string
  venue_address_es: string | null
  venue_address_nl: string | null
  country: string
  ceremony_time: string | null
  ceremony_details_en: string | null
  ceremony_details_es: string | null
  ceremony_details_nl: string | null
  reception_time: string | null
  reception_details_en: string | null
  reception_details_es: string | null
  reception_details_nl: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  special_instructions_en: string | null
  special_instructions_es: string | null
  special_instructions_nl: string | null
  transportation_info_en: string | null
  transportation_info_es: string | null
  transportation_info_nl: string | null
  created_at: string
}