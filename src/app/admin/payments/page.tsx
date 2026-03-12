import { fetchMembershipsForPayments } from './actions'
import PaymentsTable from './PaymentsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, DollarSign, Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default async function PaymentsPage() {
  const { data: memberships, error } = await fetchMembershipsForPayments()

  if (error || !memberships) {
    return (
      <div className="p-8">
        <div className="glass-card border-none bg-red-500/10 text-red-500 p-6 rounded-3xl flex items-center gap-4">
           <Activity className="w-8 h-8 opacity-50" />
           <div>
              <p className="font-black uppercase text-xs tracking-widest">Falla de Red</p>
              <p className="text-sm font-medium">No se pudieron recuperar los estados de pago: {error}</p>
           </div>
        </div>
      </div>
    )
  }

  // Métricas Financieras Superiores
  let totalEsperado = 0
  let totalCobrado = 0
  let planesActivos = 0

  memberships.forEach(m => {
      const precio = (m.plans as any)?.price || 0
      totalEsperado += precio
      const pagado = m.manual_payments?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) || 0
      totalCobrado += pagado
      if (precio > 0 || m.plans !== null) {
          planesActivos++
      }
  })

  let totalPendiente = Math.max(0, totalEsperado - totalCobrado)

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-(--breakpoint-2xl) mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
           <Activity className="w-6 h-6 text-primary" />
           <h1 className="text-3xl font-black tracking-tighter text-foreground">Flujos de Ingresos</h1>
        </div>
        <p className="text-muted-foreground font-medium text-sm">Monitoreo técnico de facturación y conciliación de abonos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Facturación Total */}
        <div className="glass-card rounded-[2rem] border-white/5 bg-white/[0.02] p-8 relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Wallet className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volumen Facturado</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground tracking-tighter">${totalEsperado.toFixed(2)}</span>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                 </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium italic opacity-60">Basado en {planesActivos} activaciones</p>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wallet className="w-24 h-24" />
           </div>
        </div>

        {/* Card 2: Ingreso Verificado */}
        <div className="glass-card rounded-[2rem] border-white/5 bg-white/[0.02] p-8 relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                 <DollarSign className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capital Verificado</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-500 tracking-tighter">${totalCobrado.toFixed(2)}</span>
                    <Activity className="w-4 h-4 text-emerald-500" />
                 </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium italic opacity-60">Liquidez disponible en activos</p>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <DollarSign className="w-24 h-24" />
           </div>
        </div>

        {/* Card 3: Capital Pendiente */}
        <div className="glass-card rounded-[2rem] border-white/5 bg-white/[0.02] p-8 relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                 <CreditCard className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cuentas por Cobrar</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-red-500 tracking-tighter">${totalPendiente.toFixed(2)}</span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                 </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium italic opacity-60">Monto total de deudas vigentes</p>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <CreditCard className="w-24 h-24" />
           </div>
        </div>
      </div>

      <div className="pt-4">
        <PaymentsTable memberships={memberships} />
      </div>
    </div>
  )
}
