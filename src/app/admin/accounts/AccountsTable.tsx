'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { 
  Search, 
  Key, 
  User, 
  Copy, 
  Eye, 
  EyeOff, 
  Check, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  Tv,
  ExternalLink,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteAccount, toggleAccountStatus } from './actions'
import { AccountModal } from './AccountModal'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog'

export function AccountsTable({ accounts }: { accounts: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  // Lógica para detectar el link de activación del servicio seleccionado
  const activeActivationAccount = useMemo(() => {
    if (!selectedService) return null
    const serviceAccounts = accounts.filter(acc => (acc.service_name?.toLowerCase().trim() || '') === selectedService)
    return serviceAccounts.find(acc => acc.tv_activation_link) || null
  }, [accounts, selectedService])

  // Lógica de Agrupación Normalizada
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    accounts.forEach(acc => {
      const rawName = acc.service_name || 'Sin nombre'
      const key = rawName.toLowerCase().trim()
      if (!groups[key]) groups[key] = []
      groups[key].push(acc)
    })

    return Object.entries(groups).map(([key, items]) => {
      const displayName = items.reduce((prev, curr) => {
        const currName = curr.service_name || 'Sin nombre'
        return currName.length >= prev.length ? currName : prev
      }, items[0].service_name || 'Sin nombre')

      return {
        key,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        total: items.length,
        active: items.filter(i => i.is_active).length,
        items
      }
    }).sort((a, b) => b.total - a.total)
  }, [accounts])

  const filteredAccounts = useMemo(() => {
    let filtered = accounts
    if (selectedService) {
      filtered = filtered.filter(acc => (acc.service_name?.toLowerCase().trim() || '') === selectedService)
    }

    if (!searchTerm) return filtered
    
    const s = searchTerm.toLowerCase()
    return filtered.filter(acc => 
      (acc.service_name?.toLowerCase() || '').includes(s) ||
      (acc.notes?.toLowerCase() || '').includes(s) ||
      (acc.email?.toLowerCase() || '').includes(s) ||
      (acc.registered_by_name?.toLowerCase() || '').includes(s)
    )
  }, [accounts, searchTerm, selectedService])

  const getServiceColor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('netflix')) return 'from-red-600/20 to-red-600/5 text-red-500'
    if (n.includes('disney')) return 'from-blue-600/20 to-blue-600/5 text-blue-400'
    if (n.includes('hbo') || n.includes('max')) return 'from-purple-600/20 to-purple-600/5 text-purple-400'
    if (n.includes('amazon') || n.includes('prime')) return 'from-sky-500/20 to-sky-500/5 text-sky-400'
    if (n.includes('paramount')) return 'from-blue-800/20 to-blue-800/5 text-blue-300'
    if (n.includes('star')) return 'from-orange-600/20 to-orange-600/5 text-orange-400'
    if (n.includes('apple')) return 'from-zinc-500/20 to-zinc-500/5 text-zinc-300'
    if (n.includes('crunchyroll')) return 'from-orange-500/20 to-orange-500/5 text-orange-500'
    return 'from-primary/20 to-primary/5 text-primary'
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Copiado al portapapeles')
  }

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const res = await deleteAccount(deleteId)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Cuenta eliminada permanentemente')
        setDeleteId(null)
      }
    })
  }

  const handleToggleStatus = (id: string, status: boolean) => {
    startTransition(async () => {
      const res = await toggleAccountStatus(id, status)
      if (res.error) toast.error(res.error)
      else toast.success(`Cuenta ${!status ? 'activada' : 'desactivada'}`)
    })
  }

  if (!selectedService && !searchTerm) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between">
           <div className="relative group w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Buscar en todas las cuentas..." 
                className="pl-12 h-14 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/20 transition-all shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <AccountModal />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {groupedAccounts.map((group) => {
             const serviceColor = getServiceColor(group.name)
             const hasActivationLink = group.items.some(i => i.tv_activation_link)
             
             return (
               <div 
                  key={group.key} 
                  onClick={() => setSelectedService(group.key)}
                  className="group relative cursor-pointer"
               >
                  <div className={`absolute inset-0 bg-gradient-to-br ${serviceColor.split(' ').slice(0, 2).join(' ')} opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] blur-2xl -z-10`} />
                  <div className={`glass-card p-8 rounded-[2.5rem] border border-white/5 bg-sidebar/30 backdrop-blur-md hover:border-white/20 transition-all hover:translate-y-[-4px] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between ring-1 ring-white/5 group-hover:ring-white/10`}>
                     <FolderOpen className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-all -rotate-12 ${serviceColor.split(' ').pop()}`} />
                     
                     <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-start">
                           <div className={`w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform ${serviceColor.split(' ').pop()}`}>
                              {group.name.toLowerCase().includes('netflix') ? <ShieldCheck className="w-8 h-8" /> : <Key className="w-8 h-8" />}
                           </div>
                           {hasActivationLink && (
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                                <Tv className="w-5 h-5" />
                             </div>
                           )}
                        </div>
                        
                        <div className="space-y-1">
                           <h3 className="text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors">{group.name}</h3>
                           <div className="flex items-center gap-2">
                              <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${serviceColor.split(' ').slice(0, 2).join(' ')} ${serviceColor.split(' ').pop()}`}>
                                 {group.total} {group.total === 1 ? 'Cuenta' : 'Cuentas'}
                              </div>
                            </div>
                        </div>
                     </div>

                     <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">Disponibles</span>
                          <span className="text-xl font-black text-emerald-500">{group.active}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-background transition-all`}>
                           <ChevronRight className="w-5 h-5" />
                        </div>
                     </div>
                  </div>
               </div>
             )
           })}

           {groupedAccounts.length === 0 && (
             <div className="col-span-full h-80 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02]">
                <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-bold">No hay ninguna cuenta registrada todavía.</p>
                <div className="mt-6">
                   <AccountModal />
                </div>
             </div>
           )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
           <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { setSelectedService(null); setSearchTerm(''); }}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10"
           >
              <ArrowLeft className="w-6 h-6" />
           </Button>
           <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground h-4">
                 <span className="text-[10px] font-black uppercase tracking-widest">Cuentas</span>
                 <ChevronRight className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Detalle</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">
                {searchTerm ? 'Resultados de Búsqueda' : selectedService}
              </h2>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="relative group w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder={`Buscar en ${selectedService || 'resultados'}...`} 
                className="pl-12 h-14 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/20 transition-all shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <AccountModal />
        </div>

        {/* BANNER DE ACTIVACIÓN TV (Exclusivo en vista de detalle) */}
        {activeActivationAccount && (
           <div className="premium-gradient p-1 rounded-[2rem] shadow-2xl shadow-primary/10 group">
              <div className="bg-sidebar/40 backdrop-blur-xl rounded-[1.8rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/5">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/10">
                       <Monitor className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Enlace de Activación TV</span>
                          <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-6 w-6 rounded-md hover:bg-primary/20 text-primary/50 hover:text-primary transition-colors"
                             onClick={() => setEditingAccount(activeActivationAccount)}
                          >
                             <Edit3 className="w-3 h-3" />
                          </Button>
                       </div>
                       <h3 className="text-lg font-black tracking-tight text-white/90 truncate max-w-[250px] sm:max-w-md">
                          {activeActivationAccount.tv_activation_link}
                       </h3>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                       variant="ghost" 
                       onClick={() => handleCopy(activeActivationAccount.tv_activation_link, 'tv-link')}
                       className="flex-1 sm:flex-none h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold gap-2 px-6 border border-white/5 transition-all"
                    >
                       {copiedId === 'tv-link' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       {copiedId === 'tv-link' ? 'Copiado' : 'Copiar'}
                    </Button>
                    <Button 
                       render={<a href={activeActivationAccount.tv_activation_link} target="_blank" rel="noopener noreferrer" />}
                       nativeButton={false}
                       className="flex-1 sm:flex-none h-12 rounded-xl premium-gradient font-bold gap-2 px-6 shadow-xl shadow-primary/20 group/btn transition-all"
                    >
                       Ir al Link
                       <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                 </div>
              </div>
           </div>
        )}
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-sidebar/30 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="py-7 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Credenciales / Usuario</TableHead>
              <TableHead className="py-7 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Estado y Notas</TableHead>
              <TableHead className="py-7 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin / Registro</TableHead>
              <TableHead className="py-7 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((acc) => (
              <TableRow key={acc.id} className={`border-b border-white/5 transition-colors group ${!acc.is_active ? 'opacity-50 grayscale' : 'hover:bg-white/5'}`}>
                <TableCell className="py-6 px-8">
                   <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all ${acc.is_active ? 'bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5 group-hover:scale-110' : 'bg-muted/10 border-white/5 text-muted-foreground'}`}>
                         <User className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-2 min-w-0">
                         <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopy(acc.email, acc.id + '-email')}>
                            <span className="text-sm font-black truncate max-w-[200px]">{acc.email}</span>
                            <div className="h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover/copy:opacity-100 transition-opacity bg-white/5">
                               {copiedId === acc.id + '-email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </div>
                         </div>
                         <div className="flex items-center gap-2 group/pass">
                            <span className="text-xs font-mono tracking-tighter bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                               {showPasswords[acc.id] ? acc.password : '••••••••'}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover/pass:opacity-100 transition-opacity">
                               <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => togglePassword(acc.id)}>
                                  {showPasswords[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                               </Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleCopy(acc.password, acc.id + '-pass')}>
                                  {copiedId === acc.id + '-pass' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                               </Button>
                            </div>
                         </div>
                      </div>
                   </div>
                </TableCell>

                <TableCell className="py-6 px-8">
                   <div className="flex flex-col gap-2">
                      <div className={`text-[9px] h-5 w-fit px-2 inline-flex items-center rounded-full font-black uppercase tracking-tighter border ${acc.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                         {acc.is_active ? 'Activa' : 'Inactiva'}
                      </div>
                      {acc.notes ? (
                        <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 max-w-[200px]">
                           {acc.notes}
                        </p>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic opacity-40">Sin notas adicionales</span>
                      )}
                      {acc.tv_activation_link && (
                        <div className="flex items-center gap-1.5 text-primary text-[10px] font-black">
                           <Tv className="w-3 h-3" />
                           Link de TV activo
                        </div>
                      )}
                   </div>
                </TableCell>

                <TableCell className="py-6 px-8">
                   <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold">
                         <div className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                         </div>
                         {acc.registered_by_name}
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-8 font-black opacity-60">
                         {new Date(acc.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                   </div>
                </TableCell>

                <TableCell className="py-6 px-8 text-right">
                   <DropdownMenu>
                      <DropdownMenuTrigger 
                         render={
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-white/10 transition-colors">
                               <MoreHorizontal className="w-5 h-5" />
                            </Button>
                         } 
                      />
                      <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] border-white/10 bg-sidebar/95 backdrop-blur-xl p-2 shadow-2xl">
                         <DropdownMenuItem 
                            onClick={() => setEditingAccount(acc)}
                            className="gap-3 cursor-pointer p-3 rounded-xl focus:bg-white/5 transition-colors"
                         >
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <Edit3 className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-sm">Editar</span>
                               <span className="text-[10px] text-muted-foreground">Modificar credenciales</span>
                            </div>
                         </DropdownMenuItem>
                         
                         <DropdownMenuItem 
                            onClick={() => handleToggleStatus(acc.id, acc.is_active)}
                            className="gap-3 cursor-pointer p-3 rounded-xl focus:bg-white/5 transition-colors"
                         >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${acc.is_active ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                               <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-sm">{acc.is_active ? 'Desactivar' : 'Activar'}</span>
                               <span className="text-[10px] text-muted-foreground">{acc.is_active ? 'Ocultar temporalmente' : 'Volver a mostrar'}</span>
                            </div>
                         </DropdownMenuItem>
                         
                         <div className="h-px bg-white/5 my-1.5" />
                         
                         <DropdownMenuItem 
                            onClick={() => setDeleteId(acc.id)}
                            className="gap-3 cursor-pointer p-3 rounded-xl text-red-500 focus:text-red-500 focus:bg-red-500/10 transition-colors"
                         >
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                               <Trash2 className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-sm">Eliminar</span>
                               <span className="text-[10px] text-red-500/70">Borrar permanentemente</span>
                            </div>
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {filteredAccounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-72 text-center bg-white/[0.02]">
                   <div className="flex flex-col items-center gap-4 text-muted-foreground/50 scale-110">
                      <div className="w-20 h-20 rounded-[2rem] bg-muted/10 flex items-center justify-center mb-2">
                        <FolderOpen className="w-10 h-10 stroke-[1.5]" />
                      </div>
                      <div className="flex flex-col gap-1">
                         <p className="text-lg font-black tracking-tight text-foreground/70">
                            {searchTerm ? 'Sin coincidencias' : `No hay cuentas en ${selectedService}`}
                         </p>
                         <p className="text-xs font-medium max-w-[250px] mx-auto opacity-60">
                            {searchTerm ? `No encontramos resultados para "${searchTerm}" en esta carpeta.` : `Aún no has registrado ninguna cuenta para el servicio ${selectedService}.`}
                         </p>
                      </div>
                      {!searchTerm && <AccountModal />}
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmación Borrado */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
         <DialogContent className="rounded-[2.5rem] border-white/10 bg-sidebar/95 backdrop-blur-xl max-w-sm p-10 shadow-2xl ring-1 ring-white/10">
            <div className="flex flex-col items-center text-center gap-7">
               <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 ring-[12px] ring-red-500/5">
                  <AlertTriangle className="w-12 h-12 animate-pulse" />
               </div>
               <DialogHeader>
                  <DialogTitle className="text-3xl font-black">¿Confirmar borrado?</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium pt-3 px-2 leading-relaxed text-base">
                     Esta acción **no se puede deshacer**. Se perderán todos los datos de esta cuenta.
                  </DialogDescription>
               </DialogHeader>
               <div className="flex items-center gap-4 w-full mt-4">
                  <Button variant="ghost" className="flex-1 rounded-[1.25rem] bg-white/5 font-black h-14 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs" onClick={() => setDeleteId(null)}>
                     Cancelar
                  </Button>
                  <Button onClick={handleDelete} disabled={isPending} className="flex-1 rounded-[1.25rem] bg-red-600 hover:bg-red-700 font-black h-14 shadow-xl shadow-red-500/20 transition-all uppercase tracking-widest text-xs">
                     {isPending ? 'Borrando...' : 'Sí, Borrar'}
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      <AccountModal 
        account={editingAccount} 
        openOverride={!!editingAccount}
        setOpenOverride={(val) => !val && setEditingAccount(null)}
      />
    </div>
  )
}
