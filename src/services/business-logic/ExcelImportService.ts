import * as XLSX from 'xlsx'
import type { AddressFormData } from '../../ui/models/Address'

export interface ImportedGuest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  ageCategory: 'adult' | 'child'
  specialNotes?: string
  groupName?: string
  houseNumber?: string
  streetAddress?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
  deliveryInstructions?: string
}

export interface ImportedGroup {
  name: string
  guests: ImportedGuest[]
  address?: AddressFormData
}

export interface ImportValidationError {
  row: number
  field: string
  message: string
}

export interface ImportResult {
  groups: ImportedGroup[]
  individualGuests: ImportedGuest[]
  errors: ImportValidationError[]
}

export class ExcelImportService {
  
  generateTemplate(): void {
    const templateData = [
      {
        'Group Name': 'Smith Family',
        'First Name': 'John',
        'Last Name': 'Smith',
        'Phone': '+31612345678',
        'Age Category (adult or child)': 'adult',
        'Special Notes': 'Vegetarian',
        'House Number': '42',
        'Street Address': 'Main Street',
        'City': 'Amsterdam',
        'State/Province': 'Noord-Holland',
        'Postal Code': '1012AB',
        'Country': 'Netherlands',
        'Delivery Instructions': 'Ring doorbell'
      },
      {
        'Group Name': 'Smith Family',
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Phone': '+31612345679',
        'Age Category (adult or child)': 'adult',
        'Special Notes': '',
        'House Number': '',
        'Street Address': '',
        'City': '',
        'State/Province': '',
        'Postal Code': '',
        'Country': '',
        'Delivery Instructions': ''
      },
      {
        'Group Name': '',
        'First Name': 'Bob',
        'Last Name': 'Johnson',
        'Phone': '+31687654321',
        'Age Category (adult or child)': 'child',
        'Special Notes': 'Plus one allowed',
        'House Number': '15A',
        'Street Address': 'Canal Street',
        'City': 'Rotterdam',
        'State/Province': 'Zuid-Holland',
        'Postal Code': '3011AB',
        'Country': 'Netherlands',
        'Delivery Instructions': ''
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 25 }
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest Import Template')
    
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `wedding-guest-import-template-${currentDate}.xlsx`
    
    XLSX.writeFile(workbook, filename)
  }

  async parseExcelFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[]
          
          const result = this.processImportedData(jsonData)
          resolve(result)
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : 'Unknown error')))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  private processImportedData(data: any[]): ImportResult {
    const errors: ImportValidationError[] = []
    const groupMap = new Map<string, ImportedGuest[]>()
    const individualGuests: ImportedGuest[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2
      
      const guest = this.parseGuestRow(row, rowNumber, errors)
      
      if (guest) {
        if (guest.groupName) {
          if (!groupMap.has(guest.groupName)) {
            groupMap.set(guest.groupName, [])
          }
          groupMap.get(guest.groupName)!.push(guest)
        } else {
          individualGuests.push(guest)
        }
      }
    })

    const groups: ImportedGroup[] = Array.from(groupMap.entries()).map(([name, guests]) => {
      const firstGuestWithAddress = guests.find(g => g.streetAddress && g.city && g.postalCode && g.country)
      
      let address: AddressFormData | undefined
      if (firstGuestWithAddress) {
        address = {
          houseNumber: firstGuestWithAddress.houseNumber || '',
          streetAddress: firstGuestWithAddress.streetAddress || '',
          city: firstGuestWithAddress.city || '',
          stateProvince: firstGuestWithAddress.stateProvince || '',
          postalCode: firstGuestWithAddress.postalCode || '',
          country: firstGuestWithAddress.country || '',
          deliveryInstructions: firstGuestWithAddress.deliveryInstructions || ''
        }
      }

      return {
        name,
        guests,
        address
      }
    })

    return { groups, individualGuests, errors }
  }

  private parseGuestRow(row: any, rowNumber: number, errors: ImportValidationError[]): ImportedGuest | null {
    const firstName = this.getStringValue(row['First Name'])
    const lastName = this.getStringValue(row['Last Name'])

    if (!firstName) {
      errors.push({
        row: rowNumber,
        field: 'First Name',
        message: 'First name is required'
      })
      return null
    }

    if (!lastName) {
      errors.push({
        row: rowNumber,
        field: 'Last Name',
        message: 'Last name is required'
      })
      return null
    }

    const ageCategory = this.getStringValue(row['Age Category (adult or child)']) || this.getStringValue(row['Age Category'])
    if (ageCategory && ageCategory !== 'adult' && ageCategory !== 'child') {
      errors.push({
        row: rowNumber,
        field: 'Age Category',
        message: 'Age category must be "adult" or "child"'
      })
    }

    return {
      firstName,
      lastName,
      email: this.getStringValue(row['Email']),
      phone: this.getStringValue(row['Phone']),
      ageCategory: ageCategory === 'child' ? 'child' : 'adult',
      specialNotes: this.getStringValue(row['Special Notes']),
      groupName: this.getStringValue(row['Group Name']),
      houseNumber: this.getStringValue(row['House Number']),
      streetAddress: this.getStringValue(row['Street Address']),
      city: this.getStringValue(row['City']),
      stateProvince: this.getStringValue(row['State/Province']),
      postalCode: this.getStringValue(row['Postal Code']),
      country: this.getStringValue(row['Country']),
      deliveryInstructions: this.getStringValue(row['Delivery Instructions'])
    }
  }

  private getStringValue(value: any): string | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined
    }
    return String(value).trim()
  }
}
