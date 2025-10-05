import { coupleRepository } from '../../storage/repositories/CoupleRepository'
import { CoupleMapper } from '../mappers/CoupleMapper'
import type { Couple } from '../../ui/models/Couple'

export class CoupleService {
  async getAllCouples(): Promise<Couple[]> {
    try {
      const dtos = await coupleRepository.getAllCouples()
      return dtos.map(CoupleMapper.toModel)
    } catch (error) {
      console.error('Failed to fetch couples:', error)
      throw error
    }
  }

  async getCoupleById(id: string): Promise<Couple | null> {
    try {
      const dto = await coupleRepository.getCoupleById(id)
      return dto ? CoupleMapper.toModel(dto) : null
    } catch (error) {
      console.error('Failed to fetch couple by id:', error)
      throw error
    }
  }

  async getCoupleByAuthUserId(authUserId: string): Promise<Couple | null> {
    try {
      const dto = await coupleRepository.getCoupleByAuthUserId(authUserId)
      return dto ? CoupleMapper.toModel(dto) : null
    } catch (error) {
      console.error('Failed to fetch couple by auth user id:', error)
      throw error
    }
  }

  async createCouple(couple: Omit<Couple, 'id' | 'fullName' | 'createdAt'>): Promise<Couple> {
    try {
      const coupleCount = await coupleRepository.getCoupleCount()
      if (coupleCount >= 2) {
        throw new Error('Maximum of 2 couples allowed per wedding')
      }

      const dto = CoupleMapper.toDto(couple)
      const createdDto = await coupleRepository.createCouple(dto)
      return CoupleMapper.toModel(createdDto)
    } catch (error) {
      console.error('Failed to create couple:', error)
      throw error
    }
  }

  async updateCouple(id: string, updates: Partial<Pick<Couple, 'firstName' | 'lastName' | 'email'>>): Promise<Couple> {
    try {
      const updateDto = CoupleMapper.toUpdateDto(updates)
      const updatedDto = await coupleRepository.updateCouple(id, updateDto)
      return CoupleMapper.toModel(updatedDto)
    } catch (error) {
      console.error('Failed to update couple:', error)
      throw error
    }
  }

  async deleteCouple(id: string): Promise<void> {
    try {
      await coupleRepository.deleteCouple(id)
    } catch (error) {
      console.error('Failed to delete couple:', error)
      throw error
    }
  }

  async getCoupleCount(): Promise<number> {
    try {
      return await coupleRepository.getCoupleCount()
    } catch (error) {
      console.error('Failed to get couple count:', error)
      throw error
    }
  }

  async canAddMoreCouples(): Promise<boolean> {
    try {
      const count = await this.getCoupleCount()
      return count < 2
    } catch (error) {
      console.error('Failed to check if more couples can be added:', error)
      return false
    }
  }
}

export const coupleService = new CoupleService()