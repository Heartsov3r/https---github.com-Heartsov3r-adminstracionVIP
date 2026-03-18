import { getUserDetails } from './actions'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Calendar, CalendarDays, Clock, CreditCard, Mail, Phone, ShieldCheck, User, Zap, Activity, DollarSign, History, Paperclip } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ReferralBonusButtons } from './ReferralBonusButtons'

export default async function UserProfileDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: user, error } = await getUserDetails(id)

  if (error || !user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="glass-card border-none bg-red-500/10 text-red-500 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
           <Activity className="w-12 h-12 opacity-50" />
           <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Perfil no Encontrado</h1>
              <p className="text-sm font-medium opacity-80">{error || "Los datos del usuario no pudieron ser sincronizados."}</p>
           </div>
           <Link href="/admin/users">
              <Button className="mt-4 accent-gradient-blue rounded-xl font-black px-8">Volver al Panel</Button>
           </Link>
        </div>
      </div>
    )
  }

  const memberships = user.memberships || []
  const sortedMemberships = [...memberships].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const latestMembership = user.latestMembership
  const hasActiveMembership = latestMembership && !isNaN(new Date(latestMembership.end_date).getTime()) && new Date(latestMembership.end_date) >= new Date()
  
  const daysRemaining = hasActiveMembership 
    ? differenceInDays(new Date(latestMembership.end_date), new Date()) 
    : 0

  let totalSpent = 0
  let totalPayments = 0
  memberships.forEach((m: any) => {
      if (m.payments) {
          m.payments.forEach((p: any) => {
            totalSpent += Number(p.amount)
            totalPayments++
          })
      }
  })

  const currentPlanName = latestMembership?.plan?.name || (latestMembership ? 'Membresía Personalizada' : 'Sin Plan Asignado')

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER TOP - Glass Profile */}
      <div className="glass-card p-8 rounded-[3rem] border-white/5 bg-white/[0.02] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <User className="w-48 h-48 rotate-12" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 relative z-10">
            <div className="relative group">
                <Avatar className="w-40 h-40 border-4 border-white/10 shadow-2xl">
                   <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                   <AvatarFallback className="bg-primary/20 text-4xl font-black">UN</AvatarFallback>
                </Avatar>
                {hasActiveMembership && (
                   <div className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center ring-4 ring-[#0a0a0c] shadow-lg shadow-emerald-500/20">
                      <ShieldCheck className="w-6 h-6 text-white" />
                   </div>
                )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-2">
                 <div className={`w-2 h-2 rounded-full ${hasActiveMembership ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {hasActiveMembership ? 'Status: Active VIP' : 'Status: Inactive'}
                 </span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">
                  {user.full_name || 'Sin Nombre'}
                </h1>
                <Badge className={`${hasActiveMembership ? 'accent-gradient-blue text-white' : 'bg-red-500/10 text-red-500 border-red-500/20'} px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10`}>
                    {hasActiveMembership ? 'Miembro Premium' : 'Expirado'}
                </Badge>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm text-muted-foreground font-medium">
                 <span className="flex items-center gap-2 group-hover:text-foreground transition-colors"><Mail className="h-4 w-4 opacity-50" /> {user.email}</span>
                 {user.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4 opacity-50" /> {user.phone}</span>}
                 <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 opacity-50" /> Miembro desde {format(new Date(user.created_at), "MMM yyyy", { locale: es })}</span>
              </div>
            </div>

            <div className="flex gap-4">
               <Link href="/admin/users">
                  <Button variant="ghost" className="rounded-2xl h-14 px-6 border border-white/5 font-black uppercase text-xs tracking-widest gap-2 bg-white/5 hover:bg-white/10 transition-all">
                     <ArrowLeft className="w-4 h-4" /> Panel
                  </Button>
               </Link>
            </div>
        </div>
      </div>

      {/* MÉTRICAS SECUNDARIAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Plan */}
        <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Zap className="w-5 h-5 fill-blue-500/20" />
              </div>
              <Activity className="w-4 h-4 text-muted-foreground opacity-20" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Plan Contratado</p>
              <h3 className="text-xl font-black tracking-tight text-foreground truncate">{currentPlanName}</h3>
           </div>
           <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground italic flex items-center gap-2">
                 <Calendar className="w-3 h-3" /> {latestMembership ? `Vence: ${format(new Date(latestMembership.end_date), "dd/MM/yy")}` : 'Pendiente Asignación'}
              </p>
           </div>
        </div>

        {/* Metric 2: Tiempo */}
        <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                 <Clock className="w-5 h-5" />
              </div>
              <Activity className="w-4 h-4 text-muted-foreground opacity-20" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Acceso Restante</p>
              <h3 className="text-3xl font-black tracking-tighter text-foreground flex items-baseline gap-1">
                 {daysRemaining} <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Días</span>
              </h3>
           </div>
           <div className="mt-4">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${daysRemaining > 5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (daysRemaining / 30) * 100)}%` }} />
              </div>
           </div>
        </div>

        {/* Metric 3: Inversión */}
        <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                 <DollarSign className="w-5 h-5" />
              </div>
              <Activity className="w-4 h-4 text-muted-foreground opacity-20" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Inversión Total</p>
              <h3 className="text-3xl font-black tracking-tighter text-emerald-500">
                 <span className="text-sm opacity-50 mr-1">$</span>{totalSpent.toFixed(2)}
              </h3>
           </div>
           <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground italic">Lifetime Value acumulado</p>
           </div>
        </div>

        {/* Metric 4: Transacciones */}
        <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                 <CreditCard className="w-5 h-5" />
              </div>
              <Activity className="w-4 h-4 text-muted-foreground opacity-20" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Transacciones</p>
              <h3 className="text-3xl font-black tracking-tighter text-foreground">{totalPayments}</h3>
           </div>
            <div className="mt-4 pt-4 border-t border-white/5">
               <p className="text-[10px] font-bold text-muted-foreground italic">Registros procesados</p>
            </div>
         </div>
      </div>

      {/* ACCIONES EXTRAS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         <ReferralBonusButtons userId={id} currentMembershipId={latestMembership?.id || null} />
      </div>

      {/* HISTORIAL DETALLADO */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <History className="w-5 h-5 text-primary opacity-50" />
               <h2 className="text-xl font-black italic tracking-tighter uppercase">Cronología de Suscripción</h2>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
               Total: {sortedMemberships.length} Ciclos
            </div>
        </div>

        <div className="space-y-4">
           {sortedMemberships.length > 0 ? (
             sortedMemberships.map((membership: any) => {
                const isPast = new Date(membership.end_date) < new Date();
                const payments = membership.payments || []
                const paymentsTotal = payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
                const planDays = membership.plan?.duration_days || differenceInDays(new Date(membership.end_date), new Date(membership.start_date));
                
                return (
                   <div key={membership.id} className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                      <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] border-b border-white/5">
                         <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Activación</span>
                               <span className="font-black text-lg tracking-tight text-foreground">{format(new Date(membership.created_at), "dd MMM yyyy", { locale: es })}</span>
                            </div>
                            <div className="w-px h-10 bg-white/5 hidden md:block" />
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Producto</span>
                               <span className="font-bold text-sm text-foreground">{membership.plan?.name || 'Carga Manual'} <span className="text-primary/50 ml-1">+{planDays}D</span></span>
                            </div>
                         </div>

                         <div className="flex items-center gap-4">
                            <div className="flex flex-col text-right">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Total Cobrado</span>
                               <span className="font-black text-xl text-emerald-500 tracking-tighter">${paymentsTotal.toFixed(2)}</span>
                            </div>
                            {isPast ? 
                              <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 h-fit">Finalizado</div> : 
                              <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500 shadow-lg shadow-emerald-500/5 h-fit">Activo</div>
                            }
                         </div>
                      </div>

                      <div className="p-8 space-y-4">
                         {payments.length > 0 ? (
                            <div className="space-y-3">
                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                  <CreditCard className="w-3 h-3" /> Desglose de Pagos ({payments.length})
                               </p>
                               <div className="grid gap-3">
                                  {payments.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).map((p: any) => (
                                     <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 group/pay transition-all hover:border-white/10">
                                        <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-sm">
                                              $
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="font-black text-lg tracking-tighter text-foreground">${Number(p.amount).toFixed(2)}</span>
                                              <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(p.payment_date), "dd/MM/yyyy HH:mm")}</span>
                                           </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                                           {p.payment_receipts && p.payment_receipts.length > 0 ? (
                                              <a 
                                                href={p.payment_receipts[0].file_url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary rounded-xl text-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/5"
                                              >
                                                 <Paperclip className="w-3 h-3" /> Ver Recibo
                                              </a>
                                           ) : (
                                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 italic px-4">Sin Adjunto</span>
                                           )}
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground opacity-30 italic text-sm font-medium border-2 border-dashed border-white/5 rounded-3xl">
                               No se registraron abonos para este ciclo
                            </div>
                         )}
                      </div>
                   </div>
                )
             })
           ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 glass-card rounded-[2.5rem] border-white/5">
                 <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center">
                    <History className="h-10 w-10 opacity-20" />
                 </div>
                 <div className="text-center">
                    <p className="text-lg font-black tracking-tighter text-foreground uppercase italic underline decoration-primary decoration-4 underline-offset-4">Sin Historial</p>
                    <p className="text-sm font-medium opacity-50 mt-2 max-w-xs">No se han registrado transacciones ni ciclos de servicio para este perfil.</p>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
