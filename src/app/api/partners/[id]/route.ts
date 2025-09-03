import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiHandler } from '@/lib/api-handler'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const DELETE = createApiHandler(async (req: NextRequest, context: { params?: Record<string, string | string[]> }) => {
  const { params } = context
  if (!params?.id) {
    return NextResponse.json(
      { error: 'Partner ID is required' },
      { status: 400 }
    )
  }
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const id = params.id as string

  await prisma.partner.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
})