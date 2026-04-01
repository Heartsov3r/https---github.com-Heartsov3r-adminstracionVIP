'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { ClientDateTime } from '@/components/ui/client-datetime'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { registerDonation, deleteDonation } from './actions'
import { Search, Heart, Plus, Paperclip, Wallet, Trash2, X, Eye, Image as ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 20

export default function DonationsTable({ 
  donations, 
  users, 
  paymentMethods, 
  currentAdmin 
}: { 
  donations: any[], 
  users: any[], 
  paymentMethods: any[], 
  currentAdmin: any 
}) {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  const [donorType, setDonorType] = useState<'registered' | 'external'>('registered')

  // Filtering
  const filteredDonations = useMemo(() => {
    if (!searchTerm) return donations
    return donations.filter((d: any) => {
      const donorName = d.profiles?.full_name || d.donor_name || ''
      return donorName.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [donations, searchTerm])

  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE)
  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDonations.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDonations, currentPage])

  React.useEffect(() => { setCurrentPage(1) }, [searchTerm])

  // Handlers
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!uploadFile) {
        toast.error('Debes adjuntar un comprobante obligatorio')
        return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('file', uploadFile)

    startTransition(async () => {
      const { success, error } = await registerDonation(formData)
      if (error) {
        toast.error(error)
      } else {
        toast.success("¡Donación Registrada!")
        setIsRegisterOpen(false)
        setUploadFile(null)
      }
    })
  }

  const handleDelete = () => {
    if (!deleteReason || !deletingId) {
        toast.error('El motivo de eliminación es obligatorio')
        return
    }

    startTransition(async () => {
        const { success, error } = await deleteDonation(deletingId, deleteReason)
        if (error) {
            toast.error(error)
        } else {
            toast.success("Donación anulada correctamente")
            setDeletingId(null)
            setDeleteReason('')
        }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setUploadFile(e.target.files[0])
    } else {
        setUploadFile(null)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
         {/* Buscador */}
         <div className="relative group w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder="Buscar por nombre..." 
                className="pl-12 h-14 bg-white/5 border-white/5 rounded-2xl shadow-xl focus:border-primary/50 text-base font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Btn Nuevo */}
         <Button 
            className="premium-gradient h-14 rounded-2xl px-6 font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => setIsRegisterOpen(true)}
         >
             <Plus className="w-5 h-5 mr-2" />
             Registrar Donación
         </Button>
      </div>

      <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl overflow-hidden mt-6 animate-in slide-in-from-bottom-4 duration-500">
         <div className="overflow-x-auto">
             <Table className="min-w-[800px]">
                 <TableHeader className="bg-muted/30">
                     <TableRow className="border-white/5 hover:bg-transparent">
                         <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Donación N°</TableHead>
                         <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Contribuyente</TableHead>
                         <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Finanzas</TableHead>
                         <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Motivo & Admin</TableHead>
                         <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Acciones</TableHead>
                     </TableRow>
                 </TableHeader>
                 <TableBody>
                     {paginatedDonations.map(d => {
                        const name = d.profiles?.full_name || d.donor_name || 'Anónimo'
                        const email = d.profiles?.email || ''
                        
                        return (
                          <TableRow key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                              <TableCell className="py-5 px-6">
                                  <div className="flex flex-col gap-1">
                                      <span className="font-bold text-xs">#{d.id.substring(0,8)}</span>
                                      <span className="text-[10px] font-black uppercase text-muted-foreground opacity-70">
                                         <ClientDateTime date={d.donation_date} options={{ day: '2-digit', month: 'short', year: 'numeric' }} />
                                      </span>
                                  </div>
                              </TableCell>
                              <TableCell className="py-5 px-6">
                                  <div className="flex items-center gap-3">
                                      <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                                         <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                                         <AvatarFallback><Heart className="w-4 h-4 text-primary" fill="currentColor"/></AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                          <span className="font-bold text-sm text-foreground">{name}</span>
                                          {email ? <span className="text-[10px] text-muted-foreground font-medium">{email}</span> : <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Externo</span>}
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell className="py-5 px-6">
                                  <div className="flex flex-col">
                                      <span className="text-xl font-black text-emerald-400 tracking-tighter">${Number(d.amount).toFixed(2)}</span>
                                      {d.payment_methods && (
                                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Wallet className="w-3 h-3" /> {d.payment_methods.name}
                                         </div>
                                      )}
                                  </div>
                              </TableCell>
                              <TableCell className="py-5 px-6 max-w-[200px]">
                                  <div className="flex flex-col gap-1.5">
                                      <p className="text-xs text-foreground font-medium truncate" title={d.reason}>{d.reason}</p>
                                      <Badge variant="outline" className="w-fit text-[9px] font-bold uppercase border-white/10 opacity-70">
                                         Reg: {d.registered_by_admin?.full_name || 'Sistema'}
                                      </Badge>
                                  </div>
                              </TableCell>
                              <TableCell className="py-5 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2 text-right">
                                    {d.receipt_url && (
                                        <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-primary/10 text-primary font-bold text-xs" onClick={() => setPreviewFileUrl(d.receipt_url)}>
                                            <Eye className="w-4 h-4 mr-2" /> Comprobante
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-red-500" onClick={() => setDeletingId(d.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                              </TableCell>
                          </TableRow>
                        )
                     })}
                     {paginatedDonations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium bg-muted/10">
                               <div className="flex flex-col items-center gap-2 opacity-50">
                                  {searchTerm ? <Search className="w-12 h-12" /> : <Heart className="w-12 h-12" />}
                                  {searchTerm ? `No se encontraron donantes para "${searchTerm}"` : 'Aún no se han registrado donaciones.'}
                               </div>
                            </TableCell>
                        </TableRow>
                     )}
                 </TableBody>
             </Table>
         </div>

         {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
         )}
      </div>

      {/* MODAL REGISTRO */}
      <Dialog open={isRegisterOpen} onOpenChange={(o) => { if (!o) { setIsRegisterOpen(false); setUploadFile(null); } }}>
         <DialogContent className="glass-card max-w-lg p-0 border-none ring-1 ring-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="premium-gradient p-8 text-white">
                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-white" fill="currentColor"/>
                 </div>
                 <DialogTitle className="text-2xl font-black">Añadir Donación</DialogTitle>
                 <p className="text-white/80 text-sm font-medium">Registra un ingreso voluntario (Obligatorio motivo y comprobante).</p>
             </div>
             <form onSubmit={handleRegister} className="p-8 space-y-6">
                 
                 <div className="p-1.5 bg-white/5 rounded-2xl flex border border-white/5">
                     <button type="button" onClick={() => setDonorType('registered')} className={`flex-1 h-10 rounded-xl text-xs font-bold uppercase transition-all ${donorType === 'registered' ? 'bg-white text-black shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}>Usuario Web</button>
                     <button type="button" onClick={() => setDonorType('external')} className={`flex-1 h-10 rounded-xl text-xs font-bold uppercase transition-all ${donorType === 'external' ? 'bg-white text-black shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}>Externo</button>
                 </div>

                 {donorType === 'registered' ? (
                     <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Buscar Cliente</Label>
                        <Select name="donorId">
                            <SelectTrigger className="h-12 bg-white/5 rounded-xl border-white/10 font-bold"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                {users.map((u: any) => (
                                    <SelectItem key={u.id} value={u.id} className="font-bold">{u.full_name} ({u.email})</SelectItem>
                                ))}
                                <SelectItem value="none" className="font-bold text-muted-foreground">Anónimo / Sin Identificar</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                 ) : (
                    <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nombre del Donante (Opcional)</Label>
                        <Input name="donorName" placeholder="Ej: John Doe" className="h-12 bg-white/5 rounded-xl border-white/10 font-bold text-foreground" />
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Monto (USD)</Label>
                         <Input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className="h-14 bg-white/5 rounded-2xl text-xl font-black text-emerald-400 text-center border-white/10" />
                     </div>
                     <div className="grid gap-2">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Medio de Pago</Label>
                         <Select name="paymentMethodId" defaultValue="none">
                            <SelectTrigger className="h-14 bg-white/5 rounded-2xl border-white/10 font-bold uppercase text-xs"><SelectValue placeholder="Medio" /></SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                <SelectItem value="none" className="font-bold underline">-- Otro / No Definido --</SelectItem>
                                {paymentMethods.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id} className="font-bold uppercase text-[10px]">{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                     </div>
                 </div>

                 <div className="grid gap-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Motivo de Transparencia <span className="text-red-500">*</span></Label>
                     <Textarea name="reason" required placeholder="Ej: Donación para servidores de mayo..." className="bg-white/5 border-white/10 rounded-xl min-h-[80px] resize-none text-xs" />
                 </div>

                 <div className="grid gap-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Comprobante / Captura <span className="text-red-500">*</span></Label>
                     <div className="relative border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/[0.02] hover:bg-primary/5 transition-all rounded-2xl p-6 text-center cursor-pointer">
                         <Input type="file" accept="image/*,.pdf" onChange={handleFileChange} required className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                         <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                         <span className="text-xs font-bold font-foreground">{uploadFile ? uploadFile.name : 'Haz clic para seleccionar el comprobante...'}</span>
                     </div>
                 </div>

                 <div className="flex gap-3 pt-2">
                     <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl border border-white/5" onClick={() => setIsRegisterOpen(false)}>Cancelar</Button>
                     <Button type="submit" className="flex-1 premium-gradient text-white font-black h-12 rounded-xl shadow-xl shadow-primary/20" disabled={isPending || !uploadFile}>
                         {isPending ? 'Validando...' : 'Confirmar Ingreso'}
                     </Button>
                 </div>
             </form>
         </DialogContent>
      </Dialog>

      {/* MODAL ELIMINAR */}
      <Dialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null) }}>
         <DialogContent className="glass-card border-none max-w-sm rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl">
             <div className="bg-red-500 p-8 text-white relative text-center">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <DialogTitle className="text-2xl font-black tracking-tighter">Anular Donación</DialogTitle>
                <p className="text-xs font-medium opacity-80 mt-2">Esta acción borrará el dinero del historial contable permanentemente.</p>
             </div>
             <div className="p-8 space-y-6">
                 <div className="grid gap-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Motivo de anulación <span className="text-red-500">*</span></Label>
                     <Textarea 
                        placeholder="Audit log: Ingresa por qué anulas esto..." 
                        value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} required 
                        className="bg-black/20 border-white/10 text-xs min-h-[80px]"
                     />
                 </div>
                 <div className="flex gap-3">
                     <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold bg-white/5" onClick={() => setDeletingId(null)}>Mantener</Button>
                     <Button variant="destructive" className="flex-1 h-12 rounded-xl font-black bg-red-600 hover:bg-red-500 shadow-xl shadow-red-500/20" onClick={handleDelete} disabled={isPending}>Eliminar</Button>
                 </div>
             </div>
         </DialogContent>
      </Dialog>

      {/* MODAL FILE PREVIEW */}
      <Dialog open={!!previewFileUrl} onOpenChange={(o) => { if (!o) setPreviewFileUrl(null) }}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 bg-black/90 border-none rounded-[2rem] overflow-hidden shadow-3xl max-h-[90vh]">
              <div className="relative flex items-center justify-center p-4 h-full">
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full hover:bg-black/80" onClick={() => setPreviewFileUrl(null)}>
                      <X className="w-5 h-5" />
                  </Button>
                  {previewFileUrl?.toLowerCase().endsWith('.pdf') ? (
                      <iframe src={previewFileUrl} className="w-full h-[75vh] rounded-2xl" title="Comprobante de Donación" />
                  ) : (
                      <img src={previewFileUrl || ''} className="max-w-full max-h-[80vh] object-contain rounded-2xl" alt="Comprobante" />
                  )}
              </div>
          </DialogContent>
      </Dialog>
    </>
  )
}
