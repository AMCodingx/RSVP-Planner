export interface GuestDto {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  age_category: 'adult' | 'child'
  group_id: string | null
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  invited_by: string | null
  special_notes: string | null
  created_at: string
}

export interface GroupDto {
  id: string
  name: string
  address_id: string | null
  qr_code_generated: boolean
  qr_code_url: string | null
  created_at: string
}