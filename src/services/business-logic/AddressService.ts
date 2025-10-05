import { AddressRepository } from '../../storage/repositories/AddressRepository'
import { AddressMapper } from '../mappers/AddressMapper'
import type { Address, AddressFormData } from '../../ui/models/Address'

export class AddressService {
  private addressRepository: AddressRepository

  constructor() {
    this.addressRepository = new AddressRepository()
  }

  async createAddress(formData: AddressFormData): Promise<Address> {
    const addressDto = AddressMapper.formDataToDto(formData)
    const createdDto = await this.addressRepository.create(addressDto)
    return AddressMapper.dtoToModel(createdDto)
  }

  async getAddressById(id: string): Promise<Address | null> {
    const dto = await this.addressRepository.getById(id)
    return dto ? AddressMapper.dtoToModel(dto) : null
  }

  async getAllAddresses(): Promise<Address[]> {
    const dtos = await this.addressRepository.getAll()
    return dtos.map(dto => AddressMapper.dtoToModel(dto))
  }

  async updateAddress(id: string, formData: AddressFormData): Promise<Address> {
    const updates = AddressMapper.formDataToDto(formData)
    const updatedDto = await this.addressRepository.update(id, updates)
    return AddressMapper.dtoToModel(updatedDto)
  }

  async deleteAddress(id: string): Promise<void> {
    await this.addressRepository.delete(id)
  }

  formatAddressForDisplay(address: Address): string {
    const parts = [
      address.houseNumber && address.streetAddress ? `${address.houseNumber} ${address.streetAddress}` : address.streetAddress,
      address.city,
      address.stateProvince,
      address.postalCode,
      address.country
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  validateAddress(formData: AddressFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!formData.country.trim()) {
      errors.push('Country is required')
    }

    if (!formData.streetAddress.trim()) {
      errors.push('Street address is required')
    }

    if (!formData.city.trim()) {
      errors.push('City is required')
    }

    if (!formData.postalCode.trim()) {
      errors.push('Postal code is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}