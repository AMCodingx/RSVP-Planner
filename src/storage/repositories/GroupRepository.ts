import { supabase } from '../client'
import type { GroupDto, GuestDto } from '../dto/GuestDto'

export class GroupRepository {
  async findAll(): Promise<GroupDto[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch groups: ${error.message}`)
    }

    return data || []
  }

  async findById(id: string): Promise<GroupDto | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch group: ${error.message}`)
    }

    return data
  }

  async create(group: Omit<GroupDto, 'id' | 'created_at'>): Promise<GroupDto> {
    const { data, error } = await supabase
      .from('groups')
      .insert(group)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create group: ${error.message}`)
    }

    return data
  }

  async update(id: string, updates: Partial<Omit<GroupDto, 'id' | 'created_at'>>): Promise<GroupDto> {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update group: ${error.message}`)
    }

    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete group: ${error.message}`)
    }
  }

  async findGuestsInGroup(groupId: string): Promise<GuestDto[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('group_id', groupId)

    if (error) {
      throw new Error(`Failed to fetch guests in group: ${error.message}`)
    }

    return data || []
  }

  async getGroupStats(groupId: string): Promise<{
    totalGuests: number
    confirmedGuests: number
    pendingGuests: number
    declinedGuests: number
  }> {
    const { data, error } = await supabase
      .from('guests')
      .select('rsvp_status')
      .eq('group_id', groupId)

    if (error) {
      throw new Error(`Failed to fetch group stats: ${error.message}`)
    }

    const guests = data || []
    return {
      totalGuests: guests.length,
      confirmedGuests: guests.filter((g: any) => g.rsvp_status === 'confirmed').length,
      pendingGuests: guests.filter((g: any) => g.rsvp_status === 'pending').length,
      declinedGuests: guests.filter((g: any) => g.rsvp_status === 'declined').length
    }
  }

  async moveGuestToGroup(guestId: string, newGroupId: string | null): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .update({ group_id: newGroupId })
      .eq('id', guestId)

    if (error) {
      throw new Error(`Failed to move guest to group: ${error.message}`)
    }
  }

  async updateQRCodeInfo(groupId: string, qrInfo: { qrCodeGenerated: boolean; qrCodeUrl: string | null }): Promise<GroupDto> {
    const { data, error } = await supabase
      .from('groups')
      .update({
        qr_code_generated: qrInfo.qrCodeGenerated,
        qr_code_url: qrInfo.qrCodeUrl
      })
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update QR code info: ${error.message}`)
    }

    return data
  }
}

export const groupRepository = new GroupRepository()