import { supabase } from '../client'
import type { CoupleDto } from '../dto/CoupleDto'

export class CoupleRepository {
  async getAllCouples(): Promise<CoupleDto[]> {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch couples: ${error.message}`)
    }
    
    return data || []
  }

  async getCoupleById(id: string): Promise<CoupleDto | null> {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch couple: ${error.message}`)
    }
    
    return data
  }

  async getCoupleByAuthUserId(authUserId: string): Promise<CoupleDto | null> {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch couple by auth user: ${error.message}`)
    }
    
    return data
  }

  async createCouple(couple: Omit<CoupleDto, 'id' | 'created_at'>): Promise<CoupleDto> {
    const { data, error } = await supabase
      .from('couples')
      .insert([couple])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create couple: ${error.message}`)
    }
    
    return data
  }

  async updateCouple(id: string, updates: Partial<Omit<CoupleDto, 'id' | 'created_at' | 'auth_user_id'>>): Promise<CoupleDto> {
    const { data, error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update couple: ${error.message}`)
    }
    
    return data
  }

  async deleteCouple(id: string): Promise<void> {
    const { error } = await supabase
      .from('couples')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete couple: ${error.message}`)
    }
  }

  async getCoupleCount(): Promise<number> {
    const { count, error } = await supabase
      .from('couples')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      throw new Error(`Failed to count couples: ${error.message}`)
    }
    
    return count || 0
  }
}

export const coupleRepository = new CoupleRepository()