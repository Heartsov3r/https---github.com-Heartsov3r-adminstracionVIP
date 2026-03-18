'use client'

import { 
  Tv, 
  MonitorPlay, 
  Film, 
  PlaySquare, 
  Video, 
  MonitorSmartphone,
  Music,
  Mic2,
  Headphones,
  Radio,
  Bot,
  BrainCircuit,
  Cpu,
  Sparkles,
  MessageSquareCode,
  Lightbulb,
  ShieldCheck,
  FileText,
  Lock,
  Paintbrush,
  Plus,
  Trophy,
  Cloud,
  BookOpen,
  Terminal,
  Search,
  Flame,
  Globe
} from 'lucide-react'

type ServiceCategory = {
  name: string
  items: ServiceItem[]
}

type ServiceItem = {
  name: string
  icon: any
  color: string
  bgLight: string
  tag?: string
}

const CATEGORIES: ServiceCategory[] = [
  {
    name: 'Entretenimiento & Streaming',
    items: [
      { name: 'Netflix', icon: Tv, color: 'text-red-500', bgLight: 'bg-red-500/10' },
      { name: 'Disney+', icon: Sparkles, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
      { name: 'YouTube Premium', icon: PlaySquare, color: 'text-red-500', bgLight: 'bg-red-500/10' },
      { name: 'Max (HBO)', icon: Film, color: 'text-purple-500', bgLight: 'bg-purple-500/10' },
      { name: 'Prime Video', icon: MonitorPlay, color: 'text-sky-400', bgLight: 'bg-sky-400/10' },
      { name: 'Apple TV+', icon: Tv, color: 'text-white', bgLight: 'bg-white/10' },
      { name: 'Paramount+', icon: PlaySquare, color: 'text-blue-600', bgLight: 'bg-blue-600/10' },
      { name: 'Peacock', icon: Tv, color: 'text-yellow-400', bgLight: 'bg-yellow-400/10' },
      { name: 'Rakuten TV', icon: Tv, color: 'text-yellow-500', bgLight: 'bg-yellow-500/10' },
      { name: 'ViX Premium', icon: Tv, color: 'text-orange-500', bgLight: 'bg-orange-500/10' },
      { name: 'Star+', icon: Sparkles, color: 'text-emerald-500', bgLight: 'bg-emerald-500/10' },
      { name: 'MUBI', icon: Film, color: 'text-indigo-400', bgLight: 'bg-indigo-400/10', tag: 'Cine de Autor' },
      { name: 'Crunchyroll', icon: Tv, color: 'text-orange-500', bgLight: 'bg-orange-500/10', tag: 'Anime' },
      { name: 'RetroCrush', icon: Tv, color: 'text-red-400', bgLight: 'bg-red-400/10' },
      { name: 'Shudder', icon: Film, color: 'text-red-600', bgLight: 'bg-red-600/10', tag: 'Terror' },
      { name: 'Pluto TV', icon: MonitorPlay, color: 'text-yellow-400', bgLight: 'bg-yellow-400/10' },
      { name: 'FlixOlé', icon: Tv, color: 'text-red-500', bgLight: 'bg-red-500/10' },
      { name: 'Plex Premium', icon: MonitorPlay, color: 'text-amber-500', bgLight: 'bg-amber-500/10' },
      { name: 'Runtime', icon: Video, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
      { name: 'Acorn TV', icon: Tv, color: 'text-green-600', bgLight: 'bg-green-600/10' },
      { name: 'Viki / Kocowa', icon: Tv, color: 'text-pink-400', bgLight: 'bg-pink-400/10', tag: 'Doramas' },
      { name: 'Discovery+', icon: Globe, color: 'text-blue-400', bgLight: 'bg-blue-400/10' },
      { name: 'CuriosityStream', icon: Film, color: 'text-yellow-500', bgLight: 'bg-yellow-500/10' },
      { name: 'IPTV Premium', icon: MonitorSmartphone, color: 'text-teal-400', bgLight: 'bg-teal-400/10', tag: '+5000 Canales' },
      { name: '¡Y cientos más!', icon: Plus, color: 'text-white', bgLight: 'bg-white/10', tag: 'Incluido' },
    ]
  },
  {
    name: 'Deportes en Vivo VIP',
    items: [
      { name: 'ESPN Premium', icon: Trophy, color: 'text-red-600', bgLight: 'bg-red-600/10' },
      { name: 'DAZN', icon: MonitorPlay, color: 'text-yellow-400', bgLight: 'bg-yellow-400/10' },
      { name: 'DIRECTV GO', icon: Tv, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
      { name: 'FuboTV', icon: Tv, color: 'text-orange-500', bgLight: 'bg-orange-500/10' },
      { name: 'FOX Sports', icon: Trophy, color: 'text-blue-600', bgLight: 'bg-blue-600/10' },
      { name: 'ONE', icon: Trophy, color: 'text-white', bgLight: 'bg-white/10' },
      { name: '¡Y muchos más!', icon: Plus, color: 'text-white/50', bgLight: 'bg-white/5', tag: 'Incluido' },
    ]
  },
  {
    name: 'Música & Audio',
    items: [
      { name: 'Spotify Premium', icon: Music, color: 'text-green-500', bgLight: 'bg-green-500/10' },
      { name: 'Apple Music', icon: Headphones, color: 'text-rose-500', bgLight: 'bg-rose-500/10' },
      { name: 'YouTube Music', icon: PlaySquare, color: 'text-red-500', bgLight: 'bg-red-500/10' },
      { name: 'Amazon Music', icon: Mic2, color: 'text-sky-400', bgLight: 'bg-sky-400/10' },
      { name: 'Deezer', icon: Radio, color: 'text-violet-500', bgLight: 'bg-violet-500/10' },
      { name: 'TIDAL', icon: Music, color: 'text-white', bgLight: 'bg-white/10', tag: 'Hi-Fi' },
      { name: 'SoundCloud Go', icon: Cloud, color: 'text-orange-500', bgLight: 'bg-orange-500/10' },
      { name: 'Brain.fm', icon: BrainCircuit, color: 'text-blue-400', bgLight: 'bg-blue-400/10', tag: 'Focus' },
      { name: 'Pandora', icon: Music, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
      { name: '¡Y muchos más!', icon: Plus, color: 'text-white/50', bgLight: 'bg-white/5', tag: 'Incluido' },
    ]
  },
  {
    name: 'Productividad, Educación & Diseño',
    items: [
      { name: 'Microsoft 365', icon: FileText, color: 'text-orange-500', bgLight: 'bg-orange-500/10', tag: 'Office' },
      { name: 'Canva Pro', icon: Paintbrush, color: 'text-cyan-400', bgLight: 'bg-cyan-400/10' },
      { name: 'Adobe Creative', icon: Paintbrush, color: 'text-red-500', bgLight: 'bg-red-500/10' },
      { name: 'Scribd', icon: BookOpen, color: 'text-emerald-600', bgLight: 'bg-emerald-600/10' },
      { name: 'Duolingo Super', icon: Bot, color: 'text-green-500', bgLight: 'bg-green-500/10' },
      { name: 'Nextory', icon: BookOpen, color: 'text-purple-500', bgLight: 'bg-purple-500/10' },
      { name: 'Audiolibros VIP', icon: Headphones, color: 'text-amber-500', bgLight: 'bg-amber-500/10' },
      { name: '¡Y muchos más!', icon: Plus, color: 'text-white/50', bgLight: 'bg-white/5', tag: 'Incluido' },
    ]
  },
  {
    name: 'Ciberseguridad & VPNs',
    items: [
      { name: 'Kaspersky Premium', icon: ShieldCheck, color: 'text-emerald-500', bgLight: 'bg-emerald-500/10' },
      { name: 'ESET / Norton', icon: ShieldCheck, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
      { name: 'Proton VPN', icon: Lock, color: 'text-green-600', bgLight: 'bg-green-600/10' },
      { name: 'Surfshark', icon: Lock, color: 'text-cyan-500', bgLight: 'bg-cyan-500/10' },
      { name: 'CyberGhost', icon: Lock, color: 'text-yellow-500', bgLight: 'bg-yellow-500/10' },
      { name: 'Google One', icon: Cloud, color: 'text-red-400', bgLight: 'bg-red-400/10', tag: 'Storage' },
      { name: '¡Y muchos más!', icon: Plus, color: 'text-white/50', bgLight: 'bg-white/5', tag: 'Incluido' },
    ]
  },
  {
    name: 'Inteligencia Artificial Pro',
    items: [
      { name: 'ChatGPT Plus', icon: Bot, color: 'text-emerald-500', bgLight: 'bg-emerald-500/10' },
      { name: 'Gemini Advanced', icon: Sparkles, color: 'text-blue-400', bgLight: 'bg-blue-400/10', tag: 'Google' },
      { name: 'Grok', icon: Lightbulb, color: 'text-white', bgLight: 'bg-white/10', tag: 'X.AI' },
      { name: 'Kimi IA', icon: MessageSquareCode, color: 'text-red-400', bgLight: 'bg-red-400/10' },
      { name: 'Perplexity Pro', icon: Search, color: 'text-cyan-400', bgLight: 'bg-cyan-400/10' },
      { name: 'Nano Banana', icon: BrainCircuit, color: 'text-yellow-400', bgLight: 'bg-yellow-400/10' },
      { name: 'Jarvis', icon: Cpu, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
      { name: 'Blackbox AI', icon: Terminal, color: 'text-zinc-400', bgLight: 'bg-zinc-400/10', tag: 'Code' },
      { name: '¡Y muchas más!', icon: Plus, color: 'text-white/50', bgLight: 'bg-white/5', tag: 'Incluido' },
    ]
  },
  {
    name: 'Contenido Exclusivo',
    items: [
      { name: 'Acceso Premium Nocturno', icon: Flame, color: 'text-rose-500', bgLight: 'bg-rose-500/10', tag: 'Privacidad +18' },
      { name: '¡Y muchos más!', icon: Plus, color: 'text-white/50', bgLight: 'bg-white/5', tag: 'Incluido' },
    ]
  }
]

export default function ServiceGridVIP() {
  return (
    <div className="space-y-12">
      {CATEGORIES.map((category, catIdx) => (
        <div key={catIdx} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-foreground">
              {category.name}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {category.items.map((item, itemIdx) => {
              const Icon = item.icon
              return (
                <div 
                  key={itemIdx} 
                  className="group relative glass-card p-4 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center text-center gap-3 backdrop-blur-md"
                >
                  {/* Etiqueta Especial Opcional */}
                  {item.tag && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/70">
                      {item.tag}
                    </div>
                  )}

                  {/* Icono con brillo */}
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${item.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.color} relative z-10`} />
                    <div className={`absolute inset-0 ${item.bgLight} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  </div>

                  {/* Nombre y Estado */}
                  <div className="space-y-1 w-full">
                    <p className="font-bold text-xs sm:text-sm text-foreground truncate px-1">{item.name}</p>
                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Activo</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
