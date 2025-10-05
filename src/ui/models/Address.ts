export interface Address {
  id: string
  houseNumber?: string
  streetAddress: string
  city: string
  stateProvince?: string
  postalCode: string
  country: string
  deliveryInstructions?: string
  dateCreated: Date
}

export interface AddressFormData {
  houseNumber: string
  streetAddress: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  deliveryInstructions: string
}

export interface Country {
  code: string
  name: string
  states?: string[]
}