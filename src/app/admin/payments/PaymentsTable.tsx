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
import { registerPayment, updatePayment, deletePayment } from './actions'
import { renewMembership } from '../users/actions'
import { CreditCard, History, Paperclip, FileText, Image as ImageIcon, Wallet, ArrowUpRight, CheckCircle2, AlertCircle, Clock, MessageCircle, RefreshCw, Filter, Sparkles, Download, Share2, Calendar, Pencil, Trash2, X, Eye } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { PaymentTicket } from './PaymentTicket'
import { generateReceiptPDF } from './pdf-utils'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'

const ITEMS_PER_PAGE = 20

export default function PaymentsTable({ memberships, currentAdmin, paymentMethods = [], plans = [] }: { memberships: any[], currentAdmin?: any, paymentMethods?: any[], plans?: any[] }) {
  const [isPending, startTransitionLocal] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [paymentMembership, setPaymentMembership] = useState<any | null>(null)
  const [detailsMembership, setDetailsMembership] = useState<any | null>(null)
  const [renewalMembership, setRenewalMembership] = useState<any | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'pending' | 'free'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastPaymentData, setLastPaymentData] = useState<any | null>(null)
  const [editingPayment, setEditingPayment] = useState<any | null>(null)
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)
  const [correctionReason, setCorrectionReason] = useState('')
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null)
  const [paymentAmountAlert, setPaymentAmountAlert] = useState<string | null>(null)
  const ticketRef = React.useRef<HTMLDivElement>(null)
  const supabase = createClient()

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
    const amountStr = formData.get('amount') as string
    const amount = parseFloat(amountStr)

    // Tip: Validación de Sobrepago
    const planPrice = parseFloat(paymentMembership.plans?.price || '0')
    const totalPaidPrevious = paymentMembership.manual_payments ? paymentMembership.manual_payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0) : 0
    const remainingBefore = planPrice - totalPaidPrevious

    if (amount > remainingBefore && !paymentAmountAlert) {
      setPaymentAmountAlert(`Estás cobrando $${amount.toFixed(2)} a una deuda de $${remainingBefore.toFixed(2)}. ¿Deseas continuar?`)
      return
    }
    
    formData.append('membershipId', paymentMembership.id)
    if (uploadFile) {
        formData.append('file', uploadFile)
    }

    startTransitionLocal(async () => {
      const { success, error } = await registerPayment(formData)
      if (error) {
        toast.error(error)
      } else {
        const selectedMethodId = formData.get('paymentMethodId') as string
        const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId)
        const remainingBalance = Math.max(0, planPrice - (totalPaidPrevious + amount))

        setLastPaymentData({
          folio: Math.floor(100000 + Math.random() * 900000).toString(),
          customerName: paymentMembership.profiles?.full_name || 'Cliente',
          customerPhone: paymentMembership.profiles?.phone || '',
          planName: paymentMembership.plans?.name || 'Manual',
          planDays: paymentMembership.plans?.duration_days || 0,
          amount: amount,
          planPrice: planPrice,
          remainingBalance: remainingBalance,
          date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          adminName: currentAdmin?.full_name || 'Administrador',
          paymentMethod: selectedMethod ? {
            name: selectedMethod.name,
            details: selectedMethod.details,
            owner_name: selectedMethod.owner_name,
            type: selectedMethod.type
          } : null,
          companyName: 'MEMBRESÍAS VIP',
          companyRuc: '20123456789',
          companyAddress: 'Sede Central - Área VIP'
        })
        setShowSuccess(true)
        setPaymentMembership(null)
        setUploadFile(null)
        setPaymentAmountAlert(null)
        toast.success("Pago registrado correctamente")
      }
    })
  }

  const handleDeletePayment = async () => {
      if (!deletingPaymentId || !correctionReason) {
          toast.error("Debes especificar el motivo de eliminación")
          return
      }

      startTransitionLocal(async () => {
          const { success, error } = await deletePayment(deletingPaymentId, correctionReason)
          if (error) {
              toast.error(error)
          } else {
              toast.success("Pago eliminado del sistema")
              setDeletingPaymentId(null)
              setCorrectionReason('')
              setDetailsMembership(null)
          }
      })
  }

  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      formData.append('paymentId', editingPayment.id)
      formData.append('reason', correctionReason)

      startTransitionLocal(async () => {
          const { success, error } = await updatePayment(formData)
          if (error) {
              toast.error(error)
          } else {
              toast.success("Pago actualizado")
              setEditingPayment(null)
              setCorrectionReason('')
              setDetailsMembership(null)
          }
      })
  }

  const handleDownloadPDF = async () => {
    if (!lastPaymentData) return
    const doc = await generateReceiptPDF(lastPaymentData)
    doc.save(`Boleta_${lastPaymentData.folio}.pdf`)
  }

  const handleShareWhatsApp = async () => {
    if (!lastPaymentData) return
    setIsUploading(true)
    try {
      const pdf = await generateReceiptPDF(lastPaymentData)
      const pdfBlob = pdf.output('blob')
      const file = new File([pdfBlob], `Boleta_VIP_${lastPaymentData.folio}.pdf`, { type: 'application/pdf' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Boleta Membresía VIP',
          text: `Hola ${lastPaymentData.customerName.split(' ')[0]}, aquí tienes tu boleta de pago.`
        })
      } else {
        const doc = await generateReceiptPDF(lastPaymentData)
        doc.save(`Boleta_${lastPaymentData.folio}.pdf`)
        const message = `Hola *${lastPaymentData.customerName.split(' ')[0]}*, adjunto tu boleta de pago de *Membresías VIP*.\n\n¡Sigue disfrutando de tu plan! 🚀`
        const phone = lastPaymentData.customerPhone.replace(/[^0-9]/g, '')
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
        alert("En PC, WhatsApp no permite enviar archivos automáticamente. Hemos descargado la boleta por ti; solo arrástrala a la ventana de chat que se acaba de abrir.")
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert("Error al compartir: " + err.message)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setUploadFile(e.target.files[0])
      } else {
          setUploadFile(null)
      }
  }

  const handleRenew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!renewalMembership) return
    const formData = new FormData(e.currentTarget)
    const planId = formData.get('planId') as string
    
    startTransitionLocal(async () => {
      const { success, error } = await renewMembership(renewalMembership.profiles.id, planId)
      if (error) {
        alert(error)
      } else {
        alert("¡Membresía renovada! Ahora puedes cobrar el nuevo periodo en la tabla de pagos.")
        setRenewalMembership(null)
      }
    })
  }

  return (
    <>
      <div className="space-y-4">
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
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase">Gratuito</div>
                     )
                 } else if (totalPaid === 0) {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 text-[10px] font-black uppercase"><AlertCircle className="w-3 h-3" /> Pendiente</div>
                     )
                 } else if (totalPaid < expectedTotal) {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-[10px] font-black uppercase"><Clock className="w-3 h-3" /> Parcial</div>
                     )
                 } else {
                     statusContent = (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase"><CheckCircle2 className="w-3 h-3" /> Pagado</div>
                     )
                 }

                 return (
                   <TableRow key={membership.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                     <TableCell className="py-5 px-6 font-black text-xs uppercase tracking-tight">
                        <div className="flex flex-col">
                           <ClientDateTime date={membership.created_at} options={{ day: '2-digit', month: 'short', year: 'numeric' }} />
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
                        ) : <span className="text-xs text-muted-foreground italic">No disponible</span>}
                     </TableCell>
                     <TableCell className="py-5 px-6 font-bold text-xs uppercase tracking-tighter">
                        <div className="flex items-center gap-2">
                           <Wallet className="w-4 h-4 text-primary" />
                           {plan?.name || "Premium"}
                        </div>
                     </TableCell>
                     <TableCell className="py-5 px-6">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-1.5 font-black text-sm tracking-tight">
                              <span className="opacity-40">$</span>{totalPaid.toFixed(2)}
                              <span className="text-[10px] opacity-50">/ {expectedTotal.toFixed(2)}</span>
                               {membership.manual_payments?.some((p: any) => p.payment_receipts?.length > 0) && (
                                  <button 
                                    onClick={() => {
                                      const paymentWithReceipt = membership.manual_payments.find((p: any) => p.payment_receipts?.length > 0);
                                      if (paymentWithReceipt) setPreviewFileUrl(paymentWithReceipt.payment_receipts[0].file_url);
                                    }}
                                    className="group/eye ml-1 p-1 hover:bg-primary/20 rounded-md transition-colors"
                                    title="Ver Comprobante Rápido"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-500 group-hover/eye:scale-110 transition-transform" />
                                  </button>
                               )}
                           </div>
                           <div className="w-24 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, (totalPaid / expectedTotal) * 100)}%` }} />
                           </div>
                        </div>
                     </TableCell>
                     <TableCell className="py-5 px-6">{statusContent}</TableCell>
                     <TableCell className="py-5 px-6 text-right flex justify-end gap-1.5">
                        <Button variant="ghost" size="sm" className="rounded-xl h-9 bg-white/5 border border-white/5 hover:bg-primary hover:text-white font-black text-[10px] uppercase gap-1.5 shadow-xl transition-all" onClick={() => setDetailsMembership(membership)} disabled={membership.manual_payments?.length === 0}><Pencil className="h-3 w-3 opacity-70"/> Gestionar Abonos</Button>
                        {expectedTotal > 0 && totalPaid < expectedTotal && (
                          <>
                            {user?.phone && (
                              <a href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${user.full_name}, tienes un saldo de $${(expectedTotal - totalPaid).toFixed(2)} en tu plan ${plan?.name || 'VIP'}.`)}`} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm" className="rounded-xl h-9 hover:bg-[#25D366]/10 text-[#25D366] font-bold text-xs gap-1.5"><MessageCircle className="h-3.5 w-3.5"/> WA</Button>
                              </a>
                            )}
                            <Button variant="default" size="sm" className="accent-gradient-blue rounded-xl h-9 font-black text-xs gap-1.5 shadow-lg shadow-blue-500/20" onClick={() => setPaymentMembership(membership)}><CreditCard className="h-3.5 w-3.5"/> Cobrar</Button>
                          </>
                        )}
                        {expectedTotal > 0 && totalPaid >= expectedTotal && (
                          <Button variant="ghost" size="sm" className="rounded-xl h-9 hover:bg-primary/10 text-primary font-bold text-xs gap-1.5" onClick={() => setRenewalMembership(membership)}><RefreshCw className="h-3.5 w-3.5"/> Renovar</Button>
                        )}
                     </TableCell>
                   </TableRow>
                 )
              })}
            </TableBody>
          </Table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
               <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>

      {/* MODAL: COBRAR */}
      <Dialog open={!!paymentMembership} onOpenChange={(o) => { if (!o) { setPaymentMembership(null); setUploadFile(null); } }}>
        <DialogContent className="glass-card border-none max-w-[95vw] sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="accent-gradient-blue p-8 text-white relative">
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                   <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black">Registrar Cobro</DialogTitle>
                   <p className="text-white/70 text-sm font-medium">Abono a cuenta del plan activo</p>
                </div>
             </div>
          </div>
          {paymentMembership && (
            <form onSubmit={handleRegisterPayment} className="p-8 space-y-8">
               <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60"><span>Saldo Pendiente</span></div>
                  <div className="text-3xl font-black text-red-500 tracking-tighter">
                    ${Math.max(0, (paymentMembership.plans?.price || 0) - (paymentMembership.manual_payments?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) || 0)).toFixed(2)}
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="grid gap-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Monto (USD)</Label>
                     <Input type="number" step="0.01" min="0.01" name="amount" required placeholder="0.00" className="h-14 bg-white/5 rounded-2xl text-2xl font-black text-center text-primary" />
                  </div>
                  <div className="grid gap-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Método de Pago</Label>
                     <Select name="paymentMethodId" required>
                       <SelectTrigger className="h-12 bg-white/5 rounded-xl uppercase text-[10px] font-bold"><SelectValue placeholder="Elegir método" /></SelectTrigger>
                       <SelectContent className="glass-card bg-zinc-900 border-white/10 text-white">
                         {paymentMethods.filter((m: any) => m.is_active).map((m: any) => (
                           <SelectItem key={m.id} value={m.id} className="text-[10px] font-bold uppercase">{m.name} - {m.details}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                  </div>
                  <div className="grid gap-2">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Comprobante</Label>
                     <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all">
                        <Input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                        <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <span className="text-xs font-bold text-muted-foreground">{uploadFile ? uploadFile.name : 'Subir imagen o PDF'}</span>
                     </div>
                  </div>
               </div>
               <div className="flex gap-4 pt-2">
                  <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl" onClick={() => { setPaymentMembership(null); setPaymentAmountAlert(null); }}>Cancelar</Button>
                  <Button type="submit" className={`flex-1 h-12 rounded-xl font-black text-white ${paymentAmountAlert ? 'bg-red-600 hover:bg-red-500' : 'accent-gradient-blue'}`} disabled={isPending || !uploadFile}>
                    {isPending ? 'Procesando...' : paymentAmountAlert ? 'SÍ, COBRAR' : 'Confirmar'}
                  </Button>
               </div>
               {paymentAmountAlert && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold animate-pulse text-center">{paymentAmountAlert}</div>}
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: ÉXITO */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="w-[95vw] max-w-[450px] p-0 bg-transparent border-none shadow-none focus:outline-none overflow-y-auto max-h-[95vh]">
          <div className="bg-zinc-900/95 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 flex flex-col items-center shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" /></div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter">¡Vendido!</h2>
            {lastPaymentData && (
              <div className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl my-4 sm:my-6 animate-in slide-in-from-bottom-4">
                <PaymentTicket ref={ticketRef} data={lastPaymentData} />
              </div>
            )}
            <div className="flex flex-col gap-3 w-full">
               <div className="grid grid-cols-2 gap-3 w-full">
                  <Button onClick={handleDownloadPDF} variant="outline" className="rounded-xl border-white/20 hover:bg-white/5 font-bold uppercase text-[10px] sm:text-xs h-12 text-white shadow-xl">Descargar</Button>
                  <Button onClick={handleShareWhatsApp} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black uppercase text-[10px] sm:text-xs h-12 text-white shadow-xl shadow-emerald-600/20">WhatsApp</Button>
               </div>
               <Button onClick={() => setShowSuccess(false)} variant="ghost" className="rounded-xl font-bold uppercase text-[10px] sm:text-xs h-10 sm:h-12 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                  Cerrar Ventana
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: HISTORIAL */}
      <Dialog open={!!detailsMembership} onOpenChange={(o) => { if (!o) setDetailsMembership(null) }}>
        <DialogContent className="glass-card border-none max-w-[95vw] sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl max-h-[90vh]">
          <div className="bg-muted/30 p-8 border-b border-white/5 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground"><History className="w-6 h-6" /></div>
             <div><DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Historial de Abonos</DialogTitle></div>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
            {detailsMembership?.manual_payments?.sort((a:any, b:any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).map((p: any) => (
              <div key={p.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 relative group hover:bg-white/[0.07] transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <div className="text-2xl font-black text-emerald-500">${Number(p.amount).toFixed(2)}</div>
                        <div className="text-[10px] text-muted-foreground font-black uppercase"><ClientDateTime date={p.payment_date} options={{ day: '2-digit', month: 'short', year: 'numeric' }} /></div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-white/10" onClick={() => { setEditingPayment(p); setCorrectionReason(''); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-red-500" onClick={() => { setDeletingPaymentId(p.id); setCorrectionReason(''); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
                {p.payment_methods && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    <Wallet className="w-4 h-4" /> {p.payment_methods.name} - {p.payment_methods.details}
                  </div>
                )}
                {p.payment_receipts?.[0] && (
                  <button onClick={() => setPreviewFileUrl(p.payment_receipts[0].file_url)} className="flex items-center justify-between w-full text-[10px] font-black uppercase text-primary hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Ver Comprobante</div>
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-white/5 text-center"><Button variant="ghost" onClick={() => setDetailsMembership(null)} className="font-bold text-xs uppercase opacity-50">Cerrar</Button></div>
        </DialogContent>
      </Dialog>

      {/* MODAL: RENOVAR */}
      <Dialog open={!!renewalMembership} onOpenChange={(o) => { if (!o) setRenewalMembership(null) }}>
        <DialogContent className="glass-card border-none max-w-md rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl">
          <div className="premium-gradient p-8 text-white flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0"><RefreshCw className="w-7 h-7 text-white animate-spin-slow" /></div>
            <div><DialogTitle className="text-2xl font-black">Renovar Plan</DialogTitle></div>
          </div>
          <form onSubmit={handleRenew} className="p-8 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <Avatar className="w-12 h-12"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${renewalMembership?.profiles?.email}`} /></Avatar>
                <div className="flex flex-col"><span className="font-bold">{renewalMembership?.profiles?.full_name}</span></div>
            </div>
            <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Elegir Plan</Label>
                <Select name="planId" defaultValue={renewalMembership?.plan_id} required>
                    <SelectTrigger className="h-14 bg-white/5 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-card bg-zinc-900">{plans.filter((p: any) => p.is_active).map((p: any) => (<SelectItem key={p.id} value={p.id} className="font-bold underline-offset-4">{p.name} - ${Number(p.price).toFixed(2)}</SelectItem>))}</SelectContent>
                </Select>
            </div>
            <div className="flex gap-4 pt-2">
                <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl" onClick={() => setRenewalMembership(null)}>Cerrar</Button>
                <Button type="submit" className="flex-[1.5] premium-gradient h-12 rounded-xl font-black text-white" disabled={isPending}>Confirmar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: PREVISUALIZAR */}
      <Dialog open={!!previewFileUrl} onOpenChange={(o) => { if (!o) setPreviewFileUrl(null) }}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 bg-black/90 border-none rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[85vh]">
              <div className="relative flex items-center justify-center p-4">
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full" onClick={() => setPreviewFileUrl(null)}><X className="w-5 h-5" /></Button>
                  {previewFileUrl?.endsWith('.pdf') ? <iframe src={previewFileUrl} className="w-full h-[70vh] rounded-2xl" title="Recibo" /> : <img src={previewFileUrl || ''} className="max-w-full rounded-2xl" alt="Recibo" />}
              </div>
          </DialogContent>
      </Dialog>

      {/* MODAL: EDITAR */}
      <Dialog open={!!editingPayment} onOpenChange={(o) => { if (!o) setEditingPayment(null) }}>
          <DialogContent className="glass-card border-none max-w-sm rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl">
              <div className="accent-gradient-blue p-6 text-white"><DialogTitle className="text-xl font-black">Editar Cobro</DialogTitle></div>
              <form onSubmit={handleUpdatePayment} className="p-6 space-y-6">
                  <div className="space-y-4">
                      <div className="grid gap-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nuevo Monto (USD)</Label><Input name="amount" type="number" step="0.01" defaultValue={editingPayment?.amount} required className="h-12 bg-white/5 rounded-xl font-black" /></div>
                      <div className="grid gap-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Método</Label><Select name="paymentMethodId" defaultValue={editingPayment?.payment_method_id} required><SelectTrigger className="h-12 bg-white/5 rounded-xl uppercase text-[10px] font-bold"><SelectValue /></SelectTrigger><SelectContent className="glass-card bg-zinc-900 border-white/10 text-white">{paymentMethods.map((m: any) => (<SelectItem key={m.id} value={m.id} className="text-[10px] font-bold uppercase">{m.name} - {m.details}</SelectItem>))}</SelectContent></Select></div>
                      <div className="grid gap-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Motivo (Auditoría)</Label><Textarea placeholder="Ej: Error de dedo..." className="bg-white/5 rounded-xl text-xs" value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} required /></div>
                  </div>
                  <div className="flex gap-2"><Button type="button" variant="ghost" className="flex-1 font-bold rounded-xl" onClick={() => setEditingPayment(null)}>Cerrar</Button><Button type="submit" className="flex-1 accent-gradient-blue rounded-xl font-black text-white" disabled={isPending}>Guardar</Button></div>
              </form>
          </DialogContent>
      </Dialog>

      {/* MODAL: ELIMINAR */}
      <Dialog open={!!deletingPaymentId} onOpenChange={(o) => { if (!o) setDeletingPaymentId(null) }}>
          <DialogContent className="glass-card border-none max-w-sm rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl">
              <div className="bg-red-500 p-6 text-white text-center"><Trash2 className="w-8 h-8 mx-auto mb-2" /><DialogTitle className="text-xl font-black">¿Eliminar Pago?</DialogTitle><p className="text-xs opacity-80">Se borrará también el archivo del servidor.</p></div>
              <div className="p-6 space-y-4">
                  <div className="grid gap-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Motivo Obligatorio</Label><Textarea placeholder="Ej: Pago de otro usuario..." className="bg-zinc-950 border-red-500/30 rounded-xl text-xs" value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} required /></div>
                  <div className="flex gap-2"><Button variant="ghost" className="flex-1 font-bold rounded-xl" onClick={() => setDeletingPaymentId(null)}>No</Button><Button variant="destructive" className="flex-1 rounded-xl font-black bg-red-600" onClick={handleDeletePayment} disabled={isPending}>ELIMINAR</Button></div>
              </div>
          </DialogContent>
      </Dialog>
    </>
  )
}
