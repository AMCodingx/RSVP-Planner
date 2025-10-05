import { supabase } from '../client'
import type { GuestDto, GroupDto } from '../dto/GuestDto'

export class GuestRepository {
  async getAllGuests(): Promise<GuestDto[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch guests: ${error.message}`)
    }
    
    return data || []
  }

  async getGuestById(id: string): Promise<GuestDto | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch guest: ${error.message}`)
    }
    
    return data
  }

  async createGuest(guest: Omit<GuestDto, 'id' | 'created_at'>): Promise<GuestDto> {
    const { data, error } = await supabase
      .from('guests')
      .insert([guest])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create guest: ${error.message}`)
    }
    
    return data
  }

  async updateGuest(id: string, updates: Partial<Omit<GuestDto, 'id' | 'created_at'>>): Promise<GuestDto> {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update guest: ${error.message}`)
    }
    
    return data
  }

  async deleteGuest(id: string): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete guest: ${error.message}`)
    }
  }

  async getAllGroups(): Promise<GroupDto[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch groups: ${error.message}`)
    }
    
    return data || []
  }

  async getGroupById(id: string): Promise<GroupDto | null> {
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

  async createGroup(group: Omit<GroupDto, 'id' | 'created_at'>): Promise<GroupDto> {
    const { data, error } = await supabase
      .from('groups')
      .insert([group])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create group: ${error.message}`)
    }
    
    return data
  }

  async updateGroup(id: string, updates: Partial<Omit<GroupDto, 'id' | 'created_at'>>): Promise<GroupDto> {
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

  async deleteGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete group: ${error.message}`)
    }
  }
}

export const guestRepository = new GuestRepository()