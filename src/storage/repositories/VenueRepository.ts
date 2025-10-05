import { supabase } from '../client'
import type { VenueDto } from '../dto/VenueDto'

export class VenueRepository {
  async getVenue(): Promise<VenueDto | null> {
    console.log('Fetching venue from database...')
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .single()

    if (error) {
      console.error('Database error when fetching venue:', error)
      if (error.code === 'PGRST116') {
        console.log('No venue found in database')
        return null
      }
      if (error.code === '42P01') {
        throw new Error('Venues table does not exist. Please run the 05_create_venues_table.sql migration in your Supabase database.')
      }
      throw new Error(`Failed to fetch venue: ${error.message}`)
    }

    console.log('Venue fetched successfully:', data)
    return data
  }

  async createVenue(venue: Omit<VenueDto, 'id' | 'created_at'>): Promise<VenueDto> {
    console.log('Creating venue in database:', venue)
    const { data, error } = await supabase
      .from('venues')
      .insert(venue)
      .select()
      .single()

    if (error) {
      console.error('Database error when creating venue:', error)
      throw new Error(`Failed to create venue: ${error.message}`)
    }

    console.log('Venue created successfully:', data)
    return data
  }

  async updateVenue(id: string, venue: Partial<Omit<VenueDto, 'id' | 'created_at'>>): Promise<VenueDto> {
    const { data, error } = await supabase
      .from('venues')
      .update(venue)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update venue: ${error.message}`)
    }

    return data
  }

  async deleteVenue(id: string): Promise<void> {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete venue: ${error.message}`)
    }
  }

  async venueExists(): Promise<boolean> {
    const { data, error } = await supabase
      .from('venues')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        throw new Error('Venues table does not exist. Please run the 05_create_venues_table.sql migration in your Supabase database.')
      }
      throw new Error(`Failed to check venue existence: ${error.message}`)
    }

    return data && data.length > 0
  }
}