'use client'

import React, { useRef, useState } from 'react'
import { Calendar, Mail, Download, QrCode, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import * as htmlToImage from 'html-to-image'

interface VipCredentialCardProps {
  profile: any
  latestMembership: any
  mStatus: 'Activa' | 'Por Vencer' | 'Vencida' | 'Sin plan'
}

export default function VipCredentialCard({ profile, latestMembership, mStatus }: VipCredentialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    setDownloading(true)
    try {
      const node = cardRef.current
      const width = node.offsetWidth
      const height = width / 1.586 // Proporción estricta de tarjeta de crédito (1.586 : 1)

      // html-to-image maneja CSS moderno de manera nativa sin fallar con colores lab/oklch
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1.0,
        pixelRatio: 3, // High resolution
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`
        }
      })
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `Pase_VIP_${profile?.full_name?.replace(/\s+/g, '_') || 'Cliente'}.png`
      link.click()
      
      toast.success('¡Pase VIP descargado exitosamente!')
    } catch (error) {
      console.error('Error al generar la imagen:', error)
      toast.error('Hubo un error al descargar la credencial. Intenta nuevamente.')
    } finally {
      setDownloading(false)
    }
  }

  const shortId = profile?.id ? profile.id.split('-')[0].toUpperCase() : 'VIP-0000X'

  const formatCardDate = (dateString?: string, formatStr = 'dd/MM/yy') => {
    if (!dateString) return 'XX/XX'
    try {
      return format(new Date(dateString), formatStr, { locale: es }).toUpperCase()
    } catch {
      return 'XX/XX'
    }
  }

  return (
    <div className="space-y-4 w-full flex flex-col items-center">
      {/* Contenedor de la vista previa descargable */}
      <div 
        ref={cardRef}
        className="relative rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-white/10 shadow-[0_0_50px_-15px_rgba(255,255,255,0.1)] overflow-hidden group w-full max-w-[500px] aspect-[1.586/1] flex flex-col justify-between"
      >
        {/* Holographic / Textural effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/30 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 p-5 sm:p-7 flex flex-col h-full justify-between">
          
          {/* Header de la Tarjeta */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                MEMBRESÍAS VIP
              </h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary">Credencial Exclusiva</p>
            </div>
            
            <div className="flex gap-4 items-center">
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full border text-[8px] sm:text-[9px] font-black uppercase tracking-widest shrink-0
                ${mStatus === 'Activa' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' : 
                  mStatus === 'Por Vencer' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                  'bg-red-500/10 border-red-500/30 text-red-400'}
              `}>
                {mStatus}
              </div>

              {/* Simulación de Chip de Tarjeta */}
              <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-md border border-yellow-600/50 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm flex items-center justify-center p-1.5 shadow-inner shrink-0">
                <div className="w-full h-full border border-yellow-500/30 rounded-sm grid grid-cols-2 gap-px opacity-70">
                  <div className="border border-yellow-500/20 rounded-sm" />
                  <div className="border border-yellow-500/20 rounded-sm" />
                  <div className="border border-yellow-500/20 rounded-sm" />
                  <div className="border border-yellow-500/20 rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Datos Centrales (Nombre y QR) */}
          <div className="flex justify-between items-end gap-3 mt-auto mb-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Titular de la cuenta</p>
              <p className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase drop-shadow-lg break-words leading-none">
                {profile?.full_name || 'USUARIO VIP'}
              </p>
              <p className="text-[8px] text-primary/80 font-black uppercase tracking-widest mt-1">{shortId}</p>
            </div>

            {/* Código QR decorativo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-xl">
              <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
            </div>
          </div>

          {/* Grid de Metadatos Footer */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-white/10">
            <div>
              <p className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-1 mb-0.5 truncate">
                <Mail className="w-2 h-2" /> E-Mail
              </p>
              <p className="text-[9px] sm:text-[10px] font-black text-white truncate drop-shadow-md">
                {profile?.email || 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest text-primary/70 mb-0.5">
                Desde
              </p>
              <p className="text-[10px] sm:text-xs font-black text-white drop-shadow-md" suppressHydrationWarning>
                {formatCardDate(profile?.created_at, 'MMM yy')}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-primary/70 mb-1 flex items-center justify-end gap-1">
                Vence <Calendar className="w-2.5 h-2.5" />
              </p>
              <p className="text-[10px] sm:text-xs font-black text-white drop-shadow-md" suppressHydrationWarning>
                {latestMembership?.end_date ? formatCardDate(latestMembership.end_date, 'dd/MM/yy') : 'VITALICIO'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Acción Externa */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full max-w-[500px] mx-auto flex items-center justify-center gap-2 py-4 bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all rounded-2xl border border-primary/20 shadow-lg shadow-primary/10 group focus:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {downloading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        )}
        <span className="font-black uppercase tracking-widest text-sm">
          {downloading ? 'Generando Imagen...' : 'Descargar Pase VIP'}
        </span>
      </button>
    </div>
  )
}
