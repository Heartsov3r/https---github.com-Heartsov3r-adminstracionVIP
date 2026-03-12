'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function getUserDetails(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memberships (
        *,
        plan:plans (
          *
        ),
        payments:manual_payments (
          *,
          payment_receipts (
            *
          )
        )
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Encontrar membresía activa/más reciente
  let latestMembership = null
  if (data.memberships && data.memberships.length > 0) {
    latestMembership = [...data.memberships].sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    )[0]
  }

  return { 
    data: { ...data, latestMembership }, 
    error: null 
  }
}

export async function updateUserProfile(userId: string, formData: FormData) {
  const supabase = await createClient()
  
  const fullName = (formData.get('fullName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || ''
  const password = (formData.get('password') as string)?.trim() || ''

  if (!fullName || !email) {
    return { error: 'El nombre y el correo son obligatorios' }
  }

  // Actualizar la tabla pública Profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone: phone })
    .eq('id', userId)

  if (profileError) {
    return { error: profileError.message }
  }

  // Actualizar Credentials en Auth.Users vía admin SDK
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const updateData: any = {
      email: email,
      user_metadata: { full_name: fullName, phone: phone }
    }
    
    if (password) {
      updateData.password = password
    }

    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      updateData
    )

    if (authError) {
       console.error("Error al actualizar auth.users:", authError.message)
       // Si el email falla (Ej. ya existe), retornamos error parcial, pero el profile se actualizó.
       return { error: `Perfil actualizado, pero falló credenciales: ${authError.message}` }
    }
  }

  await logAdminAction('UPDATE_USER', `Actualizó datos personales del cliente: ${fullName}`, userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function addMembershipDays(userId: string, currentMembershipId: string | null, daysToAdd: number) {
  const supabase = await createClient()

  if (!currentMembershipId) {
    // Si no tiene membresía activa, creamos una desde hoy
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysToAdd)

    const { error } = await supabase.from('memberships').insert({
      user_id: userId,
      plan_id: null, // "Custom" plan
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    })

    if (error) return { error: error.message }

  } else {
    // Si ya existe, le sumamos los días a su fecha de expedición
    const { data: memData } = await supabase.from('memberships').select('end_date').eq('id', currentMembershipId).single()
    if (!memData) return { error: 'Membresía no encontrada' }

    const newEndDate = new Date(memData.end_date)
    newEndDate.setDate(newEndDate.getDate() + daysToAdd)

    const { error } = await supabase.from('memberships')
      .update({ end_date: newEndDate.toISOString() })
      .eq('id', currentMembershipId)

    if (error) return { error: error.message }
  }

  await logAdminAction('ADD_DAYS', `Añadió ${daysToAdd} días extra manuales a su suscripción`, userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return { success: true }
}
