'use client'

import React, { useState, useTransition } from 'react'
import { 
  Plus, 
  Wallet, 
  Banknote, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  Power,
  CreditCard,
  Bitcoin,
  Globe,
  Globe2,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  togglePaymentMethodStatus 
} from './actions'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function PaymentMethodsClient({ initialMethods }: { initialMethods: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  const [methodToDelete, setMethodToDelete] = useState<any>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('Global')

  const handleOpenAdd = () => {
    setEditingMethod(null)
    setSelectedCountry('Global')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (method: any) => {
    setEditingMethod(method)
    setSelectedCountry(method.country || 'Global')
    setIsModalOpen(true)
  }

  const handleOpenDelete = (method: any) => {
    setMethodToDelete(method)
    setIsDeleteModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const res = editingMethod 
        ? await updatePaymentMethod(editingMethod.id, formData)
        : await createPaymentMethod(formData)
      
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(editingMethod ? 'Método actualizado' : 'Método creado')
        setIsModalOpen(false)
      }
    })
  }

  const handleDelete = () => {
    if (!methodToDelete) return
    startTransition(async () => {
      const res = await deletePaymentMethod(methodToDelete.id)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Método eliminado permanentemente')
        setIsDeleteModalOpen(false)
      }
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await togglePaymentMethodStatus(id, currentStatus)
      if (res.error) toast.error(res.error)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="premium-gradient rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20">
          <Plus className="w-4 h-4" /> Añadir Método
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialMethods.map((method) => (
          <div key={method.id} className={cn(
            "glass-card p-6 rounded-[2.5rem] border border-white/5 transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]",
            !method.is_active && "opacity-60 grayscale-[0.5]"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                {method.type === 'bank_transfer' && <Banknote className="w-6 h-6" />}
                {method.type === 'digital_wallet' && <Smartphone className="w-6 h-6" />}
                {method.type === 'crypto' && <Bitcoin className="w-6 h-6" />}
                {method.type === 'online_gateway' && <Globe2 className="w-6 h-6" />}
                {method.type === 'other' && <Wallet className="w-6 h-6" />}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10" onClick={() => handleOpenEdit(method)}>
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500" onClick={() => handleOpenDelete(method)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{method.name}</h3>
                {method.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-tighter">Activo</Badge>
                ) : (
                  <Badge className="bg-zinc-500/10 text-zinc-500 border-none text-[8px] font-black uppercase tracking-tighter">Inactivo</Badge>
                )}
              </div>
              <p className="text-2xl font-black text-foreground tracking-tighter font-mono">{method.details}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                <ShieldCheck className="w-3 h-3" /> {method.owner_name}
              </div>
              {method.country && (
                <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                  <Globe className="w-3 h-3 opacity-50" /> {method.country}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                 {method.type === 'bank_transfer' && 'Cuenta Bancaria'}
                 {method.type === 'digital_wallet' && 'Billetera Digital'}
                 {method.type === 'crypto' && 'Criptomonedas'}
                 {method.type === 'online_gateway' && 'Pasarela de Pago'}
                 {method.type === 'other' && 'Otro Método'}
               </span>
               <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 rounded-lg font-black uppercase text-[9px] tracking-widest gap-2",
                  method.is_active ? "text-red-500 hover:bg-red-500/10" : "text-emerald-500 hover:bg-emerald-500/10"
                )}
                onClick={() => handleToggle(method.id, method.is_active)}
                disabled={isPending}
               >
                 <Power className="w-3 h-3" /> {method.is_active ? 'Desactivar' : 'Activar'}
               </Button>
            </div>
          </div>
        ))}

        {initialMethods.length === 0 && (
          <div className="col-span-full py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 opacity-50">
               <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-1">No hay métodos registrados</h3>
            <p className="text-sm text-muted-foreground font-medium">Comienza por añadir tu primer medio de pago para tus clientes.</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-card border-none w-[95vw] max-w-xl rounded-[1.5rem] sm:rounded-[2.5rem] p-0 overflow-y-auto max-h-[90vh] shadow-2xl ring-1 ring-white/10">
          <div className="premium-gradient p-5 sm:p-8 text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                   <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                   <DialogTitle className="text-xl sm:text-2xl font-black">{editingMethod ? 'Editar Método' : 'Nuevo Método'}</DialogTitle>
                   <p className="text-white/70 text-xs sm:text-sm font-medium mt-1">Configura tus datos financieros para cobros globales.</p>
                </div>
             </div>
             <CreditCard className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10 rotate-12 scale-150 translate-x-5 sm:translate-x-10 -translate-y-5 sm:-translate-y-10" />
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-zinc-950/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Plataforma / Banco</Label>
                <Input 
                  name="name" 
                  defaultValue={editingMethod?.name} 
                  required 
                  placeholder="Ej: Binance, PayPal, BCP..." 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 text-base font-bold shadow-sm" 
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end ml-1">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80">País o Región</Label>
                  {selectedCountry === 'Otro' && (
                    <button 
                      type="button" 
                      onClick={() => setSelectedCountry('Global')} 
                      className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                      Volver a lista
                    </button>
                  )}
                </div>
                {selectedCountry === 'Otro' ? (
                  <Input 
                    name="country" 
                    required 
                    autoFocus
                    placeholder="Escribe el país manualmente..." 
                    className="h-14 rounded-2xl bg-white/5 border-primary/30 text-base font-bold animate-in fade-in slide-in-from-top-1" 
                  />
                ) : (
                  <Select 
                    name="country" 
                    value={selectedCountry} 
                    onValueChange={(val) => setSelectedCountry(val || 'Global')}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-base font-bold">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10 bg-zinc-900/98 backdrop-blur-2xl">
                      <SelectItem value="Global">🌎 Global / Internacional</SelectItem>
                      <SelectItem value="Perú">🇵🇪 Perú</SelectItem>
                      <SelectItem value="Colombia">🇨🇴 Colombia</SelectItem>
                      <SelectItem value="Ecuador">🇪🇨 Ecuador</SelectItem>
                      <SelectItem value="México">🇲🇽 México</SelectItem>
                      <SelectItem value="España">🇪🇸 España</SelectItem>
                      <SelectItem value="Chile">🇨🇱 Chile</SelectItem>
                      <SelectItem value="Argentina">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="Bolivia">🇧🇴 Bolivia</SelectItem>
                      <SelectItem value="USA">🇺🇸 Estados Unidos</SelectItem>
                      <SelectItem value="Otro">➕ Otro (Escribir nombre)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Categoría de Cobro</Label>
                <Select name="type" defaultValue={editingMethod?.type || 'bank_transfer'}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-base font-bold uppercase tracking-tighter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10 bg-zinc-900/98 backdrop-blur-2xl">
                    <SelectItem value="bank_transfer">
                       <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-500" />
                          <span>Banco / Transferencia</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="digital_wallet">
                       <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-500" />
                          <span>Billetera (Yape, Nequi...)</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="crypto">
                       <div className="flex items-center gap-2">
                          <Bitcoin className="w-4 h-4 text-orange-500" />
                          <span>Cripto (Binance, USDT...)</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="online_gateway">
                       <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-indigo-500" />
                          <span>Pasarela (PayPal, MP...)</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="other">
                       <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-zinc-500" />
                          <span>Otro Método</span>
                       </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Titular / Dueño</Label>
                <Input 
                  name="owner_name" 
                  defaultValue={editingMethod?.owner_name} 
                  required 
                  placeholder="Nombre o Alias" 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 text-base font-bold" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Información de Recepción (Cuenta, ID o Correo)</Label>
              <div className="relative group">
                <Input 
                  name="details" 
                  defaultValue={editingMethod?.details} 
                  required 
                  placeholder="N° Cuenta / 0x... / correo@paypal.com" 
                  className="h-16 rounded-2xl bg-white/5 border-white/10 text-2xl font-black text-primary font-mono focus:ring-2 ring-primary/20 transition-all text-center placeholder:text-sm placeholder:font-sans placeholder:font-medium placeholder:opacity-30" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row-reverse gap-3 sm:gap-4 pt-4 sm:pt-6 w-full">
              <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full sm:flex-[2] premium-gradient h-14 rounded-2xl font-black text-white shadow-xl shadow-primary/20 uppercase text-[11px] sm:text-xs tracking-[0.2em]"
              >
                {isPending ? 'Guardando...' : editingMethod ? 'Confirmar Edición' : 'Registrar Método'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full sm:flex-1 font-bold h-14 rounded-2xl hover:bg-white/5" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="glass-card border-none max-w-sm rounded-[2rem] p-8">
           <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                 <Trash2 className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                 <DialogTitle className="text-2xl font-black">¿Eliminar método?</DialogTitle>
                 <DialogDescription className="text-muted-foreground font-medium mt-2">
                   Esta acción es irreversible. El método dejará de estar disponible para todos los administradores.
                 </DialogDescription>
              </div>
              <div className="flex gap-3 w-full">
                 <Button variant="ghost" className="flex-1 font-bold h-12 rounded-2xl" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                 <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700 font-black h-12 rounded-2xl shadow-lg shadow-red-500/20" onClick={handleDelete} disabled={isPending}>
                    {isPending ? 'Eliminando...' : 'Sí, Eliminar'}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
