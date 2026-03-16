export type UserRole = 'admin' | 'client'
export type MembershipStatus = 'activa' | 'por_vencer' | 'vencida'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  duration_days: number
  is_active: boolean
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  plan_id: string | null
  start_date: string
  end_date: string
  // Status se calcula en la aplicación (no viene de BD en el query directo según nuestro fix SQL)
  created_at: string
  updated_at: string
  plan?: Plan // Join opcional
}

export interface ManualPayment {
  id: string
  membership_id: string
  amount: number
  payment_date: string
  notes: string | null
  registered_by: string | null
  payment_method_id: string | null
  created_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'bank_transfer' | 'digital_wallet' | 'crypto' | 'online_gateway' | 'other'
  details: string
  owner_name: string
  country?: string | null
  is_active: boolean
  created_at: string
}

export interface PaymentReceipt {
  id: string
  payment_id: string
  file_url: string
  storage_path: string
  uploaded_at: string
}

// Interfaz extendida para el listado de usuarios en Admin Dashboard (Profile + Última Membresía)
export interface UserWithMembership extends Profile {
  memberships?: Membership[] // Para sacar los datos de la última membresía si la tiene
}
