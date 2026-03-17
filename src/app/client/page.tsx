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
  Zap,
  Eye
} from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { getBusinessDate } from '@/lib/utils'
import { ClientDateTime } from '@/components/ui/client-datetime'
import ClientPaymentsClient from './ClientPaymentsClient'

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M12.041 2C6.505 2 2 6.502 2 12.037c0 1.769.457 3.491 1.33 5.013L2.053 22l5.133-1.348c1.491.815 3.166 1.242 4.855 1.242 5.536 0 10.041-4.503 10.041-10.039 0-2.682-1.044-5.203-2.94-7.098A9.972 9.972 0 0 0 12.041 2zM17.43 16.32c-.248.694-1.232 1.272-1.742 1.352-.511.08-1.026.136-2.316-.362-1.636-.632-2.698-2.333-2.779-2.441-.081-.109-1.323-1.76-1.323-3.376 0-1.616.844-2.41 1.144-2.738.3-.328.66-.411.87-.411h.461c.15 0 .341-.013.483.337.143.35.592 1.455.644 1.56.052.105.086.227.016.368-.07.14-.15.228-.24.32-.09.092-.191.206-.271.294-.092.102-.182.204-.079.382.103.178.452.746 1.021 1.255.733.655 1.353.859 1.543.954.19.095.303.079.417-.052.114-.131.488-.57.632-.76.145-.19.29-.158.484-.087.194.072 1.229.58 1.442.692.213.112.355.168.406.258s.051.61-.197 1.304z" />
  </svg>
)

