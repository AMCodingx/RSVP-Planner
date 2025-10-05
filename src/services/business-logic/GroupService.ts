import { groupRepository } from '../../storage/repositories/GroupRepository'
import { guestRepository } from '../../storage/repositories/GuestRepository'
import { AddressService } from './AddressService'
import { GroupMapper } from '../mappers/GroupMapper'
import { GuestMapper } from '../mappers/GuestMapper'
import type { Group, Guest } from '../../ui/models/Guest'
import type { AddressFormData } from '../../ui/models/Address'

export class GroupService {
  private addressService: AddressService

  constructor() {
    this.addressService = new AddressService()
  }

  async getAllGroups(): Promise<Group[]> {
    const groupDtos = await groupRepository.findAll()
    
    const groupsWithStats = await Promise.all(
      groupDtos.map(async (groupDto) => {
        const stats = await groupRepository.getGroupStats(groupDto.id)
        let address = undefined
        
        if (groupDto.address_id) {
          address = await this.addressService.getAddressById(groupDto.address_id)
        }
        
        return GroupMapper.toModel(groupDto, {
          totalGuests: stats.totalGuests,
          confirmedGuests: stats.confirmedGuests,
          pendingGuests: stats.pendingGuests,
          declinedGuests: stats.declinedGuests
        }, address || undefined)
      })
    )
    
    return groupsWithStats
  }

  async getGroupById(id: string): Promise<Group | null> {
    const groupDto = await groupRepository.findById(id)
    if (!groupDto) {
      return null
    }
    
    const stats = await groupRepository.getGroupStats(id)
    let address = undefined
    
    if (groupDto.address_id) {
      address = await this.addressService.getAddressById(groupDto.address_id)
    }
    
    return GroupMapper.toModel(groupDto, {
      totalGuests: stats.totalGuests,
      confirmedGuests: stats.confirmedGuests,
      pendingGuests: stats.pendingGuests,
      declinedGuests: stats.declinedGuests
    }, address || undefined)
  }

  async createGroup(groupData: {
    name: string
    addressData?: AddressFormData
  }): Promise<Group> {
    let addressId = null
    
    if (groupData.addressData) {
      const address = await this.addressService.createAddress(groupData.addressData)
      addressId = address.id
    }
    
    const groupDto = await groupRepository.create({
      name: groupData.name,
      address_id: addressId,
      qr_code_generated: false,
      qr_code_url: null
    })
    
    const address = addressId ? await this.addressService.getAddressById(addressId) : undefined
    
    return GroupMapper.toModel(groupDto, {
      totalGuests: 0,
      confirmedGuests: 0,
      pendingGuests: 0,
      declinedGuests: 0
    }, address || undefined)
  }

  async updateGroup(id: string, updates: {
    name?: string
    addressData?: AddressFormData
  }): Promise<Group> {
    const currentGroup = await this.getGroupById(id)
    if (!currentGroup) {
      throw new Error('Group not found')
    }
    
    let addressId = currentGroup.addressId
    
    if (updates.addressData) {
      if (addressId) {
        await this.addressService.updateAddress(addressId, updates.addressData)
      } else {
        const newAddress = await this.addressService.createAddress(updates.addressData)
        addressId = newAddress.id
      }
    }
    
    const updateDto: any = {}
    if (updates.name !== undefined) updateDto.name = updates.name
    if (addressId !== currentGroup.addressId) updateDto.address_id = addressId
    
    const updatedDto = await groupRepository.update(id, updateDto)
    const stats = await groupRepository.getGroupStats(id)
    const address = addressId ? await this.addressService.getAddressById(addressId) : undefined
    
    return GroupMapper.toModel(updatedDto, {
      totalGuests: stats.totalGuests,
      confirmedGuests: stats.confirmedGuests,
      pendingGuests: stats.pendingGuests,
      declinedGuests: stats.declinedGuests
    }, address || undefined)
  }

  async deleteGroup(id: string, reassignGuestsToGroupId?: string): Promise<void> {
    const currentGroup = await this.getGroupById(id)
    if (!currentGroup) {
      throw new Error('Group not found')
    }
    
    const guestsInGroup = await groupRepository.findGuestsInGroup(id)
    
    if (guestsInGroup.length > 0) {
      if (reassignGuestsToGroupId) {
        for (const guest of guestsInGroup) {
          await groupRepository.moveGuestToGroup(guest.id, reassignGuestsToGroupId)
        }
      } else {
        for (const guest of guestsInGroup) {
          await groupRepository.moveGuestToGroup(guest.id, null)
        }
      }
    }
    
    // Delete the address if it exists
    if (currentGroup.addressId) {
      await this.addressService.deleteAddress(currentGroup.addressId)
    }
    
    await groupRepository.delete(id)
  }

  async removeAddressFromGroup(groupId: string): Promise<Group> {
    const currentGroup = await this.getGroupById(groupId)
    if (!currentGroup) {
      throw new Error('Group not found')
    }
    
    if (currentGroup.addressId) {
      await this.addressService.deleteAddress(currentGroup.addressId)
      await groupRepository.update(groupId, { address_id: null })
    }
    
    return this.getGroupById(groupId) as Promise<Group>
  }

  async getGuestsInGroup(groupId: string): Promise<Guest[]> {
    const guestDtos = await groupRepository.findGuestsInGroup(groupId)
    return guestDtos.map(dto => GuestMapper.dtoToModel(dto))
  }

  async moveGuestToGroup(guestId: string, newGroupId: string | null): Promise<void> {
    await groupRepository.moveGuestToGroup(guestId, newGroupId)
  }

  async assignGuestsToGroup(guestIds: string[], groupId: string): Promise<void> {
    for (const guestId of guestIds) {
      await groupRepository.moveGuestToGroup(guestId, groupId)
    }
  }

  async getGroupStats(groupId: string): Promise<{
    totalGuests: number
    confirmedGuests: number
    pendingGuests: number
    declinedGuests: number
    responseRate: number
  }> {
    const stats = await groupRepository.getGroupStats(groupId)
    const responseRate = stats.totalGuests > 0 
      ? ((stats.confirmedGuests + stats.declinedGuests) / stats.totalGuests) * 100 
      : 0
    
    return {
      ...stats,
      responseRate
    }
  }

  async getUngroupedGuests(): Promise<Guest[]> {
    const allGuests = await guestRepository.getAllGuests()
    const ungroupedGuestDtos = allGuests.filter((guest: any) => !guest.group_id)
    return ungroupedGuestDtos.map((dto: any) => GuestMapper.dtoToModel(dto))
  }

  async generateQrCodeForGroup(groupId: string): Promise<string> {
    const qrCodeUrl = `${window.location.origin}/rsvp/${groupId}`
    
    await groupRepository.update(groupId, {
      qr_code_generated: true,
      qr_code_url: qrCodeUrl
    })
    
    return qrCodeUrl
  }

  formatGroupAddress(group: Group): string | null {
    if (group.address) {
      return this.addressService.formatAddressForDisplay(group.address)
    }
    return null
  }
}

export const groupService = new GroupService()