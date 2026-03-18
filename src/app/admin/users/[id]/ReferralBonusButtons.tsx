'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, Loader2, Plus } from 'lucide-react'
import { addReferralBonus } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ReferralBonusButtonsProps {
  userId: string
  currentMembershipId: string | null
}

export function ReferralBonusButtons({ userId, currentMembershipId }: ReferralBonusButtonsProps) {
  const [loading, setLoading] = useState(false)
  const [daysInput, setDaysInput] = useState('')
  const router = useRouter()

  const handleAddBonus = async () => {
    const days = parseInt(daysInput, 10)
    if (isNaN(days) || days <= 0) {
      toast.error('Por favor ingresa un número válido de días.')
      return
    }

    setLoading(true)
    try {
      const result = await addReferralBonus(userId, currentMembershipId, days)
      if (result.success) {
        toast.success(`Se han añadido ${days} días por referido.`)
        setDaysInput('')
        router.refresh()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al añadir los días.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02] space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Gift className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black tracking-tighter uppercase italic">Agregar días por referido</h3>
      </div>
      
      <p className="text-xs text-muted-foreground font-medium opacity-60">
        Ingresa la cantidad de días exactos para extender la membresía. No se generará boleta.
      </p>

      <div className="flex gap-3 pt-2">
        <div className="relative flex-1">
          <Input 
            type="number"
            min="1"
            placeholder="Ej: 5"
            value={daysInput}
            onChange={(e) => setDaysInput(e.target.value)}
            className="h-12 bg-black/20 border-white/10 text-lg font-bold pl-4 pr-12 focus-visible:ring-primary/50"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-muted-foreground opacity-50">Días</span>
        </div>
        
        <Button
          onClick={handleAddBonus}
          disabled={loading || !daysInput}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black tracking-widest uppercase transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Agregar</>}
        </Button>
      </div>
    </div>
  )
}
