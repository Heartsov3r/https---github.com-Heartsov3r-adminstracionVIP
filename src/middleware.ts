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

    const url = request.nextUrl.clone()
    const isAuthPage = url.pathname.startsWith('/login')
    const isAdminPage = url.pathname.startsWith('/admin')
    const isClientPage = url.pathname.startsWith('/client')
    const isRootPage = url.pathname === '/'

    // Solo verificar auth en rutas que lo necesitan
    const needsAuth = isAdminPage || isClientPage || isAuthPage || isRootPage
    if (!needsAuth) {
      return supabaseResponse
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // No autenticado: redirigir áreas protegidas a /login
    if (!user && (isAdminPage || isClientPage)) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Solo consultar perfil una vez cuando es necesario
    if (user && (isAuthPage || isRootPage || isAdminPage)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role

      // Autenticado en login o raíz: redirigir según rol
      if (isAuthPage || isRootPage) {
        url.pathname = role === 'admin' ? '/admin' : '/client'
        return NextResponse.redirect(url)
      }

      // Proteger rutas de admin: un cliente no puede ir a /admin
      if (isAdminPage && role !== 'admin') {
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
