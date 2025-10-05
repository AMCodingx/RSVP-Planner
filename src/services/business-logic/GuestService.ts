import { GuestRepository } from '../../storage/repositories/GuestRepository'
import { GroupRepository } from '../../storage/repositories/GroupRepository'
import { AddressRepository } from '../../storage/repositories/AddressRepository'
import { coupleService } from './CoupleService'
import { GuestMapper, GroupMapper } from '../mappers/GuestMapper'
import { AddressMapper } from '../mappers/AddressMapper'
import { AddressService } from './AddressService'
import type { Guest, Group, GroupWithGuests } from '../../ui/models/Guest'

export class GuestService {
  private guestRepository: GuestRepository
  private groupRepository: GroupRepository
  private addressRepository: AddressRepository
  private addressService: AddressService

  constructor() {
    this.guestRepository = new GuestRepository()
    this.groupRepository = new GroupRepository()
    this.addressRepository = new AddressRepository()
    this.addressService = new AddressService()
  }

  private async getCoupleNameMap(): Promise<Map<string, string>> {
    try {
      const couples = await coupleService.getAllCouples()
      return new Map(couples.map(couple => [couple.id, couple.fullName]))
    } catch (error) {
      console.error('Failed to fetch couples for name mapping:', error)
      return new Map()
    }
  }

  async getAllGuests(): Promise<Guest[]> {
    const [guestDtos, groupDtos, coupleNameMap] = await Promise.all([
      this.guestRepository.getAllGuests(),
      this.guestRepository.getAllGroups(),
      this.getCoupleNameMap()
    ])
    
    const groupMap = new Map(groupDtos.map(group => [group.id, group.name]))
    
    return guestDtos.map(dto => 
      GuestMapper.dtoToModel(
        dto, 
        dto.group_id ? groupMap.get(dto.group_id) : undefined,
        dto.invited_by ? coupleNameMap.get(dto.invited_by) : undefined
      )
    )
  }

  async getGuestsGroupedByInvitation(): Promise<{ groups: GroupWithGuests[], individualGuests: Guest[] }> {
    const [groupDtos, guestDtos, addressDtos, coupleNameMap] = await Promise.all([
      this.guestRepository.getAllGroups(),
      this.guestRepository.getAllGuests(),
      this.addressRepository.getAll(),
      this.getCoupleNameMap()
    ])
    
    const addressMap = new Map(addressDtos.map(addr => [addr.id, AddressMapper.dtoToModel(addr)]))
    
    const groups = await Promise.all(groupDtos.map(async groupDto => {
      const groupGuests = guestDtos.filter(guest => guest.group_id === groupDto.id)
      const guestCounts = {
        total: groupGuests.length,
        confirmed: groupGuests.filter(g => g.rsvp_status === 'confirmed').length,
        pending: groupGuests.filter(g => g.rsvp_status === 'pending').length,
        declined: groupGuests.filter(g => g.rsvp_status === 'declined').length
      }
      
      const group = GroupMapper.dtoToModel(groupDto, guestCounts)
      if (groupDto.address_id && addressMap.has(groupDto.address_id)) {
        group.address = addressMap.get(groupDto.address_id)
      }
      
      return {
        ...group,
        guests: groupGuests.map(guestDto => 
          GuestMapper.dtoToModel(
            guestDto, 
            groupDto.name,
            guestDto.invited_by ? coupleNameMap.get(guestDto.invited_by) : undefined
          )
        )
      }
    }))
    
    const individualGuests = guestDtos
      .filter(guest => !guest.group_id)
      .map(dto => GuestMapper.dtoToModel(
        dto, 
        undefined,
        dto.invited_by ? coupleNameMap.get(dto.invited_by) : undefined
      ))
    
    return { groups, individualGuests }
  }

