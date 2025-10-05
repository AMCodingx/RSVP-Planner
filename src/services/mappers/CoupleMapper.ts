import type { CoupleDto } from '../../storage/dto/CoupleDto'
import type { Couple } from '../../ui/models/Couple'

export class CoupleMapper {
  static toModel(dto: CoupleDto): Couple {
    return {
      id: dto.id,
      authUserId: dto.auth_user_id,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      fullName: `${dto.first_name} ${dto.last_name}`,
      createdAt: new Date(dto.created_at)
    }
  }

  static toDto(model: Omit<Couple, 'id' | 'fullName' | 'createdAt'>): Omit<CoupleDto, 'id' | 'created_at'> {
    return {
      auth_user_id: model.authUserId,
      first_name: model.firstName,
      last_name: model.lastName,
      email: model.email
    }
  }

  static toUpdateDto(model: Partial<Pick<Couple, 'firstName' | 'lastName' | 'email'>>): Partial<Omit<CoupleDto, 'id' | 'created_at' | 'auth_user_id'>> {
    const updateData: Partial<Omit<CoupleDto, 'id' | 'created_at' | 'auth_user_id'>> = {}
    
    if (model.firstName !== undefined) {
      updateData.first_name = model.firstName
    }
    
    if (model.lastName !== undefined) {
      updateData.last_name = model.lastName
    }
    
    if (model.email !== undefined) {
      updateData.email = model.email
    }
    
    return updateData
  }
}