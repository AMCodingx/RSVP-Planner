import * as XLSX from 'xlsx'
import type { GroupWithGuests } from '../../ui/models/Guest'

export class ExcelExportService {
  
  exportGroupsToExcel(groups: GroupWithGuests[], filename: string = 'guest-list'): void {
    const exportData = this.prepareGroupExportData(groups)
    
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest Groups')
    
    const currentDate = new Date().toISOString().split('T')[0]
    const finalFilename = `${filename}-${currentDate}.xlsx`
    
    XLSX.writeFile(workbook, finalFilename)
  }
  
  private prepareGroupExportData(groups: GroupWithGuests[]) {
    return groups.map(group => ({
      'Naam': group.name,
      'Adres': group.address?.streetAddress || '',
      'Adres2': group.address?.houseNumber || '',
      'Postcode': group.address?.postalCode || '',
      'Woonplaats': group.address?.city || '',
      'Land': group.address?.country || ''
    }))
  }
}