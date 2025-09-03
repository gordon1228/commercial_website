// src/types/next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
    sessionId: string
    createdAt: number
  }

  interface User {
    id: string
    email: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    sessionId?: string
    createdAt?: number
  }
}