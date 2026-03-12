import { fetchPlans } from './actions'
import { PlansTable } from './PlansTable'
import { CreatePlanModal } from './CreatePlanModal'
import { Zap, ShieldCheck } from 'lucide-react'

export default async function PlansPage() {
  const { data: plans, error } = await fetchPlans()

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
               <Zap className="w-6 h-6 text-primary fill-primary/20" />
               <h1 className="text-3xl font-black tracking-tighter text-foreground">Arquitectura de Planes</h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm">Gestiona la oferta comercial y los ciclos de servicio.</p>
        </div>
        <CreatePlanModal />
      </div>

      {error ? (
        <div className="glass-card border-none bg-red-500/10 text-red-500 p-6 rounded-3xl flex items-center gap-4">
           <ShieldCheck className="w-8 h-8 opacity-50" />
           <div>
              <p className="font-black uppercase text-xs tracking-widest">Falla de Sincronización</p>
              <p className="text-sm font-medium">No se pudieron recuperar los planes: {error}</p>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
           <PlansTable plans={plans || []} />
        </div>
      )}
    </div>
  )
}
