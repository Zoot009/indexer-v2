// Generic action response type
export type ActionResponse<T = void> = 
  | { success: true; data:  T; message?: string }
  | { success: false; error: string; details?: Record<string, unknown> }

// Credit specific types
export interface CreditBalance {
  total: number
  used: number
  reserved: number
  available: number
  creditsPerCheck: number
}

export interface CreditCheckResult {
  canProceed: boolean
  available: number
  required: number
  shortfall: number
  maxUrlsAllowed: number
}

export interface ProjectStartResult {
  projectId: string
  urlCount: number
  creditsReserved:  number
  status: string
}