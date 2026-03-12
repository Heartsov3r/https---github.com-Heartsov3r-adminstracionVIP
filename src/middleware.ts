import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Missing Supabase environment variables in middleware')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const isAuthPage = url.pathname.startsWith('/login')
    const isAdminPage = url.pathname.startsWith('/admin')
    const isClientPage = url.pathname.startsWith('/client')
    const isRootPage = url.pathname === '/'

    // No autenticado: redirigir a login
    if (!user && (isAdminPage || isClientPage || isRootPage)) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Autenticado: redirigir según rol
    if (user && (isAuthPage || isRootPage)) {
      // Leer rol desde profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role
      url.pathname = role === 'admin' ? '/admin' : '/client'
      return NextResponse.redirect(url)
    }

    // Proteger rutas de admin: un cliente no puede ir a /admin
    if (user && isAdminPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        url.pathname = '/client'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (e) {
    console.error('Middleware error:', e)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
