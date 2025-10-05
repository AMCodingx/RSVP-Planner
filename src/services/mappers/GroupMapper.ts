import type { GroupDto } from '../../storage/dto/GuestDto'
import type { Group } from '../../ui/models/Guest'
import type { Address } from '../../ui/models/Address'

export class GroupMapper {
  static toModel(dto: GroupDto, stats?: {
    totalGuests: number
    confirmedGuests: number
    pendingGuests: number
    declinedGuests: number
  }, address?: Address): Group {
    return {
      id: dto.id,
      name: dto.name,
      addressId: dto.address_id || undefined,
      address: address,
      qrCodeGenerated: dto.qr_code_generated,
      qrCodeUrl: dto.qr_code_url || undefined,
      guestCount: stats?.totalGuests || 0,
      confirmedCount: stats?.confirmedGuests || 0,
      pendingCount: stats?.pendingGuests || 0,
      declinedCount: stats?.declinedGuests || 0,
      dateCreated: new Date(dto.created_at)
    }
  }

  static toDto(model: Omit<Group, 'guestCount' | 'confirmedCount' | 'pendingCount' | 'declinedCount' | 'dateCreated'>): Omit<GroupDto, 'id' | 'created_at'> {
    return {
      name: model.name,
      address_id: model.addressId || null,
      qr_code_generated: model.qrCodeGenerated,
      qr_code_url: model.qrCodeUrl || null
    }
  }

  static toUpdateDto(model: Partial<Group>): Partial<Omit<GroupDto, 'id' | 'created_at'>> {
    const dto: Partial<Omit<GroupDto, 'id' | 'created_at'>> = {}
    
    if (model.name !== undefined) {
      dto.name = model.name
    }
    if (model.addressId !== undefined) {
      dto.address_id = model.addressId || null
    }
    if (model.qrCodeGenerated !== undefined) {
      dto.qr_code_generated = model.qrCodeGenerated
    }
    if (model.qrCodeUrl !== undefined) {
      dto.qr_code_url = model.qrCodeUrl || null
    }

    return dto
  }
}