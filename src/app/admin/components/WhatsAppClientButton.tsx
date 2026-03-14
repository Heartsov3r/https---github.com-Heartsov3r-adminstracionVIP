'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppClientButtonProps {
  phone: string
  fullName: string
  planName: string
  daysLeft?: number
  isExpired?: boolean
}

export function WhatsAppClientButton({ phone, fullName, planName, daysLeft, isExpired }: WhatsAppClientButtonProps) {
  const handleNotify = (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar navegación si el padre tiene link
    
    if (!phone) {
      alert("Este cliente no tiene un número de teléfono registrado.")
      return
    }

    let message = ""
    if (isExpired) {
      message = `Hola *${fullName}*, te saludamos de Membresías VIP. Te informamos que tu plan *${planName}* ha expirado. ¡Renueva ahora para seguir disfrutando de nuestros beneficios!`
    } else {
      message = `Hola *${fullName}*, te saludamos de Membresías VIP. Te recordamos que tu plan *${planName}* vencerá en *${daysLeft} días*. Evita cortes de servicio renovando a tiempo.`
    }

    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <Button 
      size="icon" 
      variant="ghost" 
      className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-full"
      onClick={handleNotify}
      title="Notificar por WhatsApp"
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  )
}
