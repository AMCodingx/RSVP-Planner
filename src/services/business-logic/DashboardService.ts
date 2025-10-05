import { GuestService } from './GuestService'
import { coupleService } from './CoupleService'
import type { Guest, GroupWithGuests } from '../../ui/models/Guest'

export interface DashboardStats {
  attendance: AttendanceSummary
  rsvpProgress: RsvpProgress
  demographics: Demographics
  inviterStats: InviterStats
  recentActivity: RecentActivity[]
  groupStats: GroupStats
  countryStats: CountryStats
  quickNumbers: QuickNumbers
}

export interface AttendanceSummary {
  totalInvited: number
  confirmed: number
  declined: number
  pending: number
  responseRate: number
  confirmedRate: number
  declinedRate: number
}

export interface RsvpProgress {
  totalResponses: number
  totalInvited: number
  responseRate: number
  pendingResponses: number
  completedResponses: number
  progressPercentage: number
}

export interface Demographics {
  adults: {
    total: number
    confirmed: number
    pending: number
    declined: number
  }
  children: {
    total: number
    confirmed: number
    pending: number
    declined: number
  }
  totalAttending: number
  totalDeclined: number
  totalPending: number
}

export interface InviterStats {
  [coupleName: string]: {
    total: number
    confirmed: number
    pending: number
    declined: number
    responseRate: number
  }
}

export interface RecentActivity {
  id: string
  type: 'guest_added' | 'rsvp_confirmed' | 'rsvp_declined' | 'group_created'
  guestName?: string
  groupName?: string
  timestamp: Date
  description: string
}

export interface GroupStats {
  totalGroups: number
  groupsWithQR: number
  groupsWithoutQR: number
  averageGroupSize: number
  largestGroup: {
    name: string
    size: number
  }
  fullyConfirmedGroups: number
  fullyDeclinedGroups: number
  partialResponseGroups: number
}

export interface CountryStats {
  totalCountries: number
  topCountries: Array<{
    country: string
    guestCount: number
    confirmedCount: number
    pendingCount: number
    declinedCount: number
  }>
}

export interface QuickNumbers {
  totalAttending: number
  totalPending: number
  totalDeclined: number
  needsResponse: number
  adultsAttending: number
  childrenAttending: number
}

export class DashboardService {
  private guestService: GuestService

  constructor() {
    this.guestService = new GuestService()
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [guests, groupsData] = await Promise.all([
      this.guestService.getAllGuests(),
      this.guestService.getGuestsGroupedByInvitation()
    ])

    const { groups } = groupsData
    const allGuests = [...guests]

    const inviterStats = await this.calculateInviterStats(allGuests)

    return {
      attendance: this.calculateAttendanceSummary(allGuests),
      rsvpProgress: this.calculateRsvpProgress(allGuests),
      demographics: this.calculateDemographics(allGuests),
      inviterStats,
      recentActivity: this.generateRecentActivity(allGuests, groups),
      groupStats: this.calculateGroupStats(groups),
      countryStats: this.calculateCountryStats(groups),
      quickNumbers: this.calculateQuickNumbers(allGuests)
    }
  }

  private calculateAttendanceSummary(guests: Guest[]): AttendanceSummary {
    const total = guests.length
    const confirmed = guests.filter(g => g.rsvpStatus === 'confirmed').length
    const declined = guests.filter(g => g.rsvpStatus === 'declined').length
    const pending = guests.filter(g => g.rsvpStatus === 'pending').length

    const responseRate = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0
    const confirmedRate = total > 0 ? Math.round((confirmed / total) * 100) : 0
    const declinedRate = total > 0 ? Math.round((declined / total) * 100) : 0

    return {
      totalInvited: total,
      confirmed,
      declined,
      pending,
      responseRate,
      confirmedRate,
      declinedRate
    }
  }

