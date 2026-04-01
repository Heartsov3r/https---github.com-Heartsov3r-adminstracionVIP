import React from 'react'
import { redirect } from 'next/navigation'
import { Heart, UploadCloud, Users, ChevronRight, Hash } from 'lucide-react'
import { fetchDonations } from './actions'
import { fetchUsers } from '../users/actions'
import { getCurrentAdmin } from '../actions'
import DonationsTable from './DonationsTable'

export const metadata = {
  title: 'Donaciones VIP - Administrador',
  description: 'Gestión y registro de donaciones',
}

export default async function DonationsPage() {
  const { data: admin } = await getCurrentAdmin()
  if (!admin) {
    redirect('/login')
  }

  // Cargar donaciones y perfiles
  const [{ data: donations, error }, { data: usersData }] = await Promise.all([
    fetchDonations(),
    fetchUsers()
  ])

  // Cargar metodos de pago
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: paymentMethods } = await supabase.from('payment_methods').select('*').eq('is_active', true)

  if (error || !donations) {
    return (
      <div className="p-8 text-red-500 font-bold bg-red-500/10 rounded-2xl border border-red-500/20">
        <p>Error cargando el historial de donaciones.</p>
        <p className="text-sm font-medium mt-1 text-red-400">Verifique que ha ejecutado el SQL en Supabase para crear la tabla de 'donations'.</p>
        <pre className="text-xs mt-4 p-4 bg-black/50 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0)
  const uniqueUsers = new Set(donations.map(d => d.donor_id || d.donor_name)).size

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
      
      {/* HEADER HERO */}
      <div className="relative rounded-3xl overflow-hidden premium-gradient p-8 sm:p-12 text-white shadow-2xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
        <div className="absolute bottom-0 right-10 opacity-10 blur-sm group-hover:blur-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
           <Heart className="w-48 h-48 sm:w-64 sm:h-64" fill="currentColor" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/10">Módulo Voluntario</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
              Donaciones
            </h1>
            <p className="text-white/80 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              Registra, audita y agradece el soporte financiero brindado voluntariamente. Base de datos separada de ventas operativas para <strong className="text-white">Transparencia Total</strong>.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0 glass-card p-5 rounded-2xl border-white/20 w-full md:w-auto">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Recaudado Histórico</span>
             <p className="text-4xl sm:text-5xl font-black tracking-tighter text-emerald-300">
               ${totalDonations.toFixed(2)}
             </p>
             <div className="flex items-center gap-2 mt-1">
               <Users className="w-3.5 h-3.5 text-white/60" />
               <span className="text-xs font-bold text-white/80">{uniqueUsers} Contribuyentes Únicos</span>
             </div>
          </div>
        </div>
      </div>

      {/* ADMIN BREADCRUMB */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
        <span>Admin Panel</span> <ChevronRight className="w-3 h-3 mx-1 opacity-50" />
        <span>Finanzas Externas</span> <ChevronRight className="w-3 h-3 mx-1 opacity-50" />
        <span className="text-primary">Donaciones Recibidas</span>
      </div>

      {/* METRICS & TABLE */}
      <div className="space-y-6">
         <DonationsTable 
           donations={donations} 
           users={usersData || []} 
           paymentMethods={paymentMethods || []} 
           currentAdmin={admin} 
         />
      </div>

    </div>
  )
}
