'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  Star, 
  Crown,
  Lock,
  ArrowRight,
  Mail,
  UserCheck,
  Globe,
  ChevronDown,
  CheckCircle2,
  BarChart3,
  Rocket,
  Menu,
  X,
  MessageCircle
} from 'lucide-react'

interface LandingContentProps {
  searchParams: Promise<{ error?: string }>
}

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

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left group hover:text-primary transition-colors focus:outline-none"
      >
        <span className="text-lg sm:text-xl font-bold tracking-tight">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-white/20'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function LandingContent({ searchParams }: LandingContentProps) {
  const resolvedSearchParams = use(searchParams)
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dynamicText, setDynamicText] = useState('Streaming')
  
  const services = ['Streaming', 'Netflix', 'Disney+', 'Max', 'ChatGPT', 'Canva']

  useEffect(() => {
    // Preloader handle
    const timer = setTimeout(() => setIsLoading(false), 2000)
    
    // Dynamic text handle
    let index = 0
    const textInterval = setInterval(() => {
      index = (index + 1) % services.length
      setDynamicText(services[index])
    }, 3000)

    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearTimeout(timer)
      clearInterval(textInterval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  const scrollTo = (id: string) => {
    setIsMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* --- PRELOADER --- */}
      <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center transition-all duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(124,58,237,0.5)]">
            <Zap className="w-12 h-12 text-white animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-ping" />
        </div>
        <div className="mt-8 space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Cargando Experiencia VIP</p>
          <div className="w-32 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-loading-bar" />
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-primary/30 scroll-smooth">
      
      {/* --- BLOOM DECORATIONS --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-[#FF4B91]/5 rounded-full blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 px-6 sm:px-12 py-5 flex justify-between items-center transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-black/40 border-b border-white/10 py-4 shadow-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-black tracking-tighter text-2xl uppercase italic hidden sm:block">Membresías VIP</span>
        </div>
        <div className="flex items-center gap-6 sm:gap-10">
          <button onClick={() => scrollTo('servicios')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer opacity-70 hidden md:block">
            Cuentas
          </button>
          <button onClick={() => scrollTo('como-funciona')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer opacity-70 hidden md:block">
            Cómo Funciona
          </button>
          <button onClick={() => scrollTo('faq')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer opacity-70 hidden md:block">
            Ayuda
          </button>
          <button onClick={() => scrollTo('contacto')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer opacity-70 hidden md:block">
            Contacto
          </button>
          <Link 
            href="/login"
            className="px-6 py-2.5 rounded-full bg-[#FF4B91] hover:bg-[#FF4B91]/90 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#FF4B91]/20 active:scale-95 border border-white/10 hidden sm:flex items-center"
          >
            ENTRAR
          </Link>
          
          {/* Hamburger Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`fixed inset-0 z-[60] transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl" />
        <div className="relative h-full flex flex-col p-8 pt-24">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="space-y-4 flex flex-col">
            {[
              { id: 'servicios', label: 'Nuestro Catálogo' },
              { id: 'como-funciona', label: 'Cómo Funciona' },
              { id: 'faq', label: 'Preguntas Frecuentes' },
              { id: 'contacto', label: 'Soporte VIP' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-3xl font-black italic tracking-tighter uppercase text-left py-4 border-b border-white/5 hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            <Link 
              href="/login"
              className="mt-8 py-6 rounded-[2rem] bg-gradient-to-r from-primary to-[#FF4B91] text-white font-black text-center text-xl italic uppercase tracking-[0.1em] shadow-2xl shadow-primary/20"
            >
              ACCEDER AL ÁREA PRIVADA
            </Link>
          </div>
          
          <div className="mt-auto pt-12 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4B91]">Membresías VIP 2026</p>
          </div>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen pt-40 pb-20 px-6 sm:px-12 lg:px-24 flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <Crown className="w-3.5 h-3.5" /> TU PASE AL MEJOR ENTRETENIMIENTO
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] italic">
              Todo el <br />
              <span key={dynamicText} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-[#FF4B91] animate-text-fade-up whitespace-nowrap">
                {dynamicText} VIP
              </span> <br />
              en un Solo Lugar
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground font-medium leading-relaxed opacity-80">
              Disfruta de Netflix, Disney+, Max y tus herramientas favoritas como ChatGPT Plus y Canva con acceso inmediato y el soporte que te mereces.
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
              <Link 
                href="/login"
                className="group relative px-10 py-5 rounded-2xl bg-[#FF4B91] text-white font-black text-sm uppercase tracking-[0.2em] overflow-hidden transition-all shadow-2xl shadow-[#FF4B91]/30 active:scale-95 w-full sm:w-auto btn-shine"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  EMPEZAR AHORA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button onClick={() => scrollTo('servicios')} className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-white/10 hover:border-primary transition-all py-2 opacity-50 hover:opacity-100 italic">
                Ver Catálogo
              </button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[120%] bg-primary/20 rounded-full blur-[120px] opacity-10" />
            <img 
              src="/images/hero-vip.png" 
              alt="VIP Streaming Dashboard" 
              className="relative z-10 w-full h-auto drop-shadow-[0_50px_50px_rgba(0,0,0,0.6)] transform hover:scale-105 hover:-rotate-1 transition-all duration-1000 rounded-[3.5rem] border border-white/5"
            />
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="py-16 border-y border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          {[
            { value: '100%', label: 'Activación Inmediata', icon: Rocket },
            { value: '24/7', label: 'Soporte VIP Activo', icon: MessageCircle },
          ].map((stat, i) => (
            <div key={i} className="space-y-2 group">
              <div className="flex justify-center mb-3">
                <stat.icon className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl sm:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">{stat.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CÓMO FUNCIONA (STEPS) --- */}
      <section id="como-funciona" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">TU CAMINO AL ÉXITO</p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter italic uppercase">PROCESO DE ACTIVACIÓN</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-[25%] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />
             
             {[
               { step: '01', title: 'Registro VIP', desc: 'Tu administrador te da de alta en nuestro sistema seguro.', icon: UserCheck },
               { step: '02', title: 'Recibe Accesos', desc: 'Obtén tus credenciales personalizadas de inmediato.', icon: Lock },
               { step: '03', title: 'Gestión Total', desc: 'Accede a tu historial, comprobantes y beneficios desde tu panel.', icon: Rocket },
             ].map((item, i) => (
               <div key={i} className="relative z-10 group text-center space-y-6">
                 <div className="w-20 h-20 mx-auto rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-primary shadow-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:-translate-y-2">
                   <item.icon className="w-10 h-10" />
                   <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#FF4B91] flex items-center justify-center text-[11px] font-black italic ring-4 ring-[#020617]">{item.step}</span>
                 </div>
                 <h3 className="text-2xl font-black tracking-tighter uppercase italic">{item.title}</h3>
                 <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto opacity-70">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- BENEFICIOS AMPLIADOS (GRID 6) --- */}
      <section id="servicios" className="py-32 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
             <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#FF4B91]">VENTAJAS EXCLUSIVAS</p>
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter italic uppercase">SOPORTE DE ÉLITE</h2>
             </div>
             <p className="max-w-md text-muted-foreground text-sm opacity-60">Diseñamos cada detalle para que tu única preocupación sea disfrutar de los beneficios VIP. Transparencia y eficiencia garantizada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Streaming Premium', desc: 'Acceso a Netflix, Disney+, Max, Amazon Prime y YouTube Premium sin interrupciones.', icon: Globe, color: 'text-primary', bg: 'bg-primary/5' },
              { title: 'IA & Productividad', desc: 'Potencia tu trabajo con ChatGPT Plus, Canva Pro, Midjourney y herramientas de diseño de élite.', icon: Zap, color: 'text-[#FF4B91]', bg: 'bg-[#FF4B91]/5' },
              { title: 'Lectura & Educación', desc: 'Acceso ilimitado a Scribd, periódicos internacionales y plataformas de aprendizaje continuo.', icon: Star, color: 'text-blue-400', bg: 'bg-blue-400/5' },
              { title: 'Activación Inmediata', desc: 'Sin esperas. Una vez verificado tu abono, recibes tus credenciales de acceso al instante.', icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
              { title: 'Ahorro Inteligente', desc: 'Disfruta de todas las plataformas líderes a una fracción de su costo individual oficial.', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-400/5' },
              { title: 'Soporte VIP 24/7', desc: '¿Problemas con una cuenta? Nuestro equipo técnico resuelve cualquier incidencia vía WhatsApp.', icon: MessageCircle, color: 'text-amber-400', bg: 'bg-amber-400/5' },
            ].map((benefit, i) => (
              <div key={i} className="glass-card group p-8 rounded-[3rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all hover:border-white/10">
                <div className={`w-14 h-14 rounded-2xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black tracking-tighter uppercase italic mb-3">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PREGUNTAS FRECUENTES (FAQ) --- */}
      <section id="faq" className="py-32 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">¿DUDAS?</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter italic uppercase">PREGUNTAS FRECUENTES</h2>
        </div>
        <div className="glass-card bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl">
          <FAQItem 
            question="¿Qué tipo de cuentas entregan?" 
            answer="Ofrecemos cuentas premium reales para plataformas como Netflix, Disney+, Max y herramientas como ChatGPT Plus. Todas están garantizadas por el tiempo contratado." 
          />
          <FAQItem 
            question="¿Qué pasa si una cuenta deja de funcionar?" 
            answer="No te preocupes. Todas nuestras membresías incluyen garantía total. Si hay una caída, nuestro soporte técnico te brinda una solución o reemplazo inmediato vía WhatsApp." 
          />
          <FAQItem 
            question="¿Puedo renovar mi misma cuenta?" 
            answer="Intentamos siempre mantener tus perfiles. Si la plataforma lo permite, podrás renovar mes a mes sin perder tus listas o preferencias." 
          />
          <FAQItem 
            question="¿Cuántos dispositivos puedo conectar?" 
            answer="Depende del plan contratado. Ofrecemos desde perfiles individuales hasta cuentas completas familiares. Consulta con tu administrador al momento de la adquisición." 
          />
          <FAQItem 
            question="¿Cuáles son los métodos de pago?" 
            answer="Aceptamos cualquier método de pago disponible. Todas tus transacciones quedan registradas de forma oficial, con emisión de recibos y boletas digitales que puedes descargar desde tu panel personal para total transparencia." 
          />
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contacto" className="py-32 px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter italic uppercase">Contáctanos</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg pt-4 leading-relaxed">
              ¿Tienes dudas o necesitas ayuda con tu cuenta? Nuestro equipo VIP está listo para asistirte 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group group/card">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-500 shadow-lg shadow-emerald-500/5">
                  <WhatsAppIcon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter italic uppercase">WhatsApp VIP</h3>
                  <p className="text-muted-foreground opacity-60">Atención inmediata para activaciones y soporte técnico.</p>
                </div>
                <a 
                  href="https://wa.me/593990434546?text=Hola,%20necesito%20ayuda%20con%20mis%20Membresías%20VIP" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Chatea con Soporte <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group group/card">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-500 shadow-lg shadow-blue-500/5">
                  <Mail className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter italic uppercase">Correo Directo</h3>
                  <p className="text-muted-foreground opacity-60">Para consultas corporativas o temas administrativos detallados.</p>
                </div>
                <a 
                  href="mailto:andyobregon152@gmail.com"
                  className="w-full py-5 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 backdrop-blur-md active:scale-95 transition-all"
                >
                  Enviar Email <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-24 px-6 sm:px-12 border-t border-white/5 bg-black relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Zap className="w-8 h-8 text-primary" />
               <span className="font-black text-2xl italic tracking-tighter uppercase">MEMBRESÍAS VIP</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed opacity-50 font-medium">Elevando el estándar de la gestión administrativa con tecnología de vanguardia y diseño centrado en el usuario.</p>
          </div>
          
          <div className="flex justify-center gap-12">
             {['Servicios', 'Como-funciona', 'Faq', 'Contacto'].map((link) => (
               <button 
                 key={link} 
                 onClick={() => scrollTo(link.toLowerCase())}
                 className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer opacity-40 hover:opacity-100"
               >
                 {link}
               </button>
             ))}
          </div>

          <div className="text-center md:text-right space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
               © 2026 MEMBRESÍAS VIP. <br /> TODOS LOS DERECHOS RESERVADOS.
            </p>
            <div className="flex justify-center md:justify-end gap-6 opacity-20">
              <Link href="#" className="hover:text-primary transition-colors"><MessageSquare className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><ShieldCheck className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </footer>

      {/* --- FLOATING WHATSAPP --- */}
      <a 
        href="https://wa.me/593990434546?text=Hola,%20necesito%20ayuda%20con%20mis%20Membresías%20VIP" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[70] w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 group-hover:opacity-40" />
        <WhatsAppIcon className="w-8 h-8 relative z-10" />
        <span className="absolute right-full mr-4 px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          Chatea con nosotros
        </span>
      </a>

      <style jsx>{`
        .glass-card {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out 0s 2;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out forwards;
        }
        @keyframes text-fade-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-text-fade-up {
          animation: text-fade-up 0.5s ease-out forwards;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .btn-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shine 3s infinite;
        }
      `}</style>
    </div>
    </>
  )
}
