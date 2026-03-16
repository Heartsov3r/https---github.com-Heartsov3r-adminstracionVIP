import { createAdminClient } from './src/lib/supabase/server'

async function rescueAdmin() {
  console.log('🚀 Iniciando rescate de cuenta de administrador...')
  
  const supabase = await createAdminClient()
  
  // 1. Obtener el usuario actual logueado (el que tiene la sesión abierta)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Error accediendo a la lista de usuarios:', authError.message)
    return
  }

  // Buscamos al usuario que pusiste en la captura anterior (o el primero que sea admin en metadata)
  const targetUser = users.find(u => u.user_metadata?.role === 'admin') || users[0]

  if (!targetUser) {
    console.error('❌ No se encontró ningún usuario para rescatar.')
    return
  }

  console.log(`🔍 Intentando restaurar perfil para: ${targetUser.email}`)

  // 2. Insertar o actualizar en la tabla profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: targetUser.id,
      email: targetUser.email,
      full_name: targetUser.user_metadata?.full_name || 'Admin Rescatado',
      role: 'admin',
      updated_at: new Date().toISOString()
    })

  if (profileError) {
    console.error('❌ Error restaurando perfil:', profileError.message)
  } else {
    console.log('✅ ¡Perfil de Administrador restaurado con éxito!')
    console.log('✨ Ahora ya deberías poder ver los planes y usuarios sin errores.')
  }
}

rescueAdmin()
