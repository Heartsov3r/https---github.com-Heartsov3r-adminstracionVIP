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
        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/5">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-lg sm:text-xl tracking-tighter text-foreground">${Number(p.amount).toFixed(2)}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] truncate opacity-70">
                {p.memberships?.plans?.name || 'Pago manual'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Fecha de Pago</p>
              <p className="text-xs font-bold text-foreground/80">
                <ClientDateTime date={p.payment_date} options={{ day: '2-digit', month: 'short', year: 'numeric' }} />
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {p.payment_receipts?.length > 0 && (
                <a 
                  href={p.payment_receipts[0].file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/10"
                >
                  <Paperclip className="w-3 h-3" />
                  Foto
                </a>
              )}
              
              <button
                onClick={() => handleDownloadPDF(p)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-primary/20 shadow-lg shadow-primary/5 group"
              >
                <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Boleta PDF
                <Download className="w-2.5 h-2.5 opacity-50" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
