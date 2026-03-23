'use client'

import { useState, useEffect, useTransition } from 'react'
import { Shield, ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react'

const SESSION_KEY = 'vip_terms_accepted'

export default function TermsModal() {
  const [accepted, setAccepted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Verificar sessionStorage al montar (solo muestra si no aceptó en ESTA sesión)
  useEffect(() => {
    const alreadyAccepted = sessionStorage.getItem(SESSION_KEY) === 'true'
    if (!alreadyAccepted) {
      setVisible(true)
    }
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 30
    if (atBottom) setScrolled(true)
  }

  const handleAccept = () => {
    startTransition(() => {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setVisible(false)
    })
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* Glow decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-[2rem] bg-zinc-950 border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-5 bg-gradient-to-b from-primary/10 to-transparent border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Membresías VIP</p>
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white leading-none mt-0.5">
                Términos y Condiciones
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/50 font-medium leading-relaxed">
            Lee y acepta nuestros términos para continuar usando la plataforma. Este acuerdo debe aceptarse en cada sesión.
          </p>
        </div>

        {/* Contenido scrollable */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 text-white/70 text-xs sm:text-sm leading-relaxed"
        >
          <p className="text-white/60 font-medium">
            Al adquirir cualquiera de nuestros servicios, usted acepta y se compromete a cumplir con las siguientes normas y políticas:
          </p>

          {/* Sección 1 */}
          <div className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">1</span>
              Naturaleza del Servicio y Propiedad
            </h3>
            <ul className="space-y-2 pl-8 list-none">
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">Acceso Temporizado:</span> El cliente adquiere un <span className="text-primary font-bold">derecho de uso</span> de perfil o cuenta por un tiempo determinado.
              </li>
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">No Titularidad:</span> Los clientes actúan únicamente como <span className="text-white/90 font-semibold">usuarios finales</span> de las plataformas (Netflix, Disney+, Max, etc.). La titularidad y administración de las cuentas principales pertenecen exclusivamente a <span className="text-primary font-bold">Membresías VIP</span>.
              </li>
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">Limitación de Marca:</span> No somos dueños de las plataformas mencionadas, solo gestionamos el acceso bajo una suscripción compartida o individual según corresponda.
              </li>
            </ul>
          </div>

          {/* Sección 2 */}
          <div className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">2</span>
              Política de Entrega
            </h3>
            <ul className="space-y-2 pl-8">
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">Velocidad VIP:</span> Nos comprometemos a que la entrega de sus credenciales se realice en el <span className="text-white/90 font-semibold">menor tiempo posible</span> tras la verificación del pago.
              </li>
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">Atención Prioritaria:</span> El proceso es manual o semiautomático para garantizar que su perfil esté configurado correctamente antes de que usted ingrese.
              </li>
            </ul>
          </div>

          {/* Sección 3 — Crítica */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
            <h3 className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-black flex items-center justify-center shrink-0">3</span>
              Prohibiciones y Sanciones 🚫
            </h3>
            <p className="text-white/60 text-xs pl-8">Queda terminantemente <span className="text-red-400 font-bold">prohibido</span> realizar cualquier cambio en la cuenta entregada:</p>
            <ul className="space-y-1.5 pl-8">
              {[
                'Cambio de contraseña.',
                'Cambio de correo electrónico asociado.',
                'Modificación de nombres de perfiles ajenos o configuraciones de la cuenta principal.',
                'Edición de métodos de pago dentro de la plataforma.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-white/70">
                  <span className="text-red-500 font-black text-xs mt-0.5 shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-3 mt-3 pt-3 border-t border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-xs font-bold leading-relaxed">
                Consecuencia Inmediata: Cualquier cambio resultará en la <span className="uppercase">expulsión inmediata</span> y <span className="uppercase">anulación de la membresía, sin derecho a reclamación, reembolso o reposición.</span>
              </p>
            </div>
          </div>

          {/* Sección 4 */}
          <div className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">4</span>
              Garantía y Soporte
            </h3>
            <ul className="space-y-2 pl-8">
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">Alcance:</span> La garantía cubre únicamente fallos técnicos ajenos al mal uso del cliente.
              </li>
              <li className="relative before:absolute before:left-[-1rem] before:top-[0.4rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/50">
                <span className="font-bold text-white/80">Tiempo de Respuesta:</span> En caso de fallas globales, el tiempo de solución será lo más breve posible, notificando al usuario cualquier cambio de credenciales necesario.
              </li>
            </ul>
          </div>

          {/* Sección 5 */}
          <div className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">5</span>
              Política de No Reembolso
            </h3>
            <p className="pl-8 text-white/60">
              Debido a la naturaleza digital y de consumo inmediato de nuestros productos, una vez entregadas las credenciales de acceso, <span className="text-white/90 font-bold">no se realizan devoluciones de dinero bajo ninguna circunstancia.</span>
            </p>
          </div>

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 bg-zinc-900/80 border-t border-white/5 space-y-4 shrink-0">
          {!scrolled && (
            <p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 animate-pulse">
              <ChevronDown className="w-3 h-3" />
              Desplázate para leer todo el contenido
              <ChevronDown className="w-3 h-3" />
            </p>
          )}

          {scrolled && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setAccepted(!accepted)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${accepted ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'border-white/20 bg-white/5 group-hover:border-primary/50'}`}
              >
                {accepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-xs text-white/60 font-medium group-hover:text-white/80 transition-colors">
                He leído y acepto los Términos y Condiciones de Membresías VIP
              </span>
            </label>
          )}

          <button
            onClick={handleAccept}
            disabled={!accepted || !scrolled || isPending}
            className={`w-full h-12 rounded-xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-300
              ${accepted && scrolled && !isPending
                ? 'bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Acepto los Términos y Condiciones
          </button>
        </div>
      </div>
    </div>
  )
}
