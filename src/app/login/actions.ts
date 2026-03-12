'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // get form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=Faltan+credenciales')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Credenciales+inválidas')
  }

  // Comprobar rol del usuario para redirigir
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?error=Error+inesperado')
  }

  // De momento, redirigimos todos a admin. Si tuvieramos tabla profile, 
  // haríamos la query aquí para separar admin de client
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
