'use client'

import React, { useState, useTransition } from 'react'
import { MoreHorizontal, Calendar, DollarSign, Edit, Trash2, Power, PowerOff, ShieldCheck, Zap, Settings } from 'lucide-react'
import { deletePlan, togglePlanStatus, updatePlan } from './actions'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function PlansTable({ plans }: { plans: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [editPlan, setEditPlan] = useState<any>(null)

  function handleDelete(id: string) {
    if (confirm('¿Estás seguro de eliminar este plan? Se perderá si no está asignado.')) {
      startTransition(async () => {
        const res = await deletePlan(id)
        if (res.error) toast.error(`Error al eliminar: ${res.error}`)
        else toast.success('Plan eliminado correctamente')
      })
    }
  }

  function handleToggleStatus(id: string, is_active: boolean) {
    startTransition(async () => {
      const res = await togglePlanStatus(id, is_active)
      if (res.error) toast.error(`Error cambiando estado: ${res.error}`)
      else toast.success(`Plan ${!is_active ? 'activado' : 'desactivado'} correctamente`)
    })
  }

  async function onSubmitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updatePlan(editPlan.id, formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Plan actualizado correctamente')
        setEditPlan(null)
      }
    })
  }

  return (
    <>
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Detalles del Plan</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Duración</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Costo</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Estatus</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Manejo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
                <TableRow key={plan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                          <Zap className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col">
                          <p className="font-bold text-sm text-foreground tracking-tight">{plan.name}</p>
                          <p className="text-xs text-muted-foreground font-medium opacity-70 line-clamp-1">{plan.description || 'Sin descripción'}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2 font-black text-xs text-muted-foreground">
                       <Calendar className="w-3.5 h-3.5" />
                       {plan.duration_days} DÍAS
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-1.5 font-black text-lg tracking-tighter text-foreground">
                       <span className="text-primary text-sm font-bold">$</span>
                       {plan.price}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    {plan.is_active ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full w-fit border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         Activo
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full w-fit border border-red-500/20 text-[10px] font-black uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                         Inactivo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all font-bold gap-2 bg-transparent"
                          onClick={() => setEditPlan(plan)}
                       >
                          <Settings className="w-4 h-4" />
                          Gestionar
                       </Button>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all bg-transparent"
                          onClick={() => handleDelete(plan.id)}
                       >
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium bg-muted/10 opacity-50">
                   <div className="flex flex-col items-center gap-2">
                       <Zap className="w-12 h-12" />
                       No se han definido planes de membresía aún.
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL EDITAR PLAN */}
      <Dialog open={!!editPlan} onOpenChange={(val) => !val && setEditPlan(null)}>
        <DialogContent className="glass-card border-none md:max-w-md rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10">
          {editPlan && (
            <>
              <div className="premium-gradient p-8 text-white relative">
                 <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                       <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <DialogTitle className="text-2xl font-black">Plan: {editPlan?.name}</DialogTitle>
                       <p className="text-white/70 text-sm font-medium">Ajuste técnico de valores comerciales</p>
                    </div>
                 </div>
                 <ShieldCheck className="absolute top-0 right-0 w-32 h-32 opacity-10 rotate-12 scale-125" />
              </div>
              
              <form onSubmit={onSubmitEdit} className="p-8 space-y-8">
                <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre Comercial</Label>
                      <Input name="name" defaultValue={editPlan?.name} required className="h-12 bg-white/5 border-white/10 rounded-xl font-bold focus:ring-primary/20" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Descripción Corta</Label>
                      <Input name="description" defaultValue={editPlan?.description || ''} className="h-12 bg-white/5 border-white/10 rounded-xl font-medium focus:ring-primary/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="grid gap-2">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Precio Unitario ($)</Label>
                         <Input name="price" type="number" step="0.01" defaultValue={editPlan?.price} required className="h-12 bg-white/5 border-white/10 rounded-xl font-black text-primary focus:ring-primary/20" />
                       </div>
                       <div className="grid gap-2">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Validez (Días)</Label>
                         <Input name="duration_days" type="number" defaultValue={editPlan?.duration_days} required className="h-12 bg-white/5 border-white/10 rounded-xl font-black focus:ring-primary/20" />
                       </div>
                    </div>
                </div>
                
                <div className="flex gap-4 pt-2">
                   <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl" onClick={() => setEditPlan(null)}>Cancelar</Button>
                   <Button type="submit" disabled={isPending} className="flex-1 premium-gradient h-12 rounded-xl font-black shadow-lg shadow-primary/25">
                     {isPending ? 'Actualizando...' : 'Guardar Cambios'}
                   </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

