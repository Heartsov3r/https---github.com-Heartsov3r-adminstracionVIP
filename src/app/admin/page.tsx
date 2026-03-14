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
  MessageCircle
} from 'lucide-react'
import { WhatsAppReportButton } from './components/WhatsAppReportButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClientDateTime } from '@/components/ui/client-datetime'

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
      
      {/* 🚀 EXECUTIVE HEADER & TOP METRICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 pb-4 border-b border-white/5 relative">
         <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
               <Activity className="w-4 h-4 animate-pulse" />
               Estado del Sistema: Online
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tighter leading-[0.9]">
               Hola, {adminName}
            </h1>
            <p className="text-muted-foreground font-medium text-sm flex items-center gap-2 flex-wrap">
               Resumen ejecutivo de <span className="text-foreground font-bold italic">Membresías VIP</span>
               {' · '}<ClientDateTime />
            </p>
         </div>

         {(stats.soonToExpire > 0 || stats.expired > 0) && (
            <div className="flex-1 max-w-xl animate-in fade-in slide-in-from-top-4 duration-1000">
               <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-amber-500 tracking-tight">Atención Administrativa</p>
                        <p className="text-xs text-amber-200/60 font-medium">
                           {stats.expired > 0 && <span>{stats.expired} expiradas</span>}
                           {stats.expired > 0 && stats.soonToExpire > 0 && <span> y </span>}
                           {stats.soonToExpire > 0 && <span>{stats.soonToExpire} por vencer</span>}
                        </p>
                     </div>
                  </div>
                   <div className="flex items-center gap-2">
                      <Link href="#admin-critical-alerts">
                         <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 h-8 rounded-lg">
                            Ver Detalles
                         </Button>
                      </Link>
                   </div>
               </div>
            </div>
         )}
         
         <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col flex-1 min-w-[120px] sm:min-w-[160px] shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <DollarSign className="w-12 h-12" />
               </div>
               <span className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tighter leading-none">${stats.dailyRevenue.toLocaleString()}</span>
               <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">Caja Hoy</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col flex-1 min-w-[120px] sm:min-w-[160px] shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-12 h-12" />
               </div>
               <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter leading-none">${stats.monthlyRevenue.toLocaleString()}</span>
               <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">Este Mes</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col flex-1 min-w-[120px] sm:min-w-[160px] shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Users className="w-12 h-12" />
               </div>
               <span className="text-2xl sm:text-3xl font-black text-primary tracking-tighter leading-none">{stats.totalClients}</span>
               <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">Clientes Totales</span>
            </div>
         </div>
      </div>

      {/* ⚡ ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
         <Link href="/admin/users" className="group">
            <Button variant="outline" className="w-full h-14 sm:h-20 rounded-xl sm:rounded-[1.5rem] bg-white/[0.02] border-white/5 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-between px-3 sm:px-6 font-black uppercase text-[9px] sm:text-xs tracking-widest">
               <span>+ Nuevo Cliente</span>
               <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
         </Link>
         <Link href="/admin/payments" className="group">
            <Button variant="outline" className="w-full h-14 sm:h-20 rounded-xl sm:rounded-[1.5rem] bg-white/[0.02] border-white/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-between px-3 sm:px-6 font-black uppercase text-[9px] sm:text-xs tracking-widest">
               <span>Registrar Cobro</span>
               <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-125 transition-transform" />
            </Button>
         </Link>
         <Link href="/admin/plans" className="group">
            <Button variant="outline" className="w-full h-14 sm:h-20 rounded-xl sm:rounded-[1.5rem] bg-white/[0.02] border-white/5 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all flex items-center justify-between px-3 sm:px-6 font-black uppercase text-[9px] sm:text-xs tracking-widest">
               <span>Configurar Planes</span>
               <Zap className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
            </Button>
         </Link>
         <Button variant="outline" className="w-full h-14 sm:h-20 rounded-xl sm:rounded-[1.5rem] bg-white/[0.02] border-white/5 hover:bg-white/10 transition-all flex items-center justify-between px-3 sm:px-6 font-black uppercase text-[9px] sm:text-xs tracking-widest opacity-50 cursor-not-allowed">
            <span>Reportes PDF</span>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
         </Button>
      </div>

      {/* 📊 MAIN OPERATIONAL GRID */}
      <div className="grid gap-6 sm:gap-10 lg:grid-cols-12">
        
        {/* Left Column: Critical Status */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
           <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Card: Por Vencer */}
              <div id="admin-critical-alerts" className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-amber-500/10 flex flex-col group shadow-xl shadow-amber-500/5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-amber-500/10 rounded-xl sm:rounded-2xl text-amber-500 animate-pulse">
                          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                          <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground opacity-60 italic">Alerta Prox.</h3>
                          <div className="flex items-center gap-3">
                             <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-tight">Vencen en 7 días o menos</p>
                             <WhatsAppReportButton stats={stats} />
                          </div>
                      </div>
                   </div>
                   <span className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tighter">{stats.soonToExpire}</span>
                </div>
                
                <div className="space-y-2 sm:space-y-3 flex-1">
                   {stats.details?.soonToExpireList?.length > 0 ? (
                       stats.details.soonToExpireList.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all cursor-pointer group/item">
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center text-xs font-black text-amber-500 border border-amber-500/20 shrink-0">{user.full_name?.charAt(0)}</div>
                                  <div className="flex flex-col min-w-0">
                                      <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">{user.full_name}</span>
                                      <span className="text-[9px] sm:text-[10px] text-amber-500/80 font-black uppercase tracking-widest">{user.plan_name}</span>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0 ml-2">
                                 <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md">{user.daysLeft} días</span>
                              </div>
                          </div>
                       ))
                   ) : (
                       <div className="text-center py-8 sm:py-10 opacity-30 italic text-sm font-medium border-2 border-dashed border-white/5 rounded-2xl sm:rounded-3xl">Todo al día por aquí</div>
                   )}
                </div>
              </div>

              {/* Card: Expiradas */}
              <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-red-500/10 flex flex-col group shadow-xl shadow-red-500/5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-red-500/10 rounded-xl sm:rounded-2xl text-red-500">
                          <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                          <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground opacity-60 italic">Crítico</h3>
                          <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-tight">Suscripciones Finalizadas</p>
                      </div>
                   </div>
                   <span className="text-3xl sm:text-4xl font-black text-red-500 tracking-tighter">{stats.expired}</span>
                </div>
                
                <div className="space-y-2 sm:space-y-3 flex-1">
                   {stats.details?.expiredList?.length > 0 ? (
                       stats.details.expiredList.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-red-500/5 hover:border-red-500/20 transition-all cursor-pointer opacity-80 hover:opacity-100">
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500/10 flex items-center justify-center text-xs font-black text-red-400 shrink-0">{user.full_name?.charAt(0)}</div>
                                  <div className="flex flex-col min-w-0">
                                      <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">{user.full_name}</span>
                                      <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">Finalizó {new Date(user.end_date).toLocaleDateString()}</span>
                                  </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-red-500 opacity-20 shrink-0" />
                          </div>
                       ))
                   ) : (
                       <div className="text-center py-8 sm:py-10 opacity-30 italic text-sm font-medium border-2 border-dashed border-white/5 rounded-2xl sm:rounded-3xl">No hay cuentas expiradas</div>
                   )}
                </div>
              </div>
           </div>

           {/* FEED: ACTIVIDAD RECIENTE (ÚLTIMOS COBROS) */}
           <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] bg-white/[0.01] border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                 <History className="w-5 h-5 text-emerald-500 opacity-50" />
                 <h2 className="text-lg sm:text-xl font-black italic tracking-tighter uppercase">Últimos Cobros Registrados</h2>
              </div>
              
              <div className="grid gap-3 sm:gap-4">
                 {stats.recentActivity?.length > 0 ? (
                    stats.recentActivity.map((act: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                             </div>
                             <div className="flex flex-col min-w-0">
                                <span className="font-black text-base sm:text-lg tracking-tighter text-foreground">${act.amount.toFixed(2)}</span>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-1 truncate">
                                   <User className="w-3 h-3 shrink-0" /> {act.customerName} · {act.planName}
                                </span>
                             </div>
                          </div>
                          <div className="text-right shrink-0">
                             <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-500/60 bg-emerald-500/5 px-2 sm:px-3 py-1 rounded-full mb-1">Completado</div>
                             <div className="text-[9px] text-muted-foreground font-black opacity-40">
                                <ClientDateTime 
                                  date={act.date} 
                                  options={{ hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', hour12: false }} 
                                />
                             </div>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-14 opacity-20 italic">No se registran actividades financieras hoy.</div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Analytics & Overview */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-10">
           {/* Card: VIP Activos Summary */}
           <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-emerald-500/5 border-emerald-500/20 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-emerald-500/70 italic">Comunidad Activa</h3>
                 </div>
                 <span className="text-3xl font-black text-emerald-500 tracking-tighter">{stats.activeMemberships}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed mb-6">
                 Tienes un total de <span className="text-foreground font-bold">{stats.activeMemberships} clientes con membresía vigente</span> en este momento.
              </p>
              <div className="space-y-4">
                 {stats.details?.activeVIPs?.slice(0, 3).map((v: any) => (
                    <div key={v.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                       <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[9px] font-black text-emerald-500 shrink-0">{v.full_name?.charAt(0)}</div>
                       <span className="text-xs font-bold truncate flex-1">{v.full_name}</span>
                       <span className="text-[10px] text-muted-foreground opacity-50">{v.plan_name}</span>
                    </div>
                 ))}
                 <Link href="/admin/users" className="block text-center pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:underline">Ver todos los activos</Link>
              </div>
           </div>

           {/* Distribution Panel */}
           <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <Zap className="w-20 h-20" />
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tighter uppercase italic mb-4 sm:mb-6">Planes Populares</h3>
              <div className="space-y-4 sm:space-y-6">
                 {stats.planDistribution?.map((plan: any, idx: number) => {
                    const percentage = Math.round((plan.value / stats.activeMemberships) * 100) || 0;
                    return (
                       <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-end">
                             <span className="text-xs font-black uppercase tracking-tight text-foreground">{plan.name}</span>
                             <span className="text-[10px] font-black text-primary">{plan.value} usuarios</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-primary rounded-full transition-all duration-1000" 
                                style={{ width: `${percentage}%` }}
                             />
                          </div>
                       </div>
                    )
                 })}
                 {stats.planDistribution?.length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic text-center py-4">Sin datos de planes asignados.</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
