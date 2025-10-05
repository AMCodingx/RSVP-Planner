import { useState } from 'react'
import { X, Edit, Copy, Printer, QrCode, Check, Trash2 } from 'lucide-react'
import { AddressService } from '../../services/business-logic/AddressService'
import { GroupService } from '../../services/business-logic/GroupService'
import { QRCodeService } from '../../services/business-logic/QRCodeService'
import { AddressForm } from './AddressForm'
import type { Address, AddressFormData } from '../models/Address'

interface AddressViewDialogProps {
  isOpen: boolean
  onClose: () => void
  address: Address | null
  groupId?: string
  groupName?: string
  onAddressUpdated?: () => void
}

export function AddressViewDialog({ 
  isOpen, 
  onClose, 
  address, 
  groupId,
  groupName,
  onAddressUpdated 
}: AddressViewDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const addressService = new AddressService()
  const groupService = new GroupService()
  const qrCodeService = new QRCodeService()

  if (!isOpen || !address) return null

  const handleEdit = async (formData: AddressFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await addressService.updateAddress(address.id, formData)
      onAddressUpdated?.()
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAddress = async () => {
    if (!groupId || !confirm('Are you sure you want to delete this address? This action cannot be undone.')) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      await groupService.removeAddressFromGroup(groupId)
      onAddressUpdated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    try {
      const formattedAddress = addressService.formatAddressForDisplay(address)
      await navigator.clipboard.writeText(formattedAddress)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setError('Failed to copy address to clipboard')
    }
  }

  const handlePrintAddress = () => {
    const formattedAddress = addressService.formatAddressForDisplay(address)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Address - ${groupName || 'Guest Group'}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                line-height: 1.6;
              }
              .header { 
                border-bottom: 2px solid #e5e7eb; 
                padding-bottom: 10px; 
                margin-bottom: 20px; 
              }
              .address-section {
                background: #f9fafb;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .address-label {
                font-weight: bold;
                color: #374151;
                margin-bottom: 8px;
              }
              .address-content {
                font-size: 16px;
                line-height: 1.8;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Group Address</h1>
              ${groupName ? `<p><strong>Group:</strong> ${groupName}</p>` : ''}
            </div>
            <div class="address-section">
              <div class="address-label">Address:</div>
              <div class="address-content">${formattedAddress}</div>
            </div>
            ${address.deliveryInstructions ? `
              <div class="address-section">
                <div class="address-label">Delivery Instructions:</div>
                <div class="address-content">${address.deliveryInstructions}</div>
              </div>
            ` : ''}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handlePrintWithQR = async () => {
    if (!groupId) {
      setError('Group ID is required for QR code printing')
      return
    }

    try {
      setIsLoading(true)
      const qrCodeDataURL = await qrCodeService.generateQRCodeDataURL(groupId)
      const formattedAddress = addressService.formatAddressForDisplay(address)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Address & QR Code - ${groupName || 'Guest Group'}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px; 
                  line-height: 1.6;
                }
                .header { 
                  border-bottom: 2px solid #e5e7eb; 
                  padding-bottom: 10px; 
                  margin-bottom: 20px; 
                  text-align: center;
                }
                .content {
                  display: flex;
                  gap: 30px;
                  align-items: flex-start;
                }
                .address-section {
                  flex: 1;
                  background: #f9fafb;
                  padding: 15px;
                  border-radius: 8px;
                }
                .qr-section {
                  text-align: center;
                  background: #f9fafb;
                  padding: 15px;
                  border-radius: 8px;
                }
                .section-label {
                  font-weight: bold;
                  color: #374151;
                  margin-bottom: 8px;
                }
                .address-content {
                  font-size: 16px;
                  line-height: 1.8;
                }
                .qr-code {
                  width: 200px;
                  height: 200px;
                  margin: 10px auto;
                }
                .qr-instructions {
                  font-size: 14px;
                  color: #6b7280;
                  margin-top: 10px;
                }
                @media print {
                  .content {
                    display: block;
                  }
                  .qr-section {
                    margin-top: 20px;
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Wedding Invitation</h1>
                ${groupName ? `<h2>${groupName}</h2>` : ''}
              </div>
              <div class="content">
                <div class="address-section">
                  <div class="section-label">Address:</div>
                  <div class="address-content">${formattedAddress}</div>
                  ${address.deliveryInstructions ? `
                    <div style="margin-top: 15px;">
                      <div class="section-label">Delivery Instructions:</div>
                      <div class="address-content">${address.deliveryInstructions}</div>
                    </div>
                  ` : ''}
                </div>
                <div class="qr-section">
                  <div class="section-label">RSVP QR Code</div>
                  <img src="${qrCodeDataURL}" alt="RSVP QR Code" class="qr-code" />
                  <div class="qr-instructions">
                    Scan this QR code to RSVP online
                  </div>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code for printing')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitialFormData = (): Partial<AddressFormData> => {
    return {
      houseNumber: address.houseNumber || '',
      streetAddress: address.streetAddress,
      city: address.city,
      stateProvince: address.stateProvince || '',
      postalCode: address.postalCode,
      country: address.country,
      deliveryInstructions: address.deliveryInstructions || ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Address' : 'Address Details'}
          </h2>
          <button
            onClick={() => {
              setIsEditing(false)
              setError(null)
              onClose()
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {isEditing ? (
            <div>
              <AddressForm
                initialData={getInitialFormData()}
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                isSubmitting={isLoading}
                submitButtonText="Update Address"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Address Display */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Address
                </h3>
                <div className="text-gray-900 dark:text-white">
                  {addressService.formatAddressForDisplay(address)}
                </div>
                {address.deliveryInstructions && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Instructions
                    </h4>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {address.deliveryInstructions}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Address
                </button>

                <button
                  onClick={handleCopyAddress}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintAddress}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print Address
                </button>

                {groupId && (
                  <button
                    onClick={handlePrintWithQR}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <QrCode className="h-4 w-4" />
                    {isLoading ? 'Loading...' : 'Print with QR'}
                  </button>
                )}

                {/* Delete Address Button */}
                {groupId && (
                  <button
                    onClick={handleDeleteAddress}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-colors disabled:opacity-50 col-span-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isLoading ? 'Deleting...' : 'Delete Address'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}