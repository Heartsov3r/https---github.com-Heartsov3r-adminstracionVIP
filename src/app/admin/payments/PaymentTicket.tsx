'use client'

import React from 'react'
import { CheckCircle2, Crown, Zap } from 'lucide-react'

interface PaymentTicketProps {
  data: {
    folio: string
    customerName: string
    customerPhone: string
    planName: string
    planDays: number
    amount: number
    date: string
    adminName: string
    notes?: string
    paymentMethod?: {
      name: string
      details: string
      owner_name: string
      type: string
    } | null
    planPrice?: number
    remainingBalance?: number
    companyName?: string
    companyRuc?: string
    companyAddress?: string
  }
}

export const PaymentTicket = React.forwardRef<HTMLDivElement, PaymentTicketProps>(({ data }, ref) => {
  return (
    <div 
      ref={ref}
      className="w-full max-w-[400px] mx-auto p-8 rounded-none shadow-2xl relative overflow-hidden font-sans border-t-8 border-primary"
      style={{ 
        minHeight: '550px',
        backgroundColor: 'var(--ticket-bg)',
        color: 'var(--ticket-text)'
      }}
    >
      {/* Background Decorative Element */}
      <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="flex flex-col items-center mb-8 border-b-2 border-dashed pb-6 relative z-10" style={{ borderColor: 'var(--ticket-border)' }}>
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">{data.companyName || 'Membresías VIP'}</h1>
        <div className="text-center mt-1">
           <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--ticket-muted)' }}>Comprobante de Pago Electrónico</p>
           {data.companyAddress && <p className="text-[8px] font-medium" style={{ color: 'var(--ticket-muted)' }}>{data.companyAddress}</p>}
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-start p-4 rounded-xl border" style={{ backgroundColor: 'var(--ticket-subtle)', borderColor: 'var(--ticket-border)' }}>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--ticket-muted)' }}>Referencia</span>
            <span className="text-sm font-black font-mono text-primary italic">REC-{data.folio}</span>
          </div>
          <div className="text-right flex flex-col gap-1">
             <span className="text-[9px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--ticket-muted)' }}>Fecha de Emisión</span>
             <p className="text-xs font-bold">{data.date}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--ticket-subtle)', borderColor: 'var(--ticket-border)' }}>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--ticket-muted)' }}>Información del Cliente</span>
            <p className="text-base font-black uppercase mt-1 leading-tight" style={{ color: 'var(--ticket-text)' }}>{data.customerName}</p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-medium" style={{ color: 'var(--ticket-muted)' }}>{data.customerPhone}</span>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-end border-b pb-2" style={{ borderColor: 'var(--ticket-border)' }}>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--ticket-muted)' }}>Servicio Adquirido</span>
                   <p className="text-sm font-black flex items-center gap-1.5 mt-0.5">
                     <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                     {data.planName}
                   </p>
                   <p className="text-[10px] font-bold italic" style={{ color: 'var(--ticket-muted)' }}>Acceso por {data.planDays} días</p>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black leading-none" style={{ color: 'var(--ticket-text)' }}>$ {data.amount.toFixed(2)}</p>
                   <p className="text-[8px] font-bold uppercase mt-1" style={{ color: 'var(--ticket-muted)' }}>Precio Unitario</p>
                </div>
             </div>

             <div className="pt-2">
                <div className="flex justify-between items-center bg-primary text-white p-4 rounded-xl shadow-lg shadow-primary/20">
                   <span className="text-xs font-black uppercase tracking-widest">Abono Actual</span>
                   <span className="text-2xl font-black">$ {data.amount.toFixed(2)}</span>
                </div>
                
                {(data.planPrice !== undefined && data.planPrice > data.amount) && (
                   <div className="mt-3 p-3 rounded-xl border border-dashed flex justify-between items-center" style={{ borderColor: 'var(--ticket-border)' }}>
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Costo Total</span>
                         <span className="text-xs font-bold">$ {data.planPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                         <span className="text-[8px] font-black uppercase tracking-widest text-red-500 opacity-60">Saldo Pendiente</span>
                         <span className="text-xs font-black text-red-500">$ {(data.remainingBalance !== undefined ? data.remainingBalance : (data.planPrice - data.amount)).toFixed(2)}</span>
                      </div>
                   </div>
                )}
             </div>
          </div>
          
          {data.paymentMethod && (
            <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: 'var(--ticket-border)', backgroundColor: 'var(--ticket-subtle)' }}>
               <p className="text-[9px] font-black uppercase tracking-widest leading-tight block mb-1" style={{ color: 'var(--ticket-muted)' }}>
                 Método de Pago: {data.paymentMethod.name}
               </p>
               <p className="text-xs font-black text-primary italic uppercase tracking-tighter">MEMBRESÍAS VIP</p>
            </div>
          )}

        </div>
      </div>

      {/* Footer / Status */}
      <div className="mt-12 flex flex-col items-center relative z-10">
        <div className="flex items-center gap-2 mb-4 px-6 py-2 rounded-full border shadow-sm animate-bounce-subtle" style={{ backgroundColor: 'var(--ticket-success-bg)', color: 'var(--ticket-success-text)', borderColor: 'var(--ticket-border)' }}>
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Pago Completado</span>
        </div>
        
        <div className="text-center">
          <p className="text-[10px] font-medium leading-relaxed" style={{ color: 'var(--ticket-muted)' }}>
            Atendido por: <span className="font-bold" style={{ color: 'var(--ticket-text)' }}>{data.adminName}</span>
          </p>
          <p className="text-[8px] mt-4 leading-relaxed uppercase tracking-widest font-bold" style={{ color: 'var(--ticket-muted)' }}>
            Gracias por confiar en el servicio VIP.
          </p>
        </div>
      </div>

      {/* Ticket Cut Decorative Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[radial-gradient(circle,_#f4f4f5_50%,_transparent_50%)] bg-[length:20px_20px] bg-repeat-x" />
    </div>
  )
})

PaymentTicket.displayName = 'PaymentTicket'
