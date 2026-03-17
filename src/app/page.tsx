import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingContent from './LandingContent'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingContent searchParams={searchParams} />
  }

  // Si está autenticado, buscamos el perfil para redirigir correctamente
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/client')
  }

  return null
}
