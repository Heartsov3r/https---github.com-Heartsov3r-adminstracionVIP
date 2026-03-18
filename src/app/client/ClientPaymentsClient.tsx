'use client'

import React from 'react'
import { DollarSign, Paperclip, ExternalLink, Download, FileText } from 'lucide-react'
import { ClientDateTime } from '@/components/ui/client-datetime'
import { generateReceiptPDF } from '../admin/payments/pdf-utils'

export default function ClientPaymentsClient({ payments, profile }: { payments: any[], profile: any }) {
  
  const handleDownloadPDF = (payment: any) => {
    const plan = payment.memberships?.plans
    const admin = payment.profiles // recording_admin_id relation
    
    const receiptData = {
      folio: payment.id.split('-')[0].toUpperCase(),
      customerName: profile?.full_name || 'Cliente',
      customerPhone: profile?.phone || '',
      planName: plan?.name || 'Manual',
      planDays: plan?.duration_days || 0,
      amount: Number(payment.amount),
      planPrice: Number(plan?.price || 0),
      remainingBalance: 0, // In user view we might not need to calculate complex balances
      date: new Date(payment.payment_date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      adminName: admin?.full_name || 'Administrador VIP',
      paymentMethod: payment.payment_methods ? {
        name: payment.payment_methods.name,
        details: payment.payment_methods.details,
        owner_name: payment.payment_methods.owner_name,
        type: payment.payment_methods.type
      } : null,
      companyName: 'MEMBRESÍAS VIP',
      companyRuc: '20123456789',
      companyAddress: 'Sede Central - Área VIP'
    }

    const doc = generateReceiptPDF(receiptData)
    doc.save(`Boleta_${receiptData.folio}.pdf`)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {payments.map((p: any) => (
        <div key={p.id} className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all gap-5 group shadow-lg">
          
          {/* Sello de agua */}
          <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
            <DollarSign className="w-40 h-40" />
          </div>

          <div className="flex items-start sm:items-center gap-4 relative z-10 w-full sm:w-auto">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)] transition-all">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-sm" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-black text-2xl sm:text-3xl tracking-tighter text-foreground">${Number(p.amount).toFixed(2)}</p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-400">Completado</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-black uppercase tracking-[0.2em] truncate mt-1">
                {p.memberships?.plans?.name || 'Pago manual'}
              </p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Folio: {p.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 relative z-10 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
            <div className="text-left sm:text-right">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mb-0.5">Fecha de Transacción</p>
              <p className="text-sm font-bold text-foreground">
                <ClientDateTime date={p.payment_date} options={{ day: '2-digit', month: 'long', year: 'numeric' }} />
              </p>
            </div>

            <div className="flex gap-2">
              {p.payment_receipts?.length > 0 && (
                <a 
                  href={p.payment_receipts[0].file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 group-hover:border-white/20"
                >
                  <Paperclip className="w-3.5 h-3.5 opacity-50" />
                  Foto
                </a>
              )}
              
              <button
                onClick={() => handleDownloadPDF(p)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all border border-primary/20 shadow-lg shadow-primary/10 group-hover:shadow-primary/20 focus:scale-95"
              >
                <FileText className="w-4 h-4" />
                Factura Digital
                <Download className="w-3 h-3 opacity-50 ml-1" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
