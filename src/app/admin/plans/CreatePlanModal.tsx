'use client'

import { useState, useTransition, useRef } from 'react'
import { createPlan } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Zap, ShieldCheck, DollarSign, Calendar } from 'lucide-react'

export function CreatePlanModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  async function onSubmit(formData: FormData) {
      startTransition(async () => {
          const res = await createPlan(formData)
          if (res.error) {
             alert(`Error: ${res.error}`)
          } else {
             alert("Plan creado exitosamente")
             formRef.current?.reset()
             setOpen(false)
          }
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="premium-gradient rounded-xl font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 h-10 px-6 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center">
        <Plus className="w-4 h-4" /> Nuevo Plan
      </DialogTrigger>
      <DialogContent className="glass-card border-none md:max-w-md rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl">
        <div className="premium-gradient p-8 text-white relative">
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Zap className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                 <DialogTitle className="text-2xl font-black">Crear Membresía</DialogTitle>
                 <p className="text-white/70 text-sm font-medium">Define nuevos servicios para el sistema</p>
              </div>
           </div>
           <ShieldCheck className="absolute top-0 right-0 w-32 h-32 opacity-10 rotate-12 scale-125" />
        </div>

        <form ref={formRef} action={onSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="create-name" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre del Plan</Label>
              <Input id="create-name" name="name" required placeholder="Ej. VIP Diamond" className="h-12 bg-white/5 border-white/10 rounded-xl font-bold focus:ring-primary/20" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Propuesta de Valor</Label>
              <Input id="create-description" name="description" placeholder="Ingresa los beneficios..." className="h-12 bg-white/5 border-white/10 rounded-xl font-medium focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="create-price" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Inversión ($)</Label>
                  <div className="relative">
                     <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                     <Input id="create-price" name="price" type="number" step="0.01" required placeholder="0.00" className="h-12 bg-white/5 border-white/10 rounded-xl pl-9 font-black text-primary" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-duration_days" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Ciclo (Días)</Label>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                     <Input id="create-duration_days" name="duration_days" type="number" required placeholder="30" className="h-12 bg-white/5 border-white/10 rounded-xl pl-9 font-black" />
                  </div>
                </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-2">
             <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl text-muted-foreground" onClick={() => setOpen(false)}>Descartar</Button>
             <Button type="submit" disabled={isPending} className="flex-1 premium-gradient h-12 rounded-xl font-black shadow-lg shadow-primary/25">
               {isPending ? 'Procesando...' : 'Lanzar Plan'}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
