'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { differenceInDays } from 'date-fns'
import { getBusinessDate } from '@/lib/utils'

export async function fetchDashboardStats() {
  const supabase = await createClient()

  // 1. Obtener todos los usuarios "clientes"
  const { data: clients, error: clientsError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'client')

  // 2. Obtener todas las membresías con sus planes
  // Solo la última membresía por usuario (haciendo un query ordenado)
  // Como la DB de Supabase con JS a veces es difícil de estructurar, traeremos todas y agrupamos en memoria
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('*, plans(*), profiles(*)')
    .order('end_date', { ascending: false })

  // 3. Obtener Pagos de este mes y de HOY
  const nowInPeru = getBusinessDate()
  const today = new Date(nowInPeru)
  today.setHours(0, 0, 0, 0)
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const { data: payments, error: paymentsError } = await supabase
    .from('manual_payments')
    .select(`
      amount,
      payment_date,
      memberships (
        profiles (full_name),
        plans (name)
      )
    `)
    .gte('payment_date', firstDayOfMonth.toISOString())
    .order('payment_date', { ascending: false })

  if (clientsError) {
    console.error('Clients error:', clientsError)
    return { data: null, error: `Error clientes: ${clientsError.message}` }
  }
  if (membershipsError) {
    console.error('Memberships error:', membershipsError)
    return { data: null, error: `Error membresías: ${membershipsError.message}` }
  }
  if (paymentsError) {
    console.error('Payments error:', paymentsError)
    return { data: null, error: `Error pagos: ${paymentsError.message}` }
  }

  // Lógica de Estado
  let activeCount = 0
  let soonToExpireCount = 0
  let expiredCount = 0
  const noMembershipCount = clients ? clients.length : 0

  // Agrupamos la membresia más reciente por usuario
  const latestMemberships = new Map()
  const planCounts: Record<string, number> = {}
  
  // Detalle de listas
  const activeVIPs: any[] = []
  const soonToExpireList: any[] = []
  const expiredList: any[] = []

  const now = getBusinessDate()

  memberships?.forEach(m => {
      if (!latestMemberships.has(m.user_id)) {
          const profile = m.profiles || {}
          const planName = m.plans?.name || 'Personalizado'
          const userObj = {
              id: m.user_id,
              full_name: profile.full_name || 'Sin Nombre',
              email: profile.email,
              plan_name: planName,
              end_date: m.end_date
          }
          latestMemberships.set(m.user_id, m)
          planCounts[planName] = (planCounts[planName] || 0) + 1
          
          const end = new Date(m.end_date)
          const diff = differenceInDays(end, now)

          if (diff < 0) {
              expiredCount++
              if (expiredList.length < 5) expiredList.push(userObj)
          } else if (diff <= 7) {
              soonToExpireCount++
              activeCount++
              if (soonToExpireList.length < 5) soonToExpireList.push({ ...userObj, daysLeft: diff })
          } else {
              activeCount++
              if (activeVIPs.length < 5) activeVIPs.push(userObj)
          }
      }
  })

  // Ingresos
  let monthlyRevenue = 0
  let dailyRevenue = 0
  const recentActivity: any[] = []

  payments?.forEach(p => {
    const amount = Number(p.amount)
    monthlyRevenue += amount
    
    const pDate = new Date(p.payment_date)
    if (pDate >= today) {
      dailyRevenue += amount
    }

    if (recentActivity.length < 5) {
      const m: any = p.memberships
      recentActivity.push({
        amount,
        date: p.payment_date,
        customerName: m?.profiles?.full_name || 'Desconocido',
        planName: m?.plans?.name || 'Plan'
      })
    }
  })

  return {
    data: {
      totalClients: noMembershipCount,
      activeMemberships: activeCount,
      soonToExpire: soonToExpireCount,
      expired: expiredCount,
      monthlyRevenue,
      dailyRevenue,
      planDistribution: Object.entries(planCounts).map(([name, value]) => ({ name, value })),
      recentActivity,
      details: {
          activeVIPs,
          soonToExpireList,
          expiredList
      }
    },
    error: null
  }
}

export async function getCurrentAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: 'No autenticado' }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data: profile, error: error ? error.message : null }
}
export async function updateAdminProfile(formData: { full_name: string, phone?: string, description?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.full_name,
      phone: formData.phone,
      description: formData.description,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function registerNewAdmin(formData: any) {
  const supabase = await createAdminClient()
  
  // 1. Crear el usuario en Auth con el API admin
  const { data, error } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.full_name,
      role: 'admin',
      phone: formData.phone
    }
  })

  if (error) {
    return { error: error.message }
  }
  
  return { data, error: null }
}

export async function fetchFinancialStats() {
  const supabase = await createClient()
  const { data: payments, error } = await supabase
    .from('manual_payments')
    .select('amount, payment_date')
    .order('payment_date', { ascending: true })

  if (error) return { data: null, error: error.message }
  if (!payments || payments.length === 0) return { data: { monthly: [], yearly: [], grandTotal: 0, percentageChange: 0 }, error: null }

  const monthlyData: Record<string, { month: string, year: number, total: number, count: number }> = {}
  const yearlyData: Record<number, { year: number, total: number, count: number }> = {}
  
  let grandTotal = 0
  
  payments.forEach(p => {
    const date = new Date(p.payment_date)
    const amount = Number(p.amount)
    
    const year = date.getFullYear()
    const monthIndex = date.getMonth()
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const monthKey = `${year}-${monthIndex}`

    // Mensual
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthNames[monthIndex], year, total: 0, count: 0 }
    }
    monthlyData[monthKey].total += amount
    monthlyData[monthKey].count += 1

    // Anual
    if (!yearlyData[year]) {
      yearlyData[year] = { year, total: 0, count: 0 }
    }
    yearlyData[year].total += amount
    yearlyData[year].count += 1

    grandTotal += amount
  })

  // Convertir a arrays ordenados
  const monthlyArray = Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
  })

  const yearlyArray = Object.values(yearlyData).sort((a, b) => a.year - b.year)

  // Calcular comparativa (vs mes anterior)
  let percentageChange = 0
  if (monthlyArray.length >= 2) {
    const lastMonth = monthlyArray[monthlyArray.length - 1].total
    const prevMonth = monthlyArray[monthlyArray.length - 2].total
    if (prevMonth > 0) {
      percentageChange = ((lastMonth - prevMonth) / prevMonth) * 100
    } else {
      percentageChange = 100 // Crecimiento infinito si el anterior fue 0
    }
  }

  return {
    data: {
      monthly: monthlyArray,
      yearly: yearlyArray,
      grandTotal,
      percentageChange
    },
    error: null
  }
}
