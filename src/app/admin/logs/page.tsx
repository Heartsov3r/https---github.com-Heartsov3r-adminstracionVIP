import { fetchAdminLogs } from './actions'
import { LogsClient } from './LogsClient'
import { Activity } from 'lucide-react'

export default async function AdminLogsPage() {
  const { data: logs, error } = await fetchAdminLogs()

  if (error) {
    return (
      <div className="p-4 sm:p-8 min-h-[60vh] flex items-center justify-center">
        <div className="glass-card p-8 rounded-[2rem] border-red-500/20 text-center max-w-md">
           <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h1 className="text-xl font-black uppercase text-red-500 tracking-tighter">Error Crítico</h1>
           <p className="text-muted-foreground mt-2 font-medium">No se pudieron cargar los registros: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-20">
      <div>
        <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-3">
           <Activity className="w-4 h-4 animate-pulse" />
           Security & Activity Insights
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tighter leading-[0.9]">
           Registro de Actividades
        </h1>
        <p className="text-muted-foreground font-medium text-sm mt-4 max-w-2xl">
           Auditoría completa de acciones administrativas sobre planes, usuarios y transacciones financieras del sistema.
        </p>
      </div>

      <LogsClient logs={logs || []} />
    </div>
  )
}
