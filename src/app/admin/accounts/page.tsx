import { fetchAccounts } from './actions'
import { AccountsTable } from './AccountsTable'
import { ShieldCheck, Key, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const { data: accounts, error } = await fetchAccounts()

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 rounded-3xl border border-red-500/20 m-8">
        <p className="text-red-500 font-bold">Error al cargar cuentas: {error}</p>
      </div>
    )
  }

  const activeCount = accounts?.filter((a: any) => a.is_active).length || 0

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
          Gestión de Cuentas VIP
        </h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
           <ShieldCheck className="w-4 h-4 text-primary" />
           Organiza y protege las credenciales de servicios para tus clientes.
        </p>
      </div>

      {/* STATS PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-sidebar/20 relative overflow-hidden group hover:border-primary/20 transition-all">
           <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Key className="w-32 h-32" />
           </div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Activity className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-3xl font-black">{accounts?.length || 0}</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Total de Cuentas</span>
              </div>
           </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-sidebar/20 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
           <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <ShieldCheck className="w-32 h-32" />
           </div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-3xl font-black">{activeCount}</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Cuentas Activas</span>
              </div>
           </div>
        </div>
      </div>

      <AccountsTable accounts={accounts || []} />
    </div>
  )
}
