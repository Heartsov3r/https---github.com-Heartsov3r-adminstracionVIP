'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function fetchUsers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memberships (
        *
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return { data: null, error: error.message }
  }

  // Obtenemos todos los perfiles, si hay membresías, luego ordenaremos por la más reciente
  const usersWithActiveMembership = data.map((profile: any) => {
    let latestMembership = null
    
    if (profile.memberships && profile.memberships.length > 0) {
      // Tomamos la membresía con end_date más lejana (activa o última)
      latestMembership = [...profile.memberships].sort(
        (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0]
    }

    return {
      ...profile,
      latestMembership
    }
  })

  return { data: usersWithActiveMembership, error: null }
}

export async function createUser(formData: FormData) {
  const supabase = await createClient()
  
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const fullName = (formData.get('fullName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || '' // Nuevo
  const role = (formData.get('role') as string || 'client')?.trim()
  const planId = formData.get('planId') as string // Nuevo

  if (!email || !password || !fullName) {
    return { error: 'Faltan campos obligatorios' }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let newUserId: string | undefined

  if (serviceRoleKey) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: adminData, error: adminError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone, // Guardamos el teléfono
        role: role
      }
    })

    if (adminError) return { error: adminError.message }
    newUserId = adminData?.user?.id
  } else {
    const { createClient: createAnonClient } = await import('@supabase/supabase-js')
    const anonSupabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await anonSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone, // Guardamos el teléfono
          role: role
        }
      }
    })

    if (error) {
       if (error.message.includes('rate limit')) {
         return { error: "Límite de seguridad alcanzado. Espera o usa la Service Role Key." }
       }
       return { error: error.message }
    }
    // En signUp a veces data.user puede venir nulo si requiere verificación estricta de correo.
    newUserId = data?.user?.id
  }

  // 2. Sincronizar teléfono y datos adicionales en el perfil público (Profiles)
  // Esto es necesario porque el trigger de la base de datos no incluye todos los campos
  if (newUserId) {
    await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        phone: phone // Sincronización explícita del teléfono
      })
      .eq('id', newUserId)
  }

  // 3. Crear membresía automática si se seleccionó un plan
  if (newUserId && planId && planId !== 'none') {
    // Buscamos duración del plan para calcular end_date
    const { data: planData } = await supabase.from('plans').select('duration_days').eq('id', planId).single()
    
    if (planData) {
       const startDate = new Date()
       const endDate = new Date()
       endDate.setDate(startDate.getDate() + planData.duration_days)

       const { error: membershipError } = await supabase.from('memberships').insert({
          user_id: newUserId,
          plan_id: planId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
       })

       if (membershipError) {
          console.error("Error asignando plan:", membershipError)
       }
    }
  }

  await logAdminAction('CREATE_USER', `Se registró un nuevo cliente: ${fullName}`, newUserId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  // Para eliminar usuarios desde supabase hay 2 formas en Client:
  // 1. RPCSql (admin flag)
  // 2. Usar service role key en servidor. Puesto que este es un proyecto Next SSR, vamos a borrar de "profiles".
  // Borrar profile en cascade NO borra auth.user usualmente, el trigger va hacia un lado.
  // Pero el requerimiento es desactivar o borrar perfiles. Borraremos el Profile, lo cual quita su acceso app.
  // En un caso real "Service Role Key" elimina auth.users íntegramente.

  const supabase = await createClient()

  // Eliminamos de la tabla pública directamente. Cascade en la BD puede estar mal configurado desde `profiles` hacia `auth.users`, 
  // lo normal es al revés. Pero es suficiente remover su perfil público para bloquear el acceso lógico si validamos profiles.
  const { error } = await supabase.from('profiles').delete().eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('DELETE_USER', `Se eliminó perfil de usuario`, userId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserRole(userId: string, currentRole: string) {
    const supabase = await createClient()
    const newRole = currentRole === 'admin' ? 'client' : 'admin'

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) return { error: error.message }
    revalidatePath('/admin/users')
    return { success: true }
}

export async function assignPlanToUser(userId: string, currentMembershipId: string | null, planId: string) {
  const supabase = await createClient()

  // Buscar duración del plan
  const { data: planData } = await supabase.from('plans').select('duration_days').eq('id', planId).single()
  if (!planData) return { error: 'Plan no encontrado' }

  // Usar idéntica lógica que addMembershipDays pero desde aquí
  if (!currentMembershipId) {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + planData.duration_days)

    const { error } = await supabase.from('memberships').insert({
      user_id: userId,
      plan_id: planId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    })
    if (error) return { error: error.message }
  } else {
    // Sumar días a la existente y cambiarle el plan_id si se requiere
    const { data: memData } = await supabase.from('memberships').select('end_date').eq('id', currentMembershipId).single()
    if (!memData) return { error: 'Membresía no encontrada' }

    const newEndDate = new Date(memData.end_date)
    newEndDate.setDate(newEndDate.getDate() + planData.duration_days)

    const { error } = await supabase.from('memberships')
      .update({ end_date: newEndDate.toISOString(), plan_id: planId })
      .eq('id', currentMembershipId)

    if (error) return { error: error.message }
  }

  await logAdminAction('ASSIGN_PLAN', `Asignó el plan ${planData.duration_days} días`, userId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function renewMembership(userId: string, planId: string) {
  const supabase = await createClient()

  // 1. Obtener la duración del plan
  const { data: planData } = await supabase.from('plans').select('duration_days, name').eq('id', planId).single()
  if (!planData) return { error: 'Plan no encontrado' }

  // 2. Obtener la última membresía para ver cuándo termina
  const { data: latestMem } = await supabase
    .from('memberships')
    .select('end_date')
    .eq('user_id', userId)
    .order('end_date', { ascending: false })
    .limit(1)
    .single()

  let startDate = new Date()
  
  // Si tiene una membresía que termina en el futuro, la renovación empieza justo después
  if (latestMem && new Date(latestMem.end_date) > new Date()) {
    startDate = new Date(latestMem.end_date)
    // Evitar solapamiento de segundos
    startDate.setSeconds(startDate.getSeconds() + 1)
  }

  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + planData.duration_days)

  // 3. Crear nueva membresía
  const { error } = await supabase.from('memberships').insert({
    user_id: userId,
    plan_id: planId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  })

  if (error) return { error: error.message }

  await logAdminAction('RENEW_MEMBERSHIP', `Renovó membresía con plan ${planData.name} (${planData.duration_days} días)`, userId)

  revalidatePath('/admin/users')
  revalidatePath('/admin/payments')
  return { success: true }
}
