import { supabase } from '../client'
import type { AddressDto } from '../dto/AddressDto'

export class AddressRepository {
  async create(address: Omit<AddressDto, 'id' | 'created_at'>): Promise<AddressDto> {
    const { data, error } = await supabase
      .from('addresses')
      .insert([address])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create address: ${error.message}`)
    }

    return data
  }

  async getById(id: string): Promise<AddressDto | null> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get address: ${error.message}`)
    }

    return data
  }

  async getAll(): Promise<AddressDto[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get addresses: ${error.message}`)
    }

    return data || []
  }

  async update(id: string, updates: Partial<Omit<AddressDto, 'id' | 'created_at'>>): Promise<AddressDto> {
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update address: ${error.message}`)
    }

    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete address: ${error.message}`)
    }
  }
}