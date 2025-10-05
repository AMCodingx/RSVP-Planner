import type { GuestDto, GroupDto } from '../../storage/dto/GuestDto'
import type { Guest, Group } from '../../ui/models/Guest'
import type { Address } from '../../ui/models/Address'

export class GuestMapper {
  static dtoToModel(dto: GuestDto, groupName?: string, invitedByName?: string): Guest {
    return {
      id: dto.id,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email || undefined,
      phone: dto.phone || undefined,
      ageCategory: dto.age_category,
      groupId: dto.group_id || undefined,
      groupName: groupName,
      rsvpStatus: dto.rsvp_status,
      invitedBy: dto.invited_by,
      invitedByName: invitedByName,
      specialNotes: dto.special_notes || undefined,
      dateAdded: new Date(dto.created_at)
    }
  }

  static modelToDto(model: Guest): Omit<GuestDto, 'id' | 'created_at'> {
    return {
      first_name: model.firstName,
      last_name: model.lastName,
      email: model.email || null,
      phone: model.phone || null,
      age_category: model.ageCategory,
      group_id: model.groupId || null,
      rsvp_status: model.rsvpStatus,
      invited_by: model.invitedBy,
      special_notes: model.specialNotes || null
    }
  }
}

export class GroupMapper {
  static dtoToModel(dto: GroupDto, guestCounts: { total: number; confirmed: number; pending: number; declined: number }, address?: Address): Group {
    return {
      id: dto.id,
      name: dto.name,
      addressId: dto.address_id || undefined,
      address: address,
      qrCodeGenerated: dto.qr_code_generated,
      qrCodeUrl: dto.qr_code_url || undefined,
      guestCount: guestCounts.total,
      confirmedCount: guestCounts.confirmed,
      pendingCount: guestCounts.pending,
      declinedCount: guestCounts.declined,
      dateCreated: new Date(dto.created_at)
    }
  }

  static modelToDto(model: Group): Omit<GroupDto, 'id' | 'created_at'> {
    return {
      name: model.name,
      address_id: model.addressId || null,
      qr_code_generated: model.qrCodeGenerated,
      qr_code_url: model.qrCodeUrl || null
    }
  }

  // Legacy method for backward compatibility
  static toModel(dto: GroupDto, stats?: {
    totalGuests: number
    confirmedGuests: number
    pendingGuests: number
    declinedGuests: number
  }): Group {
    return this.dtoToModel(dto, {
      total: stats?.totalGuests || 0,
      confirmed: stats?.confirmedGuests || 0,
      pending: stats?.pendingGuests || 0,
      declined: stats?.declinedGuests || 0
    })
  }
}