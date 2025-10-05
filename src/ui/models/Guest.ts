import type { Address } from './Address'

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  ageCategory: 'adult' | 'child'
  groupId?: string
  groupName?: string
  rsvpStatus: 'pending' | 'confirmed' | 'declined'
  invitedBy: string | null
  invitedByName?: string
  specialNotes?: string
  dateAdded: Date
}

export interface Group {
  id: string
  name: string
  addressId?: string
  address?: Address
  qrCodeGenerated: boolean
  qrCodeUrl?: string
  guestCount: number
  confirmedCount: number
  pendingCount: number
  declinedCount: number
  dateCreated: Date
}

export interface GroupWithGuests extends Group {
  guests: Guest[]
}

export type RsvpStatus = 'pending' | 'confirmed' | 'declined'
export type AgeCategory = 'adult' | 'child'