  private calculateRsvpProgress(guests: Guest[]): RsvpProgress {
    const totalInvited = guests.length
    const pendingResponses = guests.filter(g => g.rsvpStatus === 'pending').length
    const completedResponses = totalInvited - pendingResponses
    const progressPercentage = totalInvited > 0 ? Math.round((completedResponses / totalInvited) * 100) : 0

    return {
      totalResponses: completedResponses,
      totalInvited,
      responseRate: progressPercentage,
      pendingResponses,
      completedResponses,
      progressPercentage
    }
  }

  private calculateDemographics(guests: Guest[]): Demographics {
    const adults = guests.filter(g => g.ageCategory === 'adult')
    const children = guests.filter(g => g.ageCategory === 'child')

    const adultStats = {
      total: adults.length,
      confirmed: adults.filter(g => g.rsvpStatus === 'confirmed').length,
      pending: adults.filter(g => g.rsvpStatus === 'pending').length,
      declined: adults.filter(g => g.rsvpStatus === 'declined').length
    }

    const childStats = {
      total: children.length,
      confirmed: children.filter(g => g.rsvpStatus === 'confirmed').length,
      pending: children.filter(g => g.rsvpStatus === 'pending').length,
      declined: children.filter(g => g.rsvpStatus === 'declined').length
    }

    return {
      adults: adultStats,
      children: childStats,
      totalAttending: adultStats.confirmed + childStats.confirmed,
      totalDeclined: adultStats.declined + childStats.declined,
      totalPending: adultStats.pending + childStats.pending
    }
  }

  private async calculateInviterStats(guests: Guest[]): Promise<InviterStats> {
    try {
      const couples = await coupleService.getAllCouples()
      const inviterStats: InviterStats = {}

      // Group guests by couple
      couples.forEach(couple => {
        const coupleGuests = guests.filter(g => g.invitedBy === couple.id)
        
        if (coupleGuests.length > 0) {
          const total = coupleGuests.length
          const confirmed = coupleGuests.filter(g => g.rsvpStatus === 'confirmed').length
          const pending = coupleGuests.filter(g => g.rsvpStatus === 'pending').length
          const declined = coupleGuests.filter(g => g.rsvpStatus === 'declined').length
          const responseRate = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0

          inviterStats[couple.fullName] = {
            total,
            confirmed,
            pending,
            declined,
            responseRate
          }
        }
      })

      return inviterStats
    } catch (error) {
      console.error('Failed to calculate inviter stats:', error)
      return {}
    }
  }

  private generateRecentActivity(guests: Guest[], groups: GroupWithGuests[]): RecentActivity[] {
    const activities: RecentActivity[] = []

    // Recent guests (last 10 days)
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const recentGuests = guests
      .filter(guest => guest.dateAdded > tenDaysAgo)
      .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
      .slice(0, 5)

    recentGuests.forEach(guest => {
      activities.push({
        id: `guest-${guest.id}`,
        type: 'guest_added',
        guestName: `${guest.firstName} ${guest.lastName}`,
        groupName: guest.groupName,
        timestamp: guest.dateAdded,
        description: `Added ${guest.firstName} ${guest.lastName}${guest.groupName ? ` to ${guest.groupName}` : ''}`
      })
    })

    // Recent RSVP confirmations
    const recentConfirmed = guests
      .filter(guest => guest.rsvpStatus === 'confirmed')
      .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
      .slice(0, 3)

    recentConfirmed.forEach(guest => {
      activities.push({
        id: `rsvp-confirmed-${guest.id}`,
        type: 'rsvp_confirmed',
        guestName: `${guest.firstName} ${guest.lastName}`,
        groupName: guest.groupName,
        timestamp: guest.dateAdded,
        description: `${guest.firstName} ${guest.lastName} confirmed attendance`
      })
    })

    // Recent group creations
    const recentGroups = groups
      .filter(group => group.dateCreated > tenDaysAgo)
      .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime())
      .slice(0, 3)

    recentGroups.forEach(group => {
      activities.push({
        id: `group-${group.id}`,
        type: 'group_created',
        groupName: group.name,
        timestamp: group.dateCreated,
        description: `Created group "${group.name}" with ${group.guestCount} guest${group.guestCount !== 1 ? 's' : ''}`
      })
    })

