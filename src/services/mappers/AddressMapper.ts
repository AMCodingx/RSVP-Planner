import type { AddressDto } from '../../storage/dto/AddressDto'
import type { Address, AddressFormData } from '../../ui/models/Address'

export class AddressMapper {
  static dtoToModel(dto: AddressDto): Address {
    return {
      id: dto.id,
      houseNumber: dto.house_number || undefined,
      streetAddress: dto.street_address,
      city: dto.city,
      stateProvince: dto.state_province || undefined,
      postalCode: dto.postal_code,
      country: dto.country,
      deliveryInstructions: dto.delivery_instructions || undefined,
      dateCreated: new Date(dto.created_at)
    }
  }

  static modelToDto(model: Address): Omit<AddressDto, 'id' | 'created_at'> {
    return {
      house_number: model.houseNumber || null,
      street_address: model.streetAddress,
      city: model.city,
      state_province: model.stateProvince || null,
      postal_code: model.postalCode,
      country: model.country,
      delivery_instructions: model.deliveryInstructions || null
    }
  }

  static formDataToDto(formData: AddressFormData): Omit<AddressDto, 'id' | 'created_at'> {
    return {
      house_number: formData.houseNumber || null,
      street_address: formData.streetAddress,
      city: formData.city,
      state_province: formData.stateProvince || null,
      postal_code: formData.postalCode,
      country: formData.country,
      delivery_instructions: formData.deliveryInstructions || null
    }
  }

  static modelToFormData(model: Address): AddressFormData {
    return {
      houseNumber: model.houseNumber || '',
      streetAddress: model.streetAddress,
      city: model.city,
      stateProvince: model.stateProvince || '',
      postalCode: model.postalCode,
      country: model.country,
      deliveryInstructions: model.deliveryInstructions || ''
    }
  }
}