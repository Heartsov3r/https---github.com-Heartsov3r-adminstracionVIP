'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, User, Users, Edit2, Shield, Calendar, Clock, Trash2, RefreshCw, Plus, Search, AlertTriangle, CheckCircle2, ArrowLeftRight, MinusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteUser, assignPlanToUser, renewMembership } from './actions'
import { updateUserProfile, addMembershipDays, subtractMembershipDays, changeMembershipPlan } from './[id]/actions'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PaginationControls } from '@/components/ui/pagination-controls'

const ITEMS_PER_PAGE = 20

export function UsersTable({ users, plans }: { users: any[], plans: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filtramos para mostrar SOLO a los clientes en esta tabla
  const allFilteredClients = useMemo(() => {
    const allClients = users.filter(u => u.role === 'client')
    if (!searchTerm) return allClients
    
    return allClients.filter(c => 
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const totalPages = Math.ceil(allFilteredClients.length / ITEMS_PER_PAGE)
  
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return allFilteredClients.slice(start, start + ITEMS_PER_PAGE)
  }, [allFilteredClients, currentPage])

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // States para modales
  const [editUser, setEditUser] = useState<any>(null)
  const [daysUser, setDaysUser] = useState<any>(null)
  const [planUser, setPlanUser] = useState<any>(null)
  const [renewUser, setRenewUser] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [changePlanUser, setChangePlanUser] = useState<any>(null)
  const [subtractDaysUser, setSubtractDaysUser] = useState<any>(null)

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const res = await deleteUser(deleteId)
      if (res.error) toast.error(`Error al eliminar: ${res.error}`)
      else {
        toast.success('Usuario eliminado correctamente')
        setDeleteId(null)
      }
    })
  }

  // --- Handlers de modales ---
  
  async function onSubmitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateUserProfile(editUser.id, formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Perfil actualizado con éxito')
        setEditUser(null)
      }
    })
  }

  async function onSubmitDays(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const days = parseInt(formData.get('days') as string)
    const reason = formData.get('reason') as string
    if (days < 1) return
    if (!reason || reason.trim().length === 0) { toast.error('El motivo es obligatorio.'); return }
    startTransition(async () => {
      const res = await addMembershipDays(daysUser.id, daysUser.latestMembership?.id || null, days, reason)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Se han añadido ${days} días de gracia`)
        setDaysUser(null)
      }
    })
  }

  async function onSubmitPlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const planId = formData.get('planId') as string
    const reason = formData.get('reason') as string
    if (!planId) return
    if (!reason || reason.trim().length === 0) { toast.error('El motivo es obligatorio.'); return }
    startTransition(async () => {
      const res = await assignPlanToUser(planUser.id, planUser.latestMembership?.id || null, planId, reason)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Plan asignado correctamente')
        setPlanUser(null)
      }
    })
  }

  async function onSubmitRenew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const planId = formData.get('planId') as string
    const reason = formData.get('reason') as string
    if (!planId) return
    if (!reason || reason.trim().length === 0) { toast.error('El motivo es obligatorio.'); return }
    startTransition(async () => {
      const res = await renewMembership(renewUser.id, planId, reason)
      if (res.error) toast.error(res.error)
      else {
        toast.success('¡Suscripción renovada con éxito!', {
          description: 'El nuevo ciclo se ha registrado correctamente.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        })
        setRenewUser(null)
        router.refresh()
      }
    })
  }

  async function onSubmitChangePlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const planId = formData.get('planId') as string
    const reason = formData.get('reason') as string
    if (!planId) return
    if (!reason || reason.trim().length === 0) { toast.error('El motivo es obligatorio.'); return }
    startTransition(async () => {
      const res = await changeMembershipPlan(changePlanUser.id, changePlanUser.latestMembership?.id, planId, reason)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Plan cambiado correctamente', {
          description: 'El plan de la membresía ha sido actualizado.',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        })
        setChangePlanUser(null)
        router.refresh()
      }
    })
  }

  async function onSubmitSubtractDays(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const days = parseInt(formData.get('days') as string)
    const reason = formData.get('reason') as string
    if (days < 1) return
    if (!reason || reason.trim().length === 0) { toast.error('El motivo es obligatorio.'); return }
    startTransition(async () => {
      const res = await subtractMembershipDays(subtractDaysUser.id, subtractDaysUser.latestMembership?.id || null, days, reason)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Se han restado ${days} días de la membresía`)
        setSubtractDaysUser(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="space-y-4">
        {/* BUSCADOR */}
        <div className="relative group max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <Input 
            placeholder="Buscar por nombre o correo..." 
            className="pl-12 h-14 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all font-medium text-base shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Nombre del Cliente</TableHead>
                <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Suscripción & Estatus</TableHead>
                <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Manejo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((user) => {
                 // Calcular días restantes si tiene membresía
                 let diasRestantes = 0
                 let isValid = false
                 let planName = 'Personalizada'

                 if (user.latestMembership && !isNaN(new Date(user.latestMembership.end_date).getTime())) {
                   const endDate = new Date(user.latestMembership.end_date)
                   diasRestantes = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                   isValid = diasRestantes > 0
                   planName = plans.find(p => p.id === user.latestMembership.plan_id)?.name || planName
                 }

                 return (
                  <TableRow key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="py-5 px-6">
                      <Link href={`/admin/users/${user.id}`} className="flex items-center gap-4 group/link">
                         <Avatar className="w-10 h-10 border border-primary/20 group-hover/link:border-primary/50 transition-colors shadow-lg shadow-primary/5">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground group-hover/link:text-primary transition-colors">
                              {user.full_name || 'Sin Nombre'}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
                         </div>
                      </Link>
                    </TableCell>
                    
                    <TableCell className="py-5 px-6">
                      {isValid ? (
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter premium-gradient text-white shadow-md shadow-primary/20">
                               {planName}
                            </div>
                            <div className="flex flex-col">
                               <div className="flex items-center gap-1.5 font-black text-xs text-emerald-500">
                                  <Clock className="w-3 h-3" />
                                  {diasRestantes} DÍAS RESTANTES
                               </div>
                               <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                  <div 
                                      className="h-full accent-gradient-green rounded-full shadow-[0_0_8px_rgba(52,211,153,0.4)]" 
                                      style={{ width: `${Math.min(100, (diasRestantes / 30) * 100)}%` }} 
                                  />
                               </div>
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-500/10 text-red-500 border border-red-500/20">
                               Expirado
                           </div>
                           <span className="text-xs font-bold text-muted-foreground italic">
                              {user.latestMembership ? `Terminó hace ${Math.abs(diasRestantes)}d` : 'Sin plan asociado'}
                           </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-5 px-6 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/5 border-white/10 rounded-xl font-bold gap-2 hover:bg-primary hover:text-white hover:border-transparent transition-all"
                        onClick={() => setEditUser(user)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {paginatedClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-medium bg-muted/10">
                     <div className="flex flex-col items-center gap-2 opacity-50">
                        {searchTerm ? <Search className="w-12 h-12" /> : <Users className="w-12 h-12" />}
                        {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay clientes registrados en el sistema.'}
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
               <PaginationControls 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
               />
            </div>
          )}
        </div>
      </div>

      {/* MODAL MAESTRO: EDITAR CLIENTE */}
      <Dialog open={!!editUser} onOpenChange={(val) => !val && setEditUser(null)}>
        <DialogContent className="max-w-xl glass-card border-none p-0 overflow-hidden shadow-none ring-1 ring-white/10">
          {editUser && (
            <>
              <div className="premium-gradient p-8 relative overflow-hidden">
                 <div className="relative z-10 flex items-center gap-4 text-white">
                    <Avatar className="w-16 h-16 border-4 border-white/20 shadow-xl">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editUser?.email}`} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                       <DialogTitle className="text-2xl font-black">{editUser?.full_name}</DialogTitle>
                       <p className="text-white/70 text-sm font-medium">Gestión administrativa del cliente</p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 scale-150">
                    <Shield className="w-32 h-32 text-white" />
                 </div>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
                
                {/* SECCIÓN 1: Datos Personales */}
                <form onSubmit={onSubmitEdit} className="space-y-6">
                  <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
                     <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Información Básica</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nombre Completo</Label>
                      <Input 
                        name="fullName" 
                        defaultValue={editUser?.full_name} 
                        required 
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-medium focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Teléfono</Label>
                      <Input 
                        name="phone" 
                        defaultValue={editUser?.phone} 
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Email</Label>
                      <Input 
                        name="email" 
                        type="email" 
                        defaultValue={editUser?.email} 
                        required 
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nueva Pass (Opc.)</Label>
                      <Input 
                        name="password" 
                        type="password" 
                        placeholder="Dejar en blanco para no cambiar" 
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-medium"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="premium-gradient w-full h-11 rounded-xl font-black tracking-tight shadow-lg shadow-primary/25" disabled={isPending}>
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    {isPending ? 'Procesando...' : 'Guardar Cambios del Perfil'}
                  </Button>
                </form>
    
                {/* SECCIÓN 2: Membresía y Planes */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                     <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground text-emerald-500">Operaciones de Suscripción</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-white/5 border-white/5 rounded-xl text-xs font-bold gap-2 h-12 hover:bg-white/10"
                      onClick={() => { setPlanUser(editUser); setEditUser(null); }}
                    >
                      <Calendar className="w-4 h-4" /> Asignar Plan
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-white/5 border-white/5 rounded-xl text-xs font-bold gap-2 h-12 hover:bg-white/10"
                      onClick={() => { setDaysUser(editUser); setEditUser(null); }}
                    >
                      <Clock className="w-4 h-4" /> Sumar Días
                    </Button>
    
                    <Button 
                      type="button" 
                      className="accent-gradient-green rounded-xl text-xs font-black gap-2 h-12 shadow-lg shadow-emerald-500/20"
                      onClick={() => { setRenewUser(editUser); setEditUser(null); }}
                    >
                      <RefreshCw className="w-4 h-4 text-white" /> Renovar
                    </Button>
                  </div>

                  {/* Operaciones de corrección */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {editUser?.latestMembership && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-amber-500/5 border-amber-500/20 rounded-xl text-xs font-bold gap-2 h-12 hover:bg-amber-500/10 text-amber-500"
                        onClick={() => { setChangePlanUser(editUser); setEditUser(null); }}
                      >
                        <ArrowLeftRight className="w-4 h-4" /> Cambiar Plan
                      </Button>
                    )}
                    
                    {editUser?.latestMembership && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-red-500/5 border-red-500/20 rounded-xl text-xs font-bold gap-2 h-12 hover:bg-red-500/10 text-red-500"
                        onClick={() => { setSubtractDaysUser(editUser); setEditUser(null); }}
                      >
                        <MinusCircle className="w-4 h-4" /> Restar Días
                      </Button>
                    )}
                  </div>
                </div>
    
                {/* SECCIÓN 3: Zona de Peligro */}
                <div className="pt-4 border-t border-white/5">
                  <Button 
                    type="button" 
                    variant="ghost"
                    className="w-full text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl text-xs font-bold h-11 transition-all"
                    onClick={() => {
                      setDeleteId(editUser.id);
                      setEditUser(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar cuenta de forma irreversible
                  </Button>
                </div>
              </div>
    
              <DialogFooter className="bg-muted/10 p-6 border-t border-white/5">
                <Button type="button" variant="ghost" className="font-bold text-muted-foreground w-full sm:w-auto" onClick={() => setEditUser(null)}>
                  Cerrar Panel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL ELIMINAR (PREMIUM) */}
      <Dialog open={!!deleteId} onOpenChange={(val) => !val && setDeleteId(null)}>
        <DialogContent className="glass-card border-none md:max-w-sm rounded-[2rem] p-8">
           <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                 <AlertTriangle className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                 <DialogTitle className="text-2xl font-black">¿Estás seguro?</DialogTitle>
                 <DialogDescription className="text-muted-foreground font-medium mt-2">
                   Esta acción desactivará al cliente permanentemente. Todos sus datos serán inaccesibles.
                 </DialogDescription>
              </div>
              <div className="flex gap-3 w-full">
                 <Button variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setDeleteId(null)}>Cancelar</Button>
                 <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700 font-black h-12 rounded-2xl shadow-lg shadow-red-500/20" onClick={handleDelete} disabled={isPending}>
                    {isPending ? 'Eliminando...' : 'Sí, Eliminar'}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* MODAL AÑADIR DÍAS */}
      <Dialog open={!!daysUser} onOpenChange={(val) => !val && setDaysUser(null)}>
        <DialogContent className="glass-card border-none md:max-w-sm rounded-[2rem] p-8">
          {daysUser && (
            <>
              <DialogHeader className="items-center text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <DialogTitle className="text-2xl font-black">Añadir Días Gracia</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmitDays} className="space-y-6 mt-4">
                 <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <p className="text-xs font-black text-muted-foreground uppercase opacity-60 mb-1">Cliente Objetivo</p>
                    <span className="font-bold text-sm">{daysUser?.full_name}</span>
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Días a Sumar</Label>
                    <Input type="number" name="days" defaultValue={5} min={1} required className="h-14 rounded-2xl bg-white/5 border-white/10 text-center text-2xl font-black" />
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Motivo del cambio <span className="text-red-500">*</span></Label>
                    <Textarea name="reason" required placeholder="Ej: Bonificación por inconvenientes, cortesía..." className="rounded-2xl bg-white/5 border-white/10 min-h-[80px] text-sm font-medium resize-none" />
                 </div>
                 <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setDaysUser(null)}>Cancelar</Button>
                    <Button type="submit" disabled={isPending} className="flex-1 premium-gradient h-12 rounded-2xl font-black">
                        {isPending ? 'Cargando...' : 'Conceder'}
                    </Button>
                 </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL ASIGNAR PLAN */}
      <Dialog open={!!planUser} onOpenChange={(val) => !val && setPlanUser(null)}>
        <DialogContent className="glass-card border-none md:max-w-md rounded-[2rem] p-8">
          {planUser && (
            <>
              <DialogHeader className="items-center text-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">Vincular Nuevo Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmitPlan} className="space-y-6 mt-4">
                 <div className="grid gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {plans.map(p => (
                       <label key={p.id} className="relative group cursor-pointer">
                          <input type="radio" name="planId" value={p.id} className="peer sr-only" required />
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 peer-checked:bg-primary/10 peer-checked:border-primary/50 transition-all flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">{p.name}</span>
                                <span className="text-xs text-muted-foreground">{p.duration_days} días de acceso</span>
                             </div>
                             <div className="text-lg font-black text-primary group-hover:scale-110 transition-transform">${p.price}</div>
                          </div>
                       </label>
                    ))}
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Motivo <span className="text-red-500">*</span></Label>
                    <Textarea name="reason" required placeholder="Ej: Primer plan asignado, cambio de paquete..." className="rounded-2xl bg-white/5 border-white/10 min-h-[80px] text-sm font-medium resize-none" />
                 </div>
                 <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12" onClick={() => setPlanUser(null)}>Cancelar</Button>
                    <Button type="submit" disabled={isPending || plans.length === 0} className="flex-1 premium-gradient h-12 rounded-2xl font-black text-white">
                       Asignar Ahora
                    </Button>
                 </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL RENOVAR MEMBRESÍA (NUEVO CICLO) */}
      <Dialog open={!!renewUser} onOpenChange={(val) => !val && setRenewUser(null)}>
        <DialogContent className="glass-card border-none md:max-w-md rounded-[2rem] p-8">
          {renewUser && (
            <>
              <DialogHeader className="items-center text-center">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <RefreshCw className="w-8 h-8 text-emerald-500" />
                </div>
                <DialogTitle className="text-2xl font-black">Renovar Suscripción</DialogTitle>
                <p className="text-xs text-muted-foreground font-bold italic opacity-60">Se iniciará un nuevo ciclo de facturación independiente</p>
              </DialogHeader>
              <form onSubmit={onSubmitRenew} className="space-y-6 mt-4">
                 <div className="grid gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {plans.map(p => (
                       <label key={p.id} className="relative group cursor-pointer">
                          <input type="radio" name="planId" value={p.id} className="peer sr-only" required />
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/50 transition-all flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">{p.name}</span>
                                <span className="text-xs text-muted-foreground">{p.duration_days} días</span>
                             </div>
                             <div className="text-lg font-black text-emerald-500 group-hover:scale-110 transition-transform">${p.price}</div>
                          </div>
                       </label>
                    ))}
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Motivo <span className="text-red-500">*</span></Label>
                    <Textarea name="reason" required placeholder="Ej: Renovación mensual, extensión de servicio..." className="rounded-2xl bg-white/5 border-white/10 min-h-[80px] text-sm font-medium resize-none" />
                 </div>
                 <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setRenewUser(null)}>Cancelar</Button>
                    <Button type="submit" disabled={isPending || plans.length === 0} className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-500/20">
                       Confirmar Ciclo
                    </Button>
                 </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL CAMBIAR PLAN (CORRECCIÓN) */}
      <Dialog open={!!changePlanUser} onOpenChange={(val) => !val && setChangePlanUser(null)}>
        <DialogContent className="glass-card border-none md:max-w-md rounded-[2rem] p-8">
          {changePlanUser && (
            <>
              <DialogHeader className="items-center text-center">
                 <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <ArrowLeftRight className="w-8 h-8 text-amber-500" />
                </div>
                <DialogTitle className="text-2xl font-black">Cambiar Plan Actual</DialogTitle>
                <p className="text-xs text-muted-foreground font-bold italic opacity-60">Se actualizará el plan de la membresía existente</p>
              </DialogHeader>
              <form onSubmit={onSubmitChangePlan} className="space-y-6 mt-4">
                 <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <p className="text-xs font-black text-muted-foreground uppercase opacity-60 mb-1">Cliente</p>
                    <span className="font-bold text-sm">{changePlanUser?.full_name}</span>
                    {changePlanUser?.latestMembership?.plan_id && (
                      <p className="text-xs text-amber-500 font-bold mt-1">Plan actual: {plans.find(p => p.id === changePlanUser.latestMembership.plan_id)?.name || 'Desconocido'}</p>
                    )}
                 </div>
                 <div className="grid gap-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                    {plans.filter(p => p.id !== changePlanUser?.latestMembership?.plan_id).map(p => (
                       <label key={p.id} className="relative group cursor-pointer">
                          <input type="radio" name="planId" value={p.id} className="peer sr-only" required />
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 peer-checked:bg-amber-500/10 peer-checked:border-amber-500/50 transition-all flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">{p.name}</span>
                                <span className="text-xs text-muted-foreground">{p.duration_days} días</span>
                             </div>
                             <div className="text-lg font-black text-amber-500 group-hover:scale-110 transition-transform">${p.price}</div>
                          </div>
                       </label>
                    ))}
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Motivo del cambio <span className="text-red-500">*</span></Label>
                    <Textarea name="reason" required placeholder="Ej: Error al asignar plan, el cliente solicitó cambio de plan..." className="rounded-2xl bg-white/5 border-white/10 min-h-[80px] text-sm font-medium resize-none" />
                 </div>
                 <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setChangePlanUser(null)}>Cancelar</Button>
                    <Button type="submit" disabled={isPending} className="flex-1 h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-lg shadow-amber-500/20">
                       {isPending ? 'Procesando...' : 'Confirmar Cambio'}
                    </Button>
                 </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL RESTAR DÍAS (SANCIÓN) */}
      <Dialog open={!!subtractDaysUser} onOpenChange={(val) => !val && setSubtractDaysUser(null)}>
        <DialogContent className="glass-card border-none md:max-w-sm rounded-[2rem] p-8">
          {subtractDaysUser && (
            <>
              <DialogHeader className="items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <MinusCircle className="w-8 h-8 text-red-500" />
                </div>
                <DialogTitle className="text-2xl font-black">Restar Días de Membresía</DialogTitle>
                <p className="text-xs text-muted-foreground font-bold italic opacity-60">Se descontarán días de la suscripción activa</p>
              </DialogHeader>
              <form onSubmit={onSubmitSubtractDays} className="space-y-6 mt-4">
                 <div className="bg-muted/30 p-4 rounded-2xl text-center">
                    <p className="text-xs font-black text-muted-foreground uppercase opacity-60 mb-1">Cliente Objetivo</p>
                    <span className="font-bold text-sm">{subtractDaysUser?.full_name}</span>
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Días a Restar</Label>
                    <Input type="number" name="days" defaultValue={1} min={1} required className="h-14 rounded-2xl bg-white/5 border-white/10 text-center text-2xl font-black text-red-500" />
                 </div>
                 <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest leading-none">Motivo de la sanción <span className="text-red-500">*</span></Label>
                    <Textarea name="reason" required placeholder="Ej: Violación de reglas, sanción disciplinaria, corrección de error..." className="rounded-2xl bg-white/5 border-white/10 min-h-[80px] text-sm font-medium resize-none" />
                 </div>
                 <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setSubtractDaysUser(null)}>Cancelar</Button>
                    <Button type="submit" disabled={isPending} className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20">
                        {isPending ? 'Procesando...' : 'Restar Días'}
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