    // Sort all activities by timestamp and return top 8
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8)
  }

  private calculateGroupStats(groups: GroupWithGuests[]): GroupStats {
    const groupsWithQR = groups.filter(g => g.qrCodeGenerated).length
    const groupsWithoutQR = groups.filter(g => !g.qrCodeGenerated).length

    let totalGuestsInGroups = 0
    let largestGroup = { name: 'None', size: 0 }
    let fullyConfirmedGroups = 0
    let fullyDeclinedGroups = 0
    let partialResponseGroups = 0

    groups.forEach(group => {
      const size = group.guests.length
      totalGuestsInGroups += size

      if (size > largestGroup.size) {
        largestGroup = { name: group.name, size }
      }

      // Check response status
      const confirmed = group.guests.filter(g => g.rsvpStatus === 'confirmed').length
      const declined = group.guests.filter(g => g.rsvpStatus === 'declined').length
      const pending = group.guests.filter(g => g.rsvpStatus === 'pending').length

      if (confirmed === size) {
        fullyConfirmedGroups++
      } else if (declined === size) {
        fullyDeclinedGroups++
      } else if (pending < size) {
        partialResponseGroups++
      }
    })

    const averageGroupSize = groups.length > 0 ? Math.round(totalGuestsInGroups / groups.length) : 0

    return {
      totalGroups: groups.length,
      groupsWithQR,
      groupsWithoutQR,
      averageGroupSize,
      largestGroup,
      fullyConfirmedGroups,
      fullyDeclinedGroups,
      partialResponseGroups
    }
  }

  private calculateCountryStats(groups: GroupWithGuests[]): CountryStats {
    const countryMap = new Map<string, {
      guestCount: number
      confirmedCount: number
      pendingCount: number
      declinedCount: number
    }>()

    groups.forEach(group => {
      if (group.address?.country) {
        const country = group.address.country
        const existing = countryMap.get(country) || {
          guestCount: 0,
          confirmedCount: 0,
          pendingCount: 0,
          declinedCount: 0
        }

        group.guests.forEach(guest => {
          existing.guestCount++
          if (guest.rsvpStatus === 'confirmed') existing.confirmedCount++
          else if (guest.rsvpStatus === 'pending') existing.pendingCount++
          else if (guest.rsvpStatus === 'declined') existing.declinedCount++
        })

        countryMap.set(country, existing)
      }
    })

    const topCountries = Array.from(countryMap.entries())
      .map(([country, stats]) => ({
        country,
        ...stats
      }))
      .sort((a, b) => b.guestCount - a.guestCount)
      .slice(0, 5)

    return {
      totalCountries: countryMap.size,
      topCountries
    }
  }

  private calculateQuickNumbers(guests: Guest[]): QuickNumbers {
    const adults = guests.filter(g => g.ageCategory === 'adult')
    const children = guests.filter(g => g.ageCategory === 'child')

    return {
      totalAttending: guests.filter(g => g.rsvpStatus === 'confirmed').length,
      totalPending: guests.filter(g => g.rsvpStatus === 'pending').length,
      totalDeclined: guests.filter(g => g.rsvpStatus === 'declined').length,
      needsResponse: guests.filter(g => g.rsvpStatus === 'pending').length,
      adultsAttending: adults.filter(g => g.rsvpStatus === 'confirmed').length,
      childrenAttending: children.filter(g => g.rsvpStatus === 'confirmed').length
    }
  }

  async getAttendanceOverTime(): Promise<{ date: string; confirmed: number; declined: number }[]> {
    // This would require tracking RSVP submission dates in the future
    // For now, return sample data based on guest addition dates
    const guests = await this.guestService.getAllGuests()
    
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date
    })

    return last30Days.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      const guestsOnDate = guests.filter(g => 
        g.dateAdded.toISOString().split('T')[0] === dateStr
      )

      return {
        date: dateStr,
        confirmed: guestsOnDate.filter(g => g.rsvpStatus === 'confirmed').length,
        declined: guestsOnDate.filter(g => g.rsvpStatus === 'declined').length
      }
    })
  }
}