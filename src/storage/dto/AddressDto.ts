export interface AddressDto {
  id: string
  house_number: string | null
  street_address: string
  city: string
  state_province: string | null
  postal_code: string
  country: string
  delivery_instructions: string | null
  created_at: string
}