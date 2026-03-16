import { fetchDashboardStats, getCurrentAdmin } from './actions'
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  XCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  Zap,
  Activity,
  History,
  User,
  Clock,
  MessageCircle,
  TrendingDown,
  ChevronRight,
  CreditCard,
  Target
} from 'lucide-react'
import { WhatsAppClientButton } from './components/WhatsAppClientButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClientDateTime } from '@/components/ui/client-datetime'
import { cn } from '@/lib/utils'

function RevenueChart({ data }: { data: { date: string, amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 10)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (d.amount / max) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full h-24 relative overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 100 L 0 ${100 - (data[0].amount / max) * 100} L ${points} L 100 100 Z`}
          fill="url(#chartGradient)"
        />
        <polyline
          fill="none"
          stroke="rgb(16, 185, 129)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const [{ data: stats, error }, { data: admin }] = await Promise.all([
    fetchDashboardStats(),
    getCurrentAdmin()
  ])

  if (error || !stats) {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight mb-8">Panel de Control</h1>
        <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl border border-red-500/20 backdrop-blur-md">
            Error cargando métricas: {error}
        </div>
      </div>
    )
  }

  const adminName = admin?.full_name?.split(' ')[0] || 'Administrador'

  return (
    <div className="p-4 sm:p-8 space-y-8 sm:space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      
      {/* 🚀 ESTRATEGIC HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 border-b border-white/5 pb-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Sistema Activo
               </div>
               <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-40">Dashboard 2.0</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter leading-[0.8] italic">
               Panel de <span className="text-primary not-italic">Control</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm flex items-center gap-2 flex-wrap">
               Bienvenido, <span className="text-foreground font-bold">{adminName}</span>
               {' · '}<ClientDateTime />
            </p>
         </div>

         <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-[2rem] backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white ring-4 ring-primary/20">
               <User className="w-7 h-7" />
            </div>
            <div className="pr-4">
               <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Admin VIP</p>
               <p className="text-lg font-black tracking-tight text-foreground">{admin?.full_name}</p>
            </div>
         </div>
      </div>

      {/* 📊 KPI COMMAND CENTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         {/* KPI: Recaudación Hoy */}
         <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] bg-emerald-500/5 border-emerald-500/20 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
               <DollarSign className="w-16 h-16" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 mb-2">Caja de Hoy</p>
               <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">${stats.dailyRevenue.toLocaleString()}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
               <TrendingUp className="w-3 h-3" />
               Ingresos del día
            </div>
         </div>

         {/* KPI: Pendientes de Cobro (DEUDA) */}
         <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] bg-amber-500/5 border-amber-500/20 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
               <Target className="w-16 h-16" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/70 mb-2">Saldo Pendiente</p>
               <h3 className="text-4xl font-black text-amber-500 tracking-tighter">${stats.totalPendingBalance.toLocaleString()}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-amber-500/60 uppercase tracking-widest">
               <AlertTriangle className="w-3 h-3" />
               Cuentas por cobrar
            </div>
         </div>

         {/* KPI: Clientes Totales */}
         <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
               <Users className="w-16 h-16" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Clientes Totales</p>
               <h3 className="text-4xl font-black text-foreground tracking-tighter">{stats.totalClients}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {stats.newClientsWeekly} nuevos esta semana
               </span>
            </div>
         </div>

         {/* KPI: Recaudación Mes */}
         <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] bg-white/[0.02] border-white/5 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
               <TrendingUp className="w-16 h-16" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total del Mes</p>
               <h3 className="text-4xl font-black text-foreground tracking-tighter">${stats.monthlyRevenue.toLocaleString()}</h3>
            </div>
            <div className="mt-4">
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-2/3" />
               </div>
            </div>
         </div>
      </div>

      {/* 📈 ANALYTICS & TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
         {/* Left: Trend Chart */}
         <div className="lg:col-span-8 space-y-8">
            <div className="glass-card p-8 rounded-[3rem] bg-white/[0.01] border-white/5 shadow-2xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                        <TrendingUp className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Rendimiento Semanal</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">Ingresos históricos (últimos 7 días)</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">Tendencia Positiva</span>
                  </div>
               </div>
               
               <RevenueChart data={stats.weeklyRevenueData} />

               <div className="grid grid-cols-7 mt-6">
                  {stats.weeklyRevenueData.map((d, i) => (
                     <div key={i} className="text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">{new Date(d.date).toLocaleDateString('es-PE', { weekday: 'short' })}</p>
                        <p className="text-[10px] font-bold text-foreground mt-1">${d.amount}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Critical Operations Grid (Alerts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Alerta: Cuentas por Vencer */}
               <div className="glass-card p-8 rounded-[2.5rem] bg-amber-500/5 border-amber-500/10 shadow-xl shadow-amber-500/5 group">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 animate-pulse">
                           <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Por Vencer</h3>
                     </div>
                     <span className="text-3xl font-black text-amber-500">{stats.soonToExpire}</span>
                  </div>
                  <div className="space-y-3">
                     {stats.details?.soonToExpireList?.length > 0 ? (
                        stats.details.soonToExpireList.map((user: any) => (
                           <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-amber-500/10 transition-all cursor-pointer">
                              <div className="min-w-0">
                                 <p className="text-sm font-black truncate leading-none mb-1">{user.full_name}</p>
                                 <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{user.plan_name}</p>
                              </div>
                              <WhatsAppClientButton 
                                 phone={user.phone} 
                                 fullName={user.full_name} 
                                 planName={user.plan_name} 
                                 daysLeft={user.daysLeft} 
                              />
                           </div>
                        ))
                     ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground italic opacity-50 border-2 border-dashed border-white/5 rounded-3xl">Todo al día</div>
                     )}
                  </div>
               </div>

               {/* Alerta: Cuentas Expiradas */}
               <div className="glass-card p-8 rounded-[2.5rem] bg-red-500/5 border-red-500/10 shadow-xl shadow-red-500/5">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                           <XCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Vencidas</h3>
                     </div>
                     <span className="text-3xl font-black text-red-500">{stats.expired}</span>
                  </div>
                  <div className="space-y-3">
                     {stats.details?.expiredList?.length > 0 ? (
                        stats.details.expiredList.map((user: any) => (
                           <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-red-500/10 opacity-80 hover:opacity-100 transition-all cursor-pointer">
                              <div className="min-w-0">
                                 <p className="text-sm font-black truncate leading-none mb-1 text-red-100">{user.full_name}</p>
                                 <p className="text-[9px] font-black text-red-500/80 uppercase tracking-widest">Saldo: ${user.debt || 0}</p>
                              </div>
                              <WhatsAppClientButton 
                                 phone={user.phone} 
                                 fullName={user.full_name} 
                                 planName={user.plan_name} 
                                 isExpired 
                              />
                           </div>
                        ))
                     ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground italic opacity-50 border-2 border-dashed border-white/5 rounded-3xl">Sin deudas vencidas</div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Operational Feed & Shortcuts */}
         <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Panel */}
            <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-purple-600/10 border-white/10 relative overflow-hidden group">
               <Target className="absolute -bottom-6 -right-6 w-32 h-32 opacity-5 scale-0 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-black uppercase tracking-tighter italic mb-6">Atajos Ráptidos</h3>
               <div className="grid gap-3">
                  <Link href="/admin/users">
                     <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/80 text-[10px] font-black uppercase tracking-[0.2em] gap-3">
                        <Users className="w-4 h-4" /> Nuevo Cliente
                     </Button>
                  </Link>
                  <Link href="/admin/payments">
                     <Button variant="outline" className="w-full h-14 rounded-2xl bg-white/5 border-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] gap-3">
                        <DollarSign className="w-4 h-4" /> Registrar Cobro
                     </Button>
                  </Link>
                  <Link href="/admin/plans">
                     <Button variant="outline" className="w-full h-14 rounded-2xl bg-white/5 border-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] gap-3">
                        <Zap className="w-4 h-4" /> Ajustar Planes
                     </Button>
                  </Link>
               </div>
            </div>

            {/* Recaudación por Planes */}
            <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-2xl">
               <h3 className="text-xl font-black tracking-tighter uppercase italic mb-8">Popularidad de Planes</h3>
               <div className="space-y-6">
                  {stats.planDistribution?.map((plan: any, idx: number) => {
                     const percentage = Math.round((plan.value / stats.activeMemberships) * 100) || 0;
                     return (
                        <div key={idx} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{plan.name}</span>
                              <span className="text-xs font-black text-primary">{plan.value} usuarios</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000" 
                                 style={{ width: `${percentage}%` }}
                              />
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* Feed: Actividad Reciente */}
            <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-2xl">
               <div className="flex items-center gap-3 mb-8">
                  <History className="w-5 h-5 text-emerald-500 opacity-50" />
                  <h2 className="text-lg font-black italic tracking-tighter uppercase">Últimos Flujos</h2>
               </div>
               <div className="space-y-4">
                  {stats.recentActivity?.map((act: any, idx: number) => (
                     <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <ArrowUpRight className="w-5 h-5" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-sm font-black text-foreground">${act.amount}</p>
                              <p className="text-[10px] text-muted-foreground font-bold truncate opacity-50">{act.customerName}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-emerald-500/60 uppercase">Completado</p>
                           <p className="text-[9px] text-muted-foreground font-bold opacity-30 mt-1">{new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
