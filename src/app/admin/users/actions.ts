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
    console.error('Error fetching users:', JSON.stringify(error, null, 2))
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
        phone: phone,
        role: role
      }
    })

    if (adminError) {
      if (adminError.message.includes('already been registered')) {
        // El usuario ya existe en AUTH. Intentamos buscar su ID para "reincribirlo" en PROFILES
        const { data: { users } } = await adminSupabase.auth.admin.listUsers()
        const found = users.find(u => u.email === email)
        if (found) {
          newUserId = found.id
        } else {
          return { error: adminError.message }
        }
      } else {
        return { error: adminError.message }
      }
    } else {
      newUserId = adminData?.user?.id
    }
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
          phone: phone,
          role: role
        }
      }
    })

    if (error) {
       if (error.message.includes('already been registered')) {
          // Si no tenemos service role, no podemos buscar el ID de otro usuario con el anon client por seguridad
          return { error: "Este correo ya está registrado en el sistema de autenticación." }
       }
       return { error: error.message }
    }
    newUserId = data?.user?.id
  }

  // 2. Sincronizar teléfono y datos adicionales en el perfil público (Profiles)
  // Esto es necesario porque el trigger de la base de datos no incluye todos los campos
  if (newUserId) {
    const { error: profileSyncError } = await supabase
      .from('profiles')
      .upsert({ 
        id: newUserId,
        email: email,
        full_name: fullName, 
        phone: phone,
        role: role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    
    if (profileSyncError) {
      console.error("Error syncing profile:", profileSyncError)
    }
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
  const supabase = await createClient()
  
  // 1. Intentamos eliminar de Auth usando el cliente administrativo si hay Service Role Key
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    try {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      
      const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('Error deleting user from Auth:', authError.message)
      }
    } catch (e) {
      console.error('Failed to initialize admin client for deletion:', e)
    }
  }

  // 2. Eliminamos de la tabla pública (Profiles)
  // Nota: Si hay cascade en la BD desde auth.users, esto podría ser redundante pero asegura la eliminación.
  const { error } = await supabase.from('profiles').delete().eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('DELETE_USER', `Se eliminó perfil de usuario permanentemente`, userId)

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

export async function assignPlanToUser(userId: string, _currentMembershipId: string | null, planId: string) {
  // Ignoramos el ID de membresía actual para forzar la creación de un nuevo registro
  // y así generar un nuevo cobro pendiente independiente.
  return renewMembership(userId, planId)
}

export async function renewMembership(userId: string, planId: string) {
  const supabase = await createClient()

  // 1. Obtener la duración del plan
  const { data: planData } = await supabase.from('plans').select('duration_days, name').eq('id', planId).single()
  if (!planData) return { error: 'Plan no encontrado' }

  // 2. Obtener la última membresía para ver cuándo termina
  // Usamos una consulta normal y tomamos el primer resultado para evitar errores de .single() si no hay registros
  const { data: mems, error: memError } = await supabase
    .from('memberships')
    .select('end_date')
    .eq('user_id', userId)
    .order('end_date', { ascending: false })
    .limit(1)

  if (memError) {
    console.error('Error fetching latest membership:', memError)
  }

  const latestMem = mems && mems.length > 0 ? mems[0] : null
  let startDate = new Date()
  
  // Si tiene una membresía que termina en el futuro, la renovación empieza justo después
  if (latestMem && new Date(latestMem.end_date) > new Date()) {
    startDate = new Date(latestMem.end_date)
    // Evitar solapamiento de un segundo
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
