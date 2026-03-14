'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppReportButtonProps {
  stats: any
}

export function WhatsAppReportButton({ stats }: WhatsAppReportButtonProps) {
  const handleReport = () => {
    const soonList = stats.details?.soonToExpireList || []
    if (soonList.length === 0) {
      alert("No hay vencimientos próximos en 7 días para reportar.")
      return
    }
    
    const reportLines = soonList.map((c: any) => 
      `• ${c.full_name} (${c.plan_name}) - Vence en ${c.daysLeft} días`
    ).join('%0A')
    
    const message = `*REPORTE DE VENCIMIENTOS (PRÓXIMOS 7 DÍAS)*%0A%0A${reportLines}%0A%0AFavor de gestionar los cobros correspondientes.`
    
    const adminPhone = stats.admins?.find((a: any) => a.phone)?.phone || ''
    window.open(`https://wa.me/${adminPhone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  return (
    <Button 
      size="sm" 
      variant="default" 
      className="bg-emerald-600 hover:bg-emerald-700 text-[9px] font-black uppercase tracking-widest h-7 px-2 rounded-lg shadow-lg shadow-emerald-500/20 gap-1"
      onClick={handleReport}
    >
      <MessageCircle className="w-3 h-3" /> Reportar WA
    </Button>
  )
}