export default async function ClientPage() {
  const { data, error } = await fetchMyStatus()

  if (!data || error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-8">
        <div className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-red-500/20 text-center max-w-md">
          <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold text-red-400 text-sm sm:text-base">Ocurrió un error cargando tus datos.</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Intenta cerrar sesión y volver a ingresar.</p>
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* ===== HERO GREETING ===== */}
      <div className="pt-2 sm:pt-4 space-y-1">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" /> Panel VIP
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-foreground">
          Hola, {firstName}
        </h1>
        <p className="text-muted-foreground font-medium text-sm">
          <ClientDateTime options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }} />
        </p>
      </div>

      {/* ===== HERO MEMBERSHIP CARD ===== */}
      <div className={`relative rounded-2xl sm:rounded-[3rem] overflow-hidden p-5 sm:p-8 lg:p-12 text-white shadow-2xl
        ${mStatus === 'Activa' ? 'premium-gradient' : mStatus === 'Por Vencer' ? 'bg-gradient-to-br from-amber-600 to-orange-700' : 'bg-gradient-to-br from-zinc-700 to-zinc-900'}
      `}>
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 opacity-10">
          <div className="w-full h-full rounded-full bg-white blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-5">
          <Zap className="w-32 sm:w-64 h-32 sm:h-64" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {mStatus === 'Activa' && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />}
              {mStatus === 'Por Vencer' && <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />}
              {mStatus === 'Vencida' && <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-300" />}
              {mStatus === 'Sin plan' && <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-300" />}
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full
                ${mStatus === 'Activa' ? 'bg-emerald-500/30 text-emerald-200' : ''}
                ${mStatus === 'Por Vencer' ? 'bg-amber-500/30 text-amber-200' : ''}
                ${mStatus === 'Vencida' ? 'bg-red-500/30 text-red-200' : ''}
                ${mStatus === 'Sin plan' ? 'bg-white/20 text-white/80' : ''}
              `}>{mStatus}</span>
            </div>

            {latestMembership ? (
              <>
                <div>
                  <p className="text-white/60 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Plan Contratado</p>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tighter">{latestMembership.plans?.name}</h2>
                </div>
                <div className="pt-2">
                  <p className="text-white/50 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Tu acceso VIP finaliza el:</p>
                  <p className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/70" />
                    <ClientDateTime date={latestMembership.end_date} options={{ day: '2-digit', month: 'long', year: 'numeric' }} />
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">Sin membresía activa</h2>
                <p className="text-white/60 mt-1 text-sm">Contacta al administrador para activar tu plan.</p>
              </div>
            )}
          </div>

          {/* Días Counter */}
          {latestMembership && (
            <div className="flex flex-col items-center gap-3 shrink-0 self-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm">
                <span className="text-3xl sm:text-4xl font-black leading-none">{Math.max(0, daysDiff)}</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/70">días</span>
              </div>
              {mStatus !== 'Vencida' && (
                <div className="w-24 sm:w-32 space-y-1">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-white/50 text-center font-bold">{progressPercent}% restante</p>
                </div>
              )}
              {mStatus === 'Vencida' && (
                <p className="text-[9px] sm:text-[10px] text-red-300 text-center font-bold max-w-[120px]">Venció hace {Math.abs(daysDiff)} días</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        
        {/* LEFT: Pagos + Perfil */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Historial de Pagos */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <DollarSign className="w-32 h-32" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase italic text-foreground">Mis Pagos</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Historial de abonos realizados</p>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {payments.length} Registros
              </div>
            </div>

            <div className="relative z-10">
              {payments.length > 0 ? (
                <ClientPaymentsClient payments={payments} profile={profile} />
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">No hay pagos registrados</p>
                  <p className="text-xs text-muted-foreground/50 mt-1 max-w-[200px] mx-auto">Tus transacciones aparecerán aquí una vez que sean procesadas.</p>
                </div>
              )}
            </div>
          </div>

          {/* Perfil del Cliente */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl text-primary">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic">Mi Perfil</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Nombre Completo
                </p>
                <p className="text-sm sm:text-base font-bold text-foreground">{profile?.full_name || 'No registrado'}</p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </p>
                <p className="text-sm sm:text-base font-bold text-foreground truncate">{profile?.email || 'No registrado'}</p>
              </div>
              {(profile as any)?.phone && (
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Teléfono
                  </p>
                  <p className="text-sm sm:text-base font-bold text-foreground">{(profile as any).phone}</p>
                </div>
              )}
              {(profile as any)?.created_at && (
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Miembro desde
                  </p>
                  <p className="text-sm sm:text-base font-bold text-foreground">
                    <ClientDateTime date={(profile as any).created_at} options={{ month: 'long', year: 'numeric' }} />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Contacto y Soporte */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Card: Estado Rápido */}
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border flex flex-col gap-3 sm:gap-4 shadow-xl
            ${mStatus === 'Activa' ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
            ${mStatus === 'Por Vencer' ? 'bg-amber-500/5 border-amber-500/20' : ''}
            ${mStatus === 'Vencida' ? 'bg-red-500/5 border-red-500/20' : ''}
            ${mStatus === 'Sin plan' ? 'bg-white/[0.02] border-white/5' : ''}
          `}>
            <div className="flex items-center gap-2 sm:gap-3">
              {mStatus === 'Activa' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />}
              {mStatus === 'Por Vencer' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 animate-pulse" />}
              {mStatus === 'Vencida' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />}
              {mStatus === 'Sin plan' && <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />}
              <span className="font-black text-xs sm:text-sm uppercase tracking-tight">{mStatus}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-relaxed">
              {mStatus === 'Activa' && `Tu membresía está vigente. Disfruta de todos tus beneficios VIP.`}
              {mStatus === 'Por Vencer' && `Tu membresía vence en ${daysDiff} días. Contacta al soporte para renovar.`}
              {mStatus === 'Vencida' && `Tu membresía venció. Contacta a soporte para reactivar tu acceso.`}
              {mStatus === 'Sin plan' && `Aún no tienes un plan activo. Habla con nosotros para empezar.`}
            </p>
          </div>

          {/* Card: Contacto y Soporte */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl text-blue-500">
                <HeadphonesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tighter uppercase italic">Soporte</h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              ¿Tienes alguna duda sobre tu membresía, pagos o renovaciones? Estamos para ayudarte.
            </p>

            <div className="space-y-2 sm:space-y-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/593990434546?text=Hola,%20necesito%20ayuda%20con%20mis%20Membresías%20VIP"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#25D366]/20 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs sm:text-sm text-[#25D366]">WhatsApp</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Respuesta rápida</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366] opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>

              {/* Email */}
                <a
                href="mailto:andyobregon152@gmail.com?subject=Soporte%20-%20Mi%20Membresía%20VIP"
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs sm:text-sm text-foreground">Correo Electrónico</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">andyobregon152@gmail.com</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>

            {/* Horario */}
            <div className="pt-3 sm:pt-4 border-t border-white/5">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 sm:mb-2">
                Horario de Atención
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-foreground">Lunes – Viernes: 9:00 AM – 6:00 PM</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5 sm:mt-1">Sábados: 10:00 AM – 2:00 PM</p>
            </div>
          </div>

          {/* Card: FAQ rápida */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.01] border-white/5 shadow-xl space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Preguntas Frecuentes</h3>
            
            {[
              { q: '¿Cómo renuevo mi membresía?', a: 'Contacta al soporte por WhatsApp o email para coordinar el pago y renovación.' },
              { q: '¿Dónde están mis comprobantes?', a: 'En la sección "Historial de Pagos" de esta página, al lado de cada abono.' },
              { q: '¿Puedo cambiar de plan?', a: 'Sí, contáctanos y te ayudamos a migrar a un plan diferente.' },
            ].map((item, i) => (
              <div key={i} className="space-y-1 py-2 sm:py-3 border-b border-white/5 last:border-0">
                <p className="text-[11px] sm:text-xs font-black text-foreground">{item.q}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