  async getGuestById(id: string): Promise<Guest | null> {
    const [dto, coupleNameMap] = await Promise.all([
      this.guestRepository.getGuestById(id),
      this.getCoupleNameMap()
    ])
    
    if (!dto) return null
    
    let groupName: string | undefined
    if (dto.group_id) {
      const groupDto = await this.guestRepository.getGroupById(dto.group_id)
      groupName = groupDto?.name
    }
    
    const coupleName = dto.invited_by ? coupleNameMap.get(dto.invited_by) : undefined
    
    return GuestMapper.dtoToModel(dto, groupName, coupleName)
  }

  async createGuestWithCouple(guest: Omit<Guest, 'id' | 'dateAdded' | 'lastUpdated' | 'invitedBy' | 'invitedByName'>, authUserId: string): Promise<Guest> {
    // Get or create couple for the current user
    let couple = await coupleService.getCoupleByAuthUserId(authUserId)
    
    if (!couple) {
      throw new Error('Please set up your couple information before adding guests')
    }
    
    const guestWithCouple = {
      ...guest,
      invitedBy: couple.id
    }
    
    return this.createGuest(guestWithCouple)
  }

  async createGuest(guest: Omit<Guest, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<Guest> {
    const dto = GuestMapper.modelToDto(guest as Guest)
    const [createdDto, coupleNameMap] = await Promise.all([
      this.guestRepository.createGuest(dto),
      this.getCoupleNameMap()
    ])
    
    let groupName: string | undefined
    if (createdDto.group_id) {
      const groupDto = await this.guestRepository.getGroupById(createdDto.group_id)
      groupName = groupDto?.name
    }
    
    const coupleName = createdDto.invited_by ? coupleNameMap.get(createdDto.invited_by) : undefined
    
    return GuestMapper.dtoToModel(createdDto, groupName, coupleName)
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
    const [existingGuest, coupleNameMap] = await Promise.all([
      this.getGuestById(id),
      this.getCoupleNameMap()
    ])
    
    if (!existingGuest) {
      throw new Error('Guest not found')
    }
    
    const updatedGuest = { ...existingGuest, ...updates }
    const dto = GuestMapper.modelToDto(updatedGuest)
    const updatedDto = await this.guestRepository.updateGuest(id, dto)
    
    let groupName: string | undefined
    if (updatedDto.group_id) {
      const groupDto = await this.guestRepository.getGroupById(updatedDto.group_id)
      groupName = groupDto?.name
    }
    
    const coupleName = updatedDto.invited_by ? coupleNameMap.get(updatedDto.invited_by) : undefined
    
    return GuestMapper.dtoToModel(updatedDto, groupName, coupleName)
  }

  async deleteGuest(id: string): Promise<void> {
    // First, get the guest to see which group they belong to
    const guest = await this.getGuestById(id)
    if (!guest) {
      throw new Error('Guest not found')
    }

    const groupId = guest.groupId

    // Delete the guest
    await this.guestRepository.deleteGuest(id)

    // If the guest was in a group, check if the group is now empty
    if (groupId) {
      const remainingGuestsInGroup = await this.groupRepository.findGuestsInGroup(groupId)
      
      // If no guests remain in the group, delete the group and its address
      if (remainingGuestsInGroup.length === 0) {
        const groupDto = await this.groupRepository.findById(groupId)
        
        // Delete the address if it exists
        if (groupDto?.address_id) {
          await this.addressService.deleteAddress(groupDto.address_id)
        }
        
        // Delete the group
        await this.groupRepository.delete(groupId)
      }
    }
  }

  async getAllGroups(): Promise<Group[]> {
    const groupDtos = await this.guestRepository.getAllGroups()
    const guestDtos = await this.guestRepository.getAllGuests()
    
    return groupDtos.map(groupDto => {
      const groupGuests = guestDtos.filter(guest => guest.group_id === groupDto.id)
      const guestCounts = {
        total: groupGuests.length,
        confirmed: groupGuests.filter(g => g.rsvp_status === 'confirmed').length,
        pending: groupGuests.filter(g => g.rsvp_status === 'pending').length,
        declined: groupGuests.filter(g => g.rsvp_status === 'declined').length
      }
      
      return GroupMapper.dtoToModel(groupDto, guestCounts)
    })
  }

  async getGroupById(id: string): Promise<Group | null> {
    const groupDto = await this.guestRepository.getGroupById(id)
    if (!groupDto) return null
    
    const guestDtos = await this.guestRepository.getAllGuests()
    const groupGuests = guestDtos.filter(guest => guest.group_id === id)
    
    const guestCounts = {
      total: groupGuests.length,
      confirmed: groupGuests.filter(g => g.rsvp_status === 'confirmed').length,
      pending: groupGuests.filter(g => g.rsvp_status === 'pending').length,
      declined: groupGuests.filter(g => g.rsvp_status === 'declined').length
    }
    
    return GroupMapper.dtoToModel(groupDto, guestCounts)
  }

  async createGroup(groupData: { 
    name: string, 
    addressId?: string, 
    qrCodeGenerated: boolean 
  }): Promise<Group> {
    const group: Omit<Group, 'id' | 'guestCount' | 'confirmedCount' | 'pendingCount' | 'declinedCount' | 'dateCreated'> = {
      name: groupData.name,
      addressId: groupData.addressId,
      qrCodeGenerated: groupData.qrCodeGenerated
    }
    
    const dto = GroupMapper.modelToDto(group as Group)
    const createdDto = await this.guestRepository.createGroup(dto)
    
    const guestCounts = { total: 0, confirmed: 0, pending: 0, declined: 0 }
    return GroupMapper.dtoToModel(createdDto, guestCounts)
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group> {
    const existingGroup = await this.getGroupById(id)
    if (!existingGroup) {
      throw new Error('Group not found')
    }
    
    const updatedGroup = { ...existingGroup, ...updates }
    const dto = GroupMapper.modelToDto(updatedGroup)
    const updatedDto = await this.guestRepository.updateGroup(id, dto)
    
    const guestDtos = await this.guestRepository.getAllGuests()
    const groupGuests = guestDtos.filter(guest => guest.group_id === id)
    
    const guestCounts = {
      total: groupGuests.length,
      confirmed: groupGuests.filter(g => g.rsvp_status === 'confirmed').length,
      pending: groupGuests.filter(g => g.rsvp_status === 'pending').length,
      declined: groupGuests.filter(g => g.rsvp_status === 'declined').length
    }
    
    return GroupMapper.dtoToModel(updatedDto, guestCounts)
  }

  async deleteGroup(id: string): Promise<void> {
    await this.guestRepository.deleteGroup(id)
  }

  async getGuestStats() {
    const guests = await this.getAllGuests()
    
    return {
      totalGuests: guests.length,
      confirmedGuests: guests.filter(g => g.rsvpStatus === 'confirmed').length,
      pendingGuests: guests.filter(g => g.rsvpStatus === 'pending').length,
      declinedGuests: guests.filter(g => g.rsvpStatus === 'declined').length,
      adultGuests: guests.filter(g => g.ageCategory === 'adult').length,
      childGuests: guests.filter(g => g.ageCategory === 'child').length,
      responseRate: guests.length > 0 ? 
        Math.round(((guests.length - guests.filter(g => g.rsvpStatus === 'pending').length) / guests.length) * 100) : 0
    }
  }

  async getGuestsByGroupId(groupId: string): Promise<Guest[]> {
    const [guestDtos, groupDto, coupleNameMap] = await Promise.all([
      this.guestRepository.getAllGuests(),
      this.guestRepository.getGroupById(groupId),
      this.getCoupleNameMap()
    ])
    
    const groupGuests = guestDtos.filter(guest => guest.group_id === groupId)
    const groupName = groupDto?.name
    
    return groupGuests.map(dto => 
      GuestMapper.dtoToModel(
        dto, 
        groupName,
        dto.invited_by ? coupleNameMap.get(dto.invited_by) : undefined
      )
    )
  }
}