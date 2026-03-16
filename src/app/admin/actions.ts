'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { differenceInDays } from 'date-fns'
import { getBusinessDate } from '@/lib/utils'

export async function fetchDashboardStats() {
  const supabase = await createClient()

  // 1. Obtener todos los perfiles "clientes" y "admins" con fecha de registro
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')

  const clients = allProfiles?.filter(p => p.role === 'client') || []
  const admins = allProfiles?.filter(p => p.role === 'admin') || []

  // 2. Obtener todas las membresías con sus planes y pagos asociados para calcular deudas
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('*, plans(*), manual_payments(amount)')
    .order('end_date', { ascending: false })

  // 3. Obtener Pagos de este mes y preparar tendencia de últimos 7 días
  const nowInPeru = getBusinessDate()
  const today = new Date(nowInPeru)
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  
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

  if (profilesError) return { data: null, error: `Error perfiles: ${profilesError.message}` }
  if (membershipsError) return { data: null, error: `Error membresías: ${membershipsError.message}` }
  if (paymentsError) return { data: null, error: `Error pagos: ${paymentsError.message}` }

  // Lógica de Estado y Saldo Pendiente Total
  let activeCount = 0
  let soonToExpireCount = 0
  let expiredCount = 0
  let totalPendingBalance = 0
  const noMembershipCount = clients.length

  const latestMemberships = new Map()
  const planCounts: Record<string, number> = {}
  const activeVIPs: any[] = []
  const soonToExpireList: any[] = []
  const expiredList: any[] = []

  const now = getBusinessDate()

  memberships?.forEach(m => {
      if (!latestMemberships.has(m.user_id)) {
          const profile = (allProfiles?.find(p => p.id === m.user_id) || {}) as any
          const planName = m.plans?.name || 'Personalizado'
          const planPrice = m.plans?.price || 0
          
          // Cálculo de deuda real por membresía
          const totalPaidInM = m.manual_payments ? m.manual_payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0) : 0
          const debt = Math.max(0, planPrice - totalPaidInM)

          const userObj = {
              id: m.user_id,
              full_name: profile.full_name || 'Sin Nombre',
              email: profile.email,
              phone: profile.phone,
              plan_name: planName,
              end_date: m.end_date,
              debt: debt
          }
          latestMemberships.set(m.user_id, m)
          planCounts[planName] = (planCounts[planName] || 0) + 1
          
          const end = new Date(m.end_date)
          const diff = differenceInDays(end, now)

          if (diff < 0) {
              expiredCount++
              if (debt > 0) totalPendingBalance += debt
              if (expiredList.length < 5) expiredList.push(userObj)
          } else {
              activeCount++
              if (debt > 0) totalPendingBalance += debt
              if (diff <= 7) {
                  soonToExpireCount++
                  if (soonToExpireList.length < 5) soonToExpireList.push({ ...userObj, daysLeft: diff })
              } else {
                  if (activeVIPs.length < 5) activeVIPs.push(userObj)
              }
          }
      }
  })

  // Ingresos y Tendencia Semanal de 7 días
  let monthlyRevenue = 0
  let dailyRevenue = 0
  const recentActivity: any[] = []
  const weeklyTrend: Record<string, number> = {}
  
  // Inicializar tendencia de 7 días con ceros
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(sevenDaysAgo.getDate() + i)
    weeklyTrend[d.toISOString().split('T')[0]] = 0
  }

  payments?.forEach(p => {
    const amount = Number(p.amount)
    const pDateStr = p.payment_date.split('T')[0]
    monthlyRevenue += amount
    
    const pDate = new Date(p.payment_date)
    if (pDate >= today) {
      dailyRevenue += amount
    }

    if (weeklyTrend[pDateStr] !== undefined) {
      weeklyTrend[pDateStr] += amount
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

  // Crecimiento de Clientes (últimos 7 días)
  const newClientsWeekly = clients.filter(c => {
    if (!c.created_at) return false
    return new Date(c.created_at) >= sevenDaysAgo
  }).length

  return {
    data: {
      totalClients: noMembershipCount,
      activeMemberships: activeCount,
      soonToExpire: soonToExpireCount,
      expired: expiredCount,
      totalPendingBalance,
      monthlyRevenue,
      dailyRevenue,
      newClientsWeekly,
      planDistribution: Object.entries(planCounts).map(([name, value]) => ({ name, value })),
      weeklyRevenueData: Object.entries(weeklyTrend).map(([date, amount]) => ({ date, amount })),
      recentActivity,
      admins: admins.map(a => ({ full_name: a.full_name, phone: a.phone })),
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
  
  // Usar formateadores con zona horaria de Perú para agrupar correctamente
  const monthFormatter = new Intl.DateTimeFormat('es-PE', { month: 'short', timeZone: 'America/Lima' })
  const yearFormatter = new Intl.DateTimeFormat('es-PE', { year: 'numeric', timeZone: 'America/Lima' })
  const monthIndexFormatter = new Intl.DateTimeFormat('es-PE', { month: 'numeric', timeZone: 'America/Lima' })

  payments.forEach(p => {
    const date = new Date(p.payment_date)
    const amount = Number(p.amount)
    
    // Obtener valores en Perú
    const year = parseInt(yearFormatter.format(date))
    const monthName = monthFormatter.format(date).replace('.', '') // Abr. -> Abr
    const monthIndex = parseInt(monthIndexFormatter.format(date)) - 1 // 1-12 -> 0-11
    
    const monthKey = `${year}-${monthIndex}`

    // Mensual
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { 
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
        year, 
        total: 0, 
        count: 0 
      }
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

  // Convertir a arrays ordenados por fecha real
  const monthlyArray = Object.keys(monthlyData)
    .sort((a, b) => {
        const [yearA, monA] = a.split('-').map(Number)
        const [yearB, monB] = b.split('-').map(Number)
        if (yearA !== yearB) return yearA - yearB
        return monA - monB
    })
    .map(key => monthlyData[key])

  const yearlyArray = Object.values(yearlyData).sort((a, b) => a.year - b.year)

  // Calcular comparativa (vs mes anterior)
  let percentageChange = 0
  if (monthlyArray.length >= 2) {
    const lastMonth = monthlyArray[monthlyArray.length - 1].total
    const prevMonth = monthlyArray[monthlyArray.length - 2].total
    if (prevMonth > 0) {
      percentageChange = ((lastMonth - prevMonth) / prevMonth) * 100
    } else {
      percentageChange = 100
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
