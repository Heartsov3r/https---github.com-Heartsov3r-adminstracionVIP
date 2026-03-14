import { fetchMyStatus } from './actions'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Paperclip, 
  MessageCircle,
  HeadphonesIcon,
  ExternalLink,
  Zap
} from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { getBusinessDate } from '@/lib/utils'
import { ClientDateTime } from '@/components/ui/client-datetime'

export default async function ClientPage() {
  const { data, error } = await fetchMyStatus()

  if (!data || error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="glass-card p-8 rounded-[2.5rem] border-red-500/20 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold text-red-400">Ocurrió un error cargando tus datos.</p>
          <p className="text-sm text-muted-foreground mt-1">Intenta cerrar sesión y volver a ingresar.</p>
        </div>
      </div>
    )
  }

  const { profile, latestMembership, payments } = data

  const today = getBusinessDate()
  let mStatus: 'Activa' | 'Por Vencer' | 'Vencida' | 'Sin plan' = 'Sin plan'
  let daysDiff = 0
  let daysTotal = 0

  if (latestMembership) {
    const end = new Date(latestMembership.end_date)
    const start = new Date(latestMembership.start_date)
    daysDiff = differenceInDays(end, today)
    daysTotal = differenceInDays(end, start)

    if (daysDiff < 0) mStatus = 'Vencida'
    else if (daysDiff <= 7) mStatus = 'Por Vencer'
    else mStatus = 'Activa'
  }

  const progressPercent = daysTotal > 0 ? Math.max(0, Math.min(100, Math.round((daysDiff / daysTotal) * 100))) : 0
  const firstName = profile?.full_name?.split(' ')[0] || 'Cliente'

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* ===== HERO GREETING ===== */}
      <div className="pt-4 space-y-1">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 animate-pulse" /> Panel VIP
        </p>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none text-foreground">
          Hola, {firstName}
        </h1>
        <p className="text-muted-foreground font-medium">
          <ClientDateTime options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }} />
        </p>
      </div>

      {/* ===== HERO MEMBERSHIP CARD ===== */}
      <div className={`relative rounded-[3rem] overflow-hidden p-8 sm:p-12 text-white shadow-2xl
        ${mStatus === 'Activa' ? 'premium-gradient' : mStatus === 'Por Vencer' ? 'bg-gradient-to-br from-amber-600 to-orange-700' : 'bg-gradient-to-br from-zinc-700 to-zinc-900'}
      `}>
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full rounded-full bg-white blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-5">
          <Zap className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {mStatus === 'Activa' && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
              {mStatus === 'Por Vencer' && <AlertTriangle className="w-6 h-6 text-amber-300" />}
              {mStatus === 'Vencida' && <XCircle className="w-6 h-6 text-red-300" />}
              {mStatus === 'Sin plan' && <Clock className="w-6 h-6 text-zinc-300" />}
              <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full
                ${mStatus === 'Activa' ? 'bg-emerald-500/30 text-emerald-200' : ''}
                ${mStatus === 'Por Vencer' ? 'bg-amber-500/30 text-amber-200' : ''}
                ${mStatus === 'Vencida' ? 'bg-red-500/30 text-red-200' : ''}
                ${mStatus === 'Sin plan' ? 'bg-white/20 text-white/80' : ''}
              `}>{mStatus}</span>
            </div>

            {latestMembership ? (
              <>
                <div>
                  <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Plan Contratado</p>
                  <h2 className="text-4xl font-black tracking-tighter">{latestMembership.plans?.name}</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Inicio</p>
                    <p className="text-base font-bold"><ClientDateTime date={latestMembership.start_date} options={{ day: '2-digit', month: 'short', year: 'numeric' }} /></p>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Vencimiento</p>
                    <p className="text-base font-bold"><ClientDateTime date={latestMembership.end_date} options={{ day: '2-digit', month: 'short', year: 'numeric' }} /></p>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-3xl font-black tracking-tighter">Sin membresía activa</h2>
                <p className="text-white/60 mt-1">Contacta al administrador para activar tu plan.</p>
              </div>
            )}
          </div>

          {/* Días Counter */}
          {latestMembership && (
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm">
                <span className="text-4xl font-black leading-none">{Math.max(0, daysDiff)}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">días</span>
              </div>
              {mStatus !== 'Vencida' && (
                <div className="w-32 space-y-1">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-[10px] text-white/50 text-center font-bold">{progressPercent}% restante</p>
                </div>
              )}
              {mStatus === 'Vencida' && (
                <p className="text-[10px] text-red-300 text-center font-bold max-w-[120px]">Venció hace {Math.abs(daysDiff)} días</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT: Pagos + Perfil */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Historial de Pagos */}
          <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black tracking-tighter uppercase italic">Historial de Pagos</h3>
            </div>

            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tighter">${Number(p.amount).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {p.memberships?.plans?.name || 'Pago manual'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-xs text-muted-foreground font-bold">
                        <ClientDateTime date={p.payment_date} options={{ day: '2-digit', month: 'short', year: 'numeric' }} />
                      </p>
                      {p.payment_receipts?.length > 0 && (
                        <a href={p.payment_receipts[0].file_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded-full">
                          <Paperclip className="w-3 h-3" />
                          Ver recibo
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                <DollarSign className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium italic">No tienes pagos registrados todavía.</p>
              </div>
            )}
          </div>

          {/* Perfil del Cliente */}
          <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black tracking-tighter uppercase italic">Mi Perfil</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Nombre Completo
                </p>
                <p className="text-base font-bold text-foreground">{profile?.full_name || 'No registrado'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </p>
                <p className="text-base font-bold text-foreground truncate">{profile?.email || 'No registrado'}</p>
              </div>
              {(profile as any)?.phone && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Teléfono
                  </p>
                  <p className="text-base font-bold text-foreground">{(profile as any).phone}</p>
                </div>
              )}
              {(profile as any)?.created_at && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Miembro desde
                  </p>
                  <p className="text-base font-bold text-foreground">
                    <ClientDateTime date={(profile as any).created_at} options={{ month: 'long', year: 'numeric' }} />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Contacto y Soporte */}
        <div className="space-y-8">
          
          {/* Card: Estado Rápido */}
          <div className={`p-6 rounded-[2.5rem] border flex flex-col gap-4 shadow-xl
            ${mStatus === 'Activa' ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
            ${mStatus === 'Por Vencer' ? 'bg-amber-500/5 border-amber-500/20' : ''}
            ${mStatus === 'Vencida' ? 'bg-red-500/5 border-red-500/20' : ''}
            ${mStatus === 'Sin plan' ? 'bg-white/[0.02] border-white/5' : ''}
          `}>
            <div className="flex items-center gap-3">
              {mStatus === 'Activa' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              {mStatus === 'Por Vencer' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />}
              {mStatus === 'Vencida' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
              {mStatus === 'Sin plan' && <Clock className="w-5 h-5 text-muted-foreground shrink-0" />}
              <span className="font-black text-sm uppercase tracking-tight">{mStatus}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              {mStatus === 'Activa' && `Tu membresía está vigente. Disfruta de todos tus beneficios VIP.`}
              {mStatus === 'Por Vencer' && `Tu membresía vence en ${daysDiff} días. Contacta al soporte para renovar.`}
              {mStatus === 'Vencida' && `Tu membresía venció. Contacta a soporte para reactivar tu acceso.`}
              {mStatus === 'Sin plan' && `Aún no tienes un plan activo. Habla con nosotros para empezar.`}
            </p>
          </div>

          {/* Card: Contacto y Soporte */}
          <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <HeadphonesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black tracking-tighter uppercase italic">Soporte</h3>
            </div>

            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              ¿Tienes alguna duda sobre tu membresía, pagos o renovaciones? Estamos para ayudarte.
            </p>

            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/1234567890?text=Hola,%20necesito%20ayuda%20con%20mi%20membresía%20VIP"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
              >
                <div className="w-10 h-10 bg-[#25D366]/20 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm text-[#25D366]">WhatsApp</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Respuesta rápida</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#25D366] opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Email */}
              <a
                href="mailto:soporte@membresiasvip.com?subject=Soporte%20-%20Mi%20Membresía%20VIP"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm text-foreground">Correo Electrónico</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">soporte@membresiasvip.com</p>
                </div>
                <ExternalLink className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Horario */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Horario de Atención
              </p>
              <p className="text-xs font-bold text-foreground">Lunes – Viernes: 9:00 AM – 6:00 PM</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">Sábados: 10:00 AM – 2:00 PM</p>
            </div>
          </div>

          {/* Card: FAQ rápida */}
          <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Preguntas Frecuentes</h3>
            
            {[
              { q: '¿Cómo renuevo mi membresía?', a: 'Contacta al soporte por WhatsApp o email para coordinar el pago y renovación.' },
              { q: '¿Dónde están mis comprobantes?', a: 'En la sección "Historial de Pagos" de esta página, al lado de cada abono.' },
              { q: '¿Puedo cambiar de plan?', a: 'Sí, contáctanos y te ayudamos a migrar a un plan diferente.' },
            ].map((item, i) => (
              <div key={i} className="space-y-1 py-3 border-b border-white/5 last:border-0">
                <p className="text-xs font-black text-foreground">{item.q}</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
