import { fetchPaymentMethods } from './actions'
import PaymentMethodsClient from './PaymentMethodsClient'
import { Wallet } from 'lucide-react'

export default async function PaymentMethodsPage() {
  const { data: methods, error } = await fetchPaymentMethods()

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl border border-red-500/20">
          Error cargando métodos de pago: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
            <Wallet className="w-4 h-4" />
            Configuración Financiera
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Métodos de <span className="text-primary not-italic">Pago</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Gestiona las cuentas y billeteras digitales donde los clientes depositarán.</p>
        </div>
      </div>

      <PaymentMethodsClient initialMethods={methods || []} />
    </div>
  )
}
