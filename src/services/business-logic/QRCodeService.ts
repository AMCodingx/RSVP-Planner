import QRCode from 'qrcode'
import { GroupRepository } from '../../storage/repositories/GroupRepository'

export class QRCodeService {
  private groupRepository: GroupRepository

  constructor() {
    this.groupRepository = new GroupRepository()
  }

  generateSecureToken(groupId: string): string {
    const timestamp = Date.now().toString()
    const randomComponent = Math.random().toString(36).substring(2)
    return btoa(`${groupId}:${timestamp}:${randomComponent}`)
  }

  extractGroupIdFromToken(token: string): string | null {
    try {
      const decoded = atob(token)
      const parts = decoded.split(':')
      return parts.length >= 3 ? parts[0] : null
    } catch (error) {
      return null
    }
  }

  generateRSVPUrl(groupId: string): string {
    const token = this.generateSecureToken(groupId)
    const baseUrl = window.location.origin
    return `${baseUrl}/rsvp/${token}`
  }

  async generateQRCodeDataURL(groupId: string): Promise<string> {
    const url = this.generateRSVPUrl(groupId)
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      
      return qrCodeDataURL
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateAndSaveQRCode(groupId: string): Promise<string> {
    try {
      const qrCodeDataURL = await this.generateQRCodeDataURL(groupId)
      const rsvpUrl = this.generateRSVPUrl(groupId)
      
      await this.groupRepository.updateQRCodeInfo(groupId, {
        qrCodeGenerated: true,
        qrCodeUrl: rsvpUrl
      })
      
      return qrCodeDataURL
    } catch (error) {
      throw new Error(`Failed to generate and save QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  downloadQRCode(dataURL: string, groupName: string): void {
    const link = document.createElement('a')
    link.download = `${groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_code.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async regenerateQRCode(groupId: string): Promise<string> {
    return this.generateAndSaveQRCode(groupId)
  }

  validateToken(token: string): boolean {
    const groupId = this.extractGroupIdFromToken(token)
    return groupId !== null && groupId.length > 0
  }
}