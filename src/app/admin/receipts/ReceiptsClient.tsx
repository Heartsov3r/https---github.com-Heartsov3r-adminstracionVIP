'use client'

import React, { useState, useMemo } from 'react'
import { 
  FileText, 
  Image as ImageIcon, 
  Search, 
  Download, 
  Share2, 
  Eye, 
  MessageCircle, 
  Calendar, 
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Bitcoin,
  Smartphone,
  Globe2,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ClientDateTime } from '@/components/ui/client-datetime'
import { generateReceiptPDF } from '../payments/pdf-utils'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function ReceiptsClient({ initialReceipts, currentAdmin }: { initialReceipts: any[], currentAdmin?: any }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [tab, setTab] = useState<'admin' | 'client'>('admin')
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const filteredReceipts = useMemo(() => {
    return initialReceipts.filter(r => {
      const customerName = r.membership?.profile?.full_name || ''
      const planName = r.membership?.plan?.name || ''
      const search = searchTerm.toLowerCase()
      return customerName.toLowerCase().includes(search) || planName.toLowerCase().includes(search)
    })
  }, [initialReceipts, searchTerm])

  const handleViewBoleta = async (receipt: any) => {
    const boletaData = {
      folio: receipt.id.substring(0, 8).toUpperCase(),
      customerName: receipt.membership?.profile?.full_name || 'Cliente',
      customerPhone: receipt.membership?.profile?.phone || '',
      planName: receipt.membership?.plan?.name || 'Manual',
      planDays: receipt.membership?.plan?.duration_days || 0,
      amount: Number(receipt.amount),
      date: new Date(receipt.payment_date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      adminName: currentAdmin?.full_name || 'Administrador',
      notes: receipt.notes || '',
      paymentMethod: receipt.payment_method ? {
        name: receipt.payment_method.name,
        details: receipt.payment_method.details,
        owner_name: receipt.payment_method.owner_name,
        type: receipt.payment_method.type,
        country: receipt.payment_method.country
      } : null,
      companyName: 'MEMBRESÍAS VIP',
      companyRuc: '20123456789',
      companyAddress: 'Sede Central - Área VIP'
    }
    const doc = await generateReceiptPDF(boletaData)
    const pdfUrl = doc.output('bloburl')
    window.open(pdfUrl, '_blank')
  }

  const handleShareBoleta = async (receipt: any) => {
    const boletaData = {
      folio: receipt.id.substring(0, 8).toUpperCase(),
      customerName: receipt.membership?.profile?.full_name || 'Cliente',
      customerPhone: receipt.membership?.profile?.phone || '',
      planName: receipt.membership?.plan?.name || 'Manual',
      planDays: receipt.membership?.plan?.duration_days || 0,
      amount: Number(receipt.amount),
      date: new Date(receipt.payment_date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      adminName: currentAdmin?.full_name || 'Administrador',
      notes: receipt.notes || '',
      paymentMethod: receipt.payment_method ? {
        name: receipt.payment_method.name,
        details: receipt.payment_method.details,
        owner_name: receipt.payment_method.owner_name,
        type: receipt.payment_method.type,
        country: receipt.payment_method.country
      } : null,
      companyName: 'MEMBRESÍAS VIP',
      companyRuc: '20123456789',
      companyAddress: 'Sede Central - Área VIP'
    }

    const pdf = await generateReceiptPDF(boletaData)
    const pdfBlob = pdf.output('blob')
    const file = new File([pdfBlob], `Boleta_VIP_${boletaData.folio}.pdf`, { type: 'application/pdf' })

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Boleta Membresía VIP',
          text: `Hola ${boletaData.customerName.split(' ')[0]}, aquí tienes tu boleta de pago.`
        })
      } catch (err) {}
    } else {
      const phone = boletaData.customerPhone.replace(/[^0-9]/g, '')
      const message = `Hola *${boletaData.customerName.split(' ')[0]}*, adjunto tu boleta de pago de *Membresías VIP*. ✨`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
      pdf.save(`Boleta_${boletaData.folio}.pdf`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="w-full lg:w-auto">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
            <TabsTrigger value="admin" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest gap-2">
              <ImageIcon className="w-4 h-4" /> Comprobantes Admin
            </TabsTrigger>
            <TabsTrigger value="client" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest gap-2">
              <FileText className="w-4 h-4" /> Boletas Clientes
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative group w-full lg:max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <Input 
             placeholder="Buscar por cliente o plan..." 
             className="h-14 pl-12 rounded-2xl bg-white/5 border-white/5 focus:ring-primary/20 transition-all font-medium"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReceipts.map((receipt) => {
          const hasAdminReceipt = receipt.receipts && receipt.receipts.length > 0
          const customerName = receipt.membership?.profile?.full_name || 'Desconocido'
          const planName = receipt.membership?.plan?.name || 'Manual'
          
          if (tab === 'admin' && !hasAdminReceipt) return null

          return (
            <div key={receipt.id} className="glass-card group p-6 rounded-[2.5rem] bg-white/[0.02] border-white/5 hover:bg-white/[0.05] transition-all relative overflow-hidden flex flex-col justify-between h-auto min-h-[280px]">
              
              <div className="flex justify-between items-start mb-6">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter",
                          tab === 'admin' ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {tab === 'admin' ? 'Transferencia' : 'Boleta Digital'}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground opacity-40">#{receipt.id.substring(0, 6)}</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight leading-none group-hover:text-primary transition-colors">{customerName}</h3>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest opacity-60">
                       <CreditCard className="w-3 h-3" /> {planName}
                    </p>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-black text-foreground tracking-tighter">${Number(receipt.amount).toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase"><ClientDateTime date={receipt.payment_date} /></div>
                 </div>
              </div>

              {tab === 'admin' ? (
                /* VISTA ADMIN: FOTOS DE TRANSFERENCIA */
                <div className="flex-1 space-y-4">
                  <div className="aspect-video rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center group/img">
                    {hasAdminReceipt ? (
                       <>
                        <img 
                          src={receipt.receipts[0].file_url} 
                          alt="Comprobante" 
                          className="w-full h-full object-cover opacity-50 bg-neutral-900 blur-[2px] group-hover:blur-0 group-hover:opacity-100 transition-all duration-500"
                        />
                        <Button 
                          variant="secondary" 
                          className="absolute bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase text-[10px] tracking-widest rounded-xl gap-2 hover:bg-primary transition-all scale-90 group-hover/img:scale-100"
                          onClick={() => {
                            setSelectedReceipt(receipt)
                            setIsPreviewOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4" /> Previsualizar
                        </Button>
                       </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-20">
                         <ImageIcon className="w-8 h-8" />
                         <span className="text-[10px] font-black uppercase">Sin Archivo</span>
                      </div>
                    )}
                  </div>
                  {receipt.notes && (
                    <p className="text-[11px] text-muted-foreground italic font-medium line-clamp-2 px-1">"{receipt.notes}"</p>
                  )}
                </div>
              ) : (
                /* VISTA CLIENTE: BOLETAS GENERADAS */
                <div className="flex-1 space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Estado Digital</p>
                           <p className="text-xs font-black text-foreground uppercase tracking-tight">Recibo Verificado</p>
                        </div>
                     </div>
                     <ShieldCheck className="w-6 h-6 text-emerald-500/40" />
                  </div>
                  {receipt.payment_method && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        {receipt.payment_method.type === 'bank_transfer' && <CreditCard className="w-4 h-4" />}
                        {receipt.payment_method.type === 'digital_wallet' && <Smartphone className="w-4 h-4" />}
                        {receipt.payment_method.type === 'crypto' && <Bitcoin className="w-4 h-4" />}
                        {receipt.payment_method.type === 'online_gateway' && <Globe2 className="w-4 h-4" />}
                        {receipt.payment_method.type === 'other' && <CreditCard className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 truncate">
                          Pagado a {receipt.payment_method.owner_name} {receipt.payment_method.country && `(${receipt.payment_method.country})`}
                        </p>
                        <p className="text-xs font-bold text-foreground truncate">{receipt.payment_method.name} - {receipt.payment_method.details}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <Button 
                        variant="ghost" 
                        className="bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 h-11 border border-white/5 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                        onClick={() => handleViewBoleta(receipt)}
                     >
                        <Eye className="w-4 h-4" /> Ver Boleta
                     </Button>
                     <Button 
                        variant="ghost" 
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 h-11 hover:bg-emerald-500 hover:text-white transition-all"
                        onClick={() => handleShareBoleta(receipt)}
                     >
                        <MessageCircle className="w-4 h-4" /> Enviar WA
                     </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black">{customerName.charAt(0)}</div>
                    <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">{customerName}</span>
                 </div>
                 {tab === 'admin' && hasAdminReceipt && (
                    <a href={receipt.receipts[0].file_url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white rounded-lg">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                 )}
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )
        })}

        {filteredReceipts.length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 py-24 text-center">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white/5 mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sin resultados</h3>
             <p className="text-sm text-muted-foreground font-medium">No hemos encontrado recibos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

      {/* Preview Modal for Admin Receipts */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl glass-card border-none p-0 overflow-hidden ring-1 ring-white/10 bg-zinc-950">
           {selectedReceipt && (
             <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
                   <img 
                    src={selectedReceipt.receipts[0].file_url} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain shadow-2xl"
                   />
                   <a 
                    href={selectedReceipt.receipts[0].file_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-xl text-white hover:bg-primary transition-all"
                   >
                     <ExternalLink className="w-5 h-5" />
                   </a>
                </div>
                <div className="w-full md:w-80 p-8 space-y-8 bg-zinc-900 border-l border-white/5 shrink-0">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-6">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ImageIcon className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Detalle de Evidencia</p>
                            <h2 className="text-lg font-black tracking-tight uppercase">Comprobante ID</h2>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                           <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Cliente</p>
                           <p className="text-sm font-black text-foreground">{selectedReceipt.membership?.profile?.full_name}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                           <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Monto Registrado</p>
                           <p className="text-2xl font-black text-emerald-500">${Number(selectedReceipt.amount).toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                           <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Fecha de Operación</p>
                           <p className="text-sm font-black text-foreground"><ClientDateTime date={selectedReceipt.payment_date} options={{ day: '2-digit', month: 'long', year: 'numeric' }} /></p>
                        </div>
                      </div>

                      {selectedReceipt.notes && (
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic text-xs text-amber-200/60 font-medium">
                          "{selectedReceipt.notes}"
                        </div>
                      )}
                   </div>

                   <Button 
                    className="w-full h-12 premium-gradient rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 gap-2"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedReceipt.receipts[0].file_url;
                      link.download = `comprobante_${selectedReceipt.id.substring(0, 6)}.png`;
                      link.click();
                    }}
                   >
                     <Download className="w-4 h-4" /> Descargar Evidencia
                   </Button>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
