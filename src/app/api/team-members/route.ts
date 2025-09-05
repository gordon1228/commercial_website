import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse } from '@/lib/api-handler'

const fallbackTeamMembers = [
  { id: '1', name: 'Ahmad Rahman', position: 'Founder & CEO', description: 'Visionary leader in sustainable mobility and green technology', image: null, order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Dr. Lee Wei Ming', position: 'CTO', description: 'Expert in electric vehicle technology and smart transport systems', image: null, order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Siti Nurhaliza', position: 'Head of Operations', description: 'Specialist in logistics optimization and fleet management', image: null, order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'James Tan', position: 'Partnership Director', description: 'Building strategic alliances with local and international partners', image: null, order: 4, active: true, createdAt: new Date(), updatedAt: new Date() }
]

export const GET = createApiHandler(async () => {
  try {
    let teamMembers = await prisma.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    if (!teamMembers || teamMembers.length === 0) {
      teamMembers = fallbackTeamMembers
    }

    return apiResponse(teamMembers)
  } catch (error) {
    console.error('Error fetching team members, using fallback:', error instanceof Error ? error.message : 'Unknown error')
    return apiResponse(fallbackTeamMembers)
  }
})