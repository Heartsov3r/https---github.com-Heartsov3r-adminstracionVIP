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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { registerPayment } from './actions'
import { CreditCard, History, Paperclip, FileText, Image as ImageIcon, Wallet, ArrowUpRight, CheckCircle2, AlertCircle, Clock, MessageCircle, RefreshCw, Filter, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaginationControls } from '@/components/ui/pagination-controls'

const ITEMS_PER_PAGE = 20

export default function PaymentsTable({ memberships }: { memberships: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [paymentMembership, setPaymentMembership] = useState<any | null>(null)
  const [detailsMembership, setDetailsMembership] = useState<any | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'pending' | 'free'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastAmount, setLastAmount] = useState('0.00')

  const allFilteredMemberships = useMemo(() => {
    return memberships.filter(m => {
      if (filterStatus === 'all') return true
      
      const plan = m.plans
      const expectedTotal = plan?.price || 0
      const totalPaid = m.manual_payments ? m.manual_payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0) : 0
      
      if (filterStatus === 'free') return expectedTotal === 0
      if (filterStatus === 'paid') return expectedTotal > 0 && totalPaid >= expectedTotal
      if (filterStatus === 'partial') return expectedTotal > 0 && totalPaid > 0 && totalPaid < expectedTotal
      if (filterStatus === 'pending') return expectedTotal > 0 && totalPaid === 0
      
      return true
    })
  }, [memberships, filterStatus])

  const totalPages = Math.ceil(allFilteredMemberships.length / ITEMS_PER_PAGE)
  
  const paginatedMemberships = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return allFilteredMemberships.slice(start, start + ITEMS_PER_PAGE)
  }, [allFilteredMemberships, currentPage])

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  const handleRegisterPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!paymentMembership) return
    const formData = new FormData(e.currentTarget)
    const amount = formData.get('amount') as string
    setLastAmount(amount)
    formData.append('membershipId', paymentMembership.id)
    if (uploadFile) {
        formData.append('file', uploadFile)
    }

    startTransition(async () => {
      const { error } = await registerPayment(formData)
      if (error) {
        alert(error)
      } else {
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            setPaymentMembership(null)
            setUploadFile(null)
        }, 2500)
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
      <div className="space-y-4">
        {/* FILTRO DE ESTADO */}
        <div className="flex items-center gap-3">
          <div className="glass-card flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/5 bg-white/5 shadow-xl">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mr-2">Filtrar por:</span>
            <Select value={filterStatus} onValueChange={(val: string | null) => setFilterStatus((val as any) || 'all')}>
              <SelectTrigger className="h-8 w-[140px] bg-transparent border-none focus:ring-0 text-xs font-bold uppercase p-0">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10 bg-zinc-900/95 backdrop-blur-xl">
                <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest">Todos</SelectItem>
                <SelectItem value="paid" className="text-xs font-bold uppercase tracking-widest text-emerald-500">Pagados</SelectItem>
                <SelectItem value="partial" className="text-xs font-bold uppercase tracking-widest text-amber-500">Parciales</SelectItem>
                <SelectItem value="pending" className="text-xs font-bold uppercase tracking-widest text-red-500">Pendientes</SelectItem>
                <SelectItem value="free" className="text-xs font-bold uppercase tracking-widest text-blue-500">Gratuitos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
            {allFilteredMemberships.length} registros encontrados
          </span>
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="py-4 px-3 sm:py-6 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground italic">Asignación</TableHead>
                <TableHead className="py-4 px-3 sm:py-6 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Cliente</TableHead>
                <TableHead className="py-4 px-3 sm:py-6 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Plan</TableHead>
                <TableHead className="py-4 px-3 sm:py-6 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Finanzas</TableHead>
                <TableHead className="py-4 px-3 sm:py-6 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Estado</TableHead>
                <TableHead className="py-4 px-3 sm:py-6 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMemberships.map((membership) => {
                 const user = membership.profiles
                 const plan = membership.plans as any
                 
                 const expectedTotal = plan?.price || 0
                 const totalPaid = membership.manual_payments ? membership.manual_payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0) : 0
                 
                 let statusContent = null
                 if (expectedTotal === 0 && plan) {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase">
                           Gratuito
                        </div>
                     )
                 } else if (totalPaid === 0) {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 text-[10px] font-black uppercase">
                           <AlertCircle className="w-3 h-3" /> Pendiente
                        </div>
                     )
                 } else if (totalPaid < expectedTotal) {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-[10px] font-black uppercase">
                           <Clock className="w-3 h-3" /> Parcial
                        </div>
                     )
                 } else {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase">
                           <CheckCircle2 className="w-3 h-3" /> Pagado
                        </div>
                     )
                 }

                 return (
                   <TableRow key={membership.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                     <TableCell className="py-5 px-6">
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-foreground uppercase tracking-tight">
                              <ClientDateTime date={membership.created_at} options={{ day: '2-digit', month: 'short', year: 'numeric' }} />
                           </span>
                           <span className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                              vence <ClientDateTime date={membership.end_date} options={{ day: '2-digit', month: '2-digit', year: '2-digit' }} />
                           </span>
                        </div>
                     </TableCell>
                     <TableCell className="py-5 px-6">
                        {user ? (
                           <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group/link">
                              <Avatar className="w-9 h-9 border border-white/10">
                                 <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                 <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                 <span className="font-bold text-sm group-hover:text-primary transition-colors">{user.full_name}</span>
                                 <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
                              </div>
                           </Link>
                        ) : (
                           <span className="text-xs text-muted-foreground italic">Usuario no disponible</span>
                        )}
                     </TableCell>
                     <TableCell className="py-5 px-6">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Wallet className="w-4 h-4" />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-tighter">
                              {plan?.name || "Premium"}
                           </span>
                        </div>
                     </TableCell>
                     <TableCell className="py-5 px-6">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-1.5 font-black text-sm tracking-tight">
                              <span className="text-muted-foreground opacity-40">$</span>{totalPaid.toFixed(2)}
                              <span className="text-[10px] text-muted-foreground font-medium opacity-50">/ {expectedTotal.toFixed(2)}</span>
                              {membership.manual_payments?.some((p: any) => p.payment_receipts?.length > 0) && (
                                 <Paperclip className="w-3.5 h-3.5 text-blue-500 ml-1" />
                              )}
                           </div>
                           <div className="w-24 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                 className="h-full bg-primary transition-all duration-1000" 
                                 style={{ width: `${Math.min(100, (totalPaid / expectedTotal) * 100)}%` }}
                               />
                           </div>
                        </div>
                     </TableCell>
                     <TableCell className="py-5 px-6">
                        {statusContent}
                     </TableCell>
                     <TableCell className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          <Button 
                             variant="ghost" 
                             size="sm"
                             className="rounded-xl h-9 hover:bg-white/5 font-bold text-xs gap-1.5"
                             onClick={() => setDetailsMembership(membership)}
                             disabled={membership.manual_payments?.length === 0}
                          >
                             <History className="h-3.5 w-3.5 opacity-50"/> Historial
                          </Button>
                          
                          {expectedTotal > 0 && totalPaid < expectedTotal && (
                            <>
                              {user?.phone && (
                                <a
                                  href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${user.full_name}, te recordamos que tienes un saldo pendiente de $${(expectedTotal - totalPaid).toFixed(2)} en tu membresía ${plan?.name || 'VIP'}. ¿Podemos coordinar el pago?`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Button 
                                     variant="ghost" 
                                     size="sm"
                                     className="rounded-xl h-9 hover:bg-[#25D366]/10 text-[#25D366] font-bold text-xs gap-1.5"
                                     type="button"
                                  >
                                     <MessageCircle className="h-3.5 w-3.5"/> WA
                                  </Button>
                                </a>
                              )}
                              <Button 
                                 variant="default" 
                                 size="sm"
                                 className="accent-gradient-blue rounded-xl h-9 font-black text-xs gap-1.5 shadow-lg shadow-blue-500/20"
                                 onClick={() => setPaymentMembership(membership)}
                              >
                                 <CreditCard className="h-3.5 w-3.5"/> Cobrar
                              </Button>
                            </>
                          )}

                          {expectedTotal > 0 && totalPaid >= expectedTotal && (
                            <Link href={`/admin/users/${user?.id}`}>
                              <Button 
                                 variant="ghost" 
                                 size="sm"
                                 className="rounded-xl h-9 hover:bg-primary/10 text-primary font-bold text-xs gap-1.5"
                              >
                                 <RefreshCw className="h-3.5 w-3.5"/> Renovar
                              </Button>
                            </Link>
                          )}
                        </div>
                     </TableCell>
                   </TableRow>
                 )
              })}
              {paginatedMemberships.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground opacity-50">
                       <div className="flex flex-col items-center gap-3">
                          <Wallet className="w-12 h-12" />
                          <p className="font-bold text-sm tracking-tight italic">No hay registros que coincidan con este filtro.</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
          </div>

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

      {/* Modal: Registrar Pago Nuevo */}
      <Dialog open={!!paymentMembership} onOpenChange={(o) => { if (!o && !showSuccess) { setPaymentMembership(null); setUploadFile(null); } }}>
        <DialogContent className="glass-card border-none max-w-[95vw] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
          {showSuccess ? (
            <div className="p-12 text-center animate-in zoom-in duration-500 flex flex-col items-center gap-6">
               <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 relative">
                  <CheckCircle2 className="w-12 h-12 animate-bounce" />
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-500 animate-pulse" />
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2">¡Pago Registrado!</h2>
                  <p className="text-muted-foreground font-medium">Se han abonado <span className="text-emerald-500 font-black">${lastAmount}</span> correctamente a la cuenta del cliente.</p>
               </div>
               <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-progress duration-[2500ms]" />
               </div>
            </div>
          ) : (
            <>
              <div className="accent-gradient-blue p-5 sm:p-8 text-white relative">
                 <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                       <CreditCard className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                       <DialogTitle className="text-xl sm:text-2xl font-black">Registrar Cobro</DialogTitle>
                       <p className="text-white/70 text-xs sm:text-sm font-medium">Abono a cuenta del plan activo</p>
                    </div>
                 </div>
                 <ArrowUpRight className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10 rotate-12 scale-125" />
              </div>

              {paymentMembership && (
              <form onSubmit={handleRegisterPayment} className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                       <span>Saldo Pendiente</span>
                       <span>Membresía</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-3xl font-black text-red-500 tracking-tighter">
                         ${Math.max(0, (paymentMembership.plans?.price || 0) - (paymentMembership.manual_payments?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) || 0)).toFixed(2)}
                       </span>
                       <span className="text-sm font-bold text-foreground">{paymentMembership.plans?.name || 'Manual'}</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid gap-2">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Monto a Recibir ($ USD)</Label>
                       <Input type="number" step="0.01" min="0.01" name="amount" required placeholder="0.00" className="h-14 bg-white/5 border-white/10 rounded-2xl text-2xl font-black text-center text-primary" />
                    </div>
                    
                    <div className="grid gap-2">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Notas Administrativas</Label>
                       <Textarea name="notes" placeholder="Ej: Pago en efectivo sede central..." rows={2} className="bg-white/5 border-white/10 rounded-xl resize-none font-medium h-24" />
                    </div>

                    <div className="grid gap-2">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Comprobante de Pago</Label>
                       <div className="relative group">
                          <Input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 group-hover:border-primary group-hover:bg-primary/5 transition-all">
                             <Paperclip className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                             <span className="text-xs font-bold text-muted-foreground">{uploadFile ? uploadFile.name : 'Subir Imagen o PDF'}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 sm:gap-4 pt-2">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-11 sm:h-12 rounded-xl text-sm" onClick={() => setPaymentMembership(null)}>Cancelar</Button>
                    <Button type="submit" className="flex-1 accent-gradient-blue h-11 sm:h-12 rounded-xl font-black shadow-lg shadow-blue-500/25 text-white text-sm" disabled={isPending}>
                       {isPending ? 'Procesando...' : 'Confirmar Cobro'}
                    </Button>
                 </div>
              </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Detalles y Comprobantes (Historial) */}
      <Dialog open={!!detailsMembership} onOpenChange={(o) => { if (!o) setDetailsMembership(null) }}>
        <DialogContent className="glass-card border-none max-w-[95vw] sm:max-w-lg rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl max-h-[90vh]">
          <div className="bg-muted/30 p-5 sm:p-8 border-b border-white/5">
             <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground shrink-0">
                   <History className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                   <DialogTitle className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">Cronología de Pagos</DialogTitle>
                   <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">Registro histórico de ingresos</p>
                </div>
             </div>
          </div>

          <div className="p-4 sm:p-8 max-h-[60vh] overflow-y-auto scrollbar-thin space-y-4 sm:space-y-6">
            {detailsMembership && (
               <div className="space-y-4">
                  {detailsMembership.manual_payments?.sort((a:any, b:any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).map((p: any) => (
                      <div key={p.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 relative group transition-all hover:bg-white/[0.07]">
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col">
                                  <div className="text-2xl font-black tracking-tighter text-emerald-500">${Number(p.amount).toFixed(2)}</div>
                                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">
                                      <ClientDateTime 
                                        date={p.payment_date} 
                                        options={{ day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }} 
                                      />
                                  </div>
                              </div>
                              <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-tighter ring-1 ring-emerald-500/20">
                                 Verificado
                              </div>
                          </div>
                          
                          {p.notes && (
                              <div className="text-xs italic text-muted-foreground/80 bg-black/20 p-3 rounded-xl border border-white/5 mb-4 font-medium">
                                 "{p.notes}"
                              </div>
                          )}

                          {p.payment_receipts && p.payment_receipts.length > 0 && (
                              <div className="border-t border-white/5 pt-4">
                                  <a 
                                     href={p.payment_receipts[0].file_url} 
                                     target="_blank" 
                                     rel="noreferrer" 
                                     className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-widest text-primary hover:text-white group-hover:translate-x-1 transition-all"
                                  >
                                      <div className="flex items-center gap-2">
                                         {p.payment_receipts[0].file_url.endsWith('.pdf') ? <FileText className="h-4 w-4 text-red-500" /> : <ImageIcon className="h-4 w-4 text-blue-500" />}
                                         Explorar Comprobante
                                      </div>
                                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                              </div>
                          )}
                      </div>
                  ))}
               </div>
            )}
          </div>

          <div className="p-6 bg-muted/10 border-t border-white/5 text-center">
             <Button variant="ghost" className="font-bold text-muted-foreground text-xs uppercase" onClick={() => setDetailsMembership(null)}>
                Finalizar Revisión
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
