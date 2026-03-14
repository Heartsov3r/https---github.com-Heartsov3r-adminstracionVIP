import React from 'react'
import { fetchFinancialStats } from '../actions'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BarChart3,
  ArrowUpRight,
  Target,
  Trophy
} from 'lucide-react'

export default async function ReportsPage() {
  const { data, error } = await fetchFinancialStats()

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl">
          Error al cargar reportes: {error}
        </div>
      </div>
    )
  }

  const { monthly, yearly, grandTotal, percentageChange } = data || { monthly: [], yearly: [], grandTotal: 0, percentageChange: 0 }

  // Encontrar el mejor mes
  const bestMonth = [...monthly].sort((a, b) => b.total - a.total)[0]
  const averageMonthly = monthly.length > 0 ? grandTotal / monthly.length : 0

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          Reportes Financieros
        </h1>
        <p className="text-muted-foreground font-medium italic">Análisis detallado de recaudación y crecimiento</p>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-6 border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <DollarSign className="w-5 h-5" />
            </div>
            {percentageChange !== 0 && (
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${percentageChange > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {percentageChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(percentageChange).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Recaudación Total</p>
          <h3 className="text-3xl font-black tracking-tighter">${grandTotal.toLocaleString()}</h3>
        </Card>

        <Card className="glass-card p-6 border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Mes de Oro</p>
          <h3 className="text-2xl font-black tracking-tighter uppercase">
            {bestMonth ? `${bestMonth.month} ${bestMonth.year}` : '---'}
          </h3>
          <p className="text-xs font-bold text-emerald-500/80 mt-1">${bestMonth?.total.toLocaleString() || 0}</p>
        </Card>

        <Card className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Promedio Mensual</p>
          <h3 className="text-3xl font-black tracking-tighter">${averageMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </Card>

        <Card className="glass-card p-6 border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Periodos Registrados</p>
          <h3 className="text-3xl font-black tracking-tighter">{monthly.length} <span className="text-sm text-muted-foreground font-medium">Meses</span></h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Evolution Chart */}
        <Card className="lg:col-span-2 glass-card p-8 border-white/5 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Crecimiento Mensual</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Evolución de ingresos por mes</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-[300px] pt-4">
            {monthly.length > 0 ? monthly.slice(-12).map((m, i) => {
              const maxTotal = Math.max(...monthly.map(x => x.total)) || 1
              const height = (m.total / maxTotal) * 100
              const isLast = i === Math.min(monthly.length, 12) - 1

              return (
                <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-3 group relative h-full">
                  <div className="flex-1 w-full bg-white/5 rounded-t-xl relative overflow-hidden flex items-end">
                    <div 
                      className={`w-full transition-all duration-1000 ease-out rounded-t-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] ${isLast ? 'premium-gradient' : 'bg-white/10 group-hover:bg-white/20'}`}
                      style={{ height: `${height}%` }}
                    />
                    
                    {/* Tooltip-like value */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white text-black text-[10px] font-black px-2 py-1 rounded-md pointer-events-none shadow-xl">
                      ${m.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isLast ? 'text-primary' : 'text-muted-foreground'}`}>{m.month}</span>
                    <span className="text-[8px] font-bold opacity-30 italic">{m.year}</span>
                  </div>
                </div>
              )
            }) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-sm opacity-50">
                Sin datos suficientes para graficar
              </div>
            )}
          </div>
        </Card>

        {/* Breakdown Summary */}
        <Card className="glass-card border-white/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest">Resumen Histórico</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
            <div className="divide-y divide-white/5">
              {monthly.length > 0 ? [...monthly].reverse().map((m) => (
                <div key={`${m.year}-${m.month}`} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black uppercase">
                      {m.month.substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight">{m.month} {m.year}</p>
                      <p className="text-[10px] text-muted-foreground font-medium italic">{m.count} cobros realizados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">${m.total.toFixed(2)}</p>
                    <ArrowUpRight className="w-3 h-3 text-emerald-500 ml-auto mt-1" />
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-muted-foreground italic text-sm opacity-50">
                  No se registran cobros históricos
                </div>
              )}
            </div>
          </div>
          
          {yearly.length > 0 && (
            <div className="p-6 bg-white/5 border-t border-white/5">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Totales Anuales</p>
               <div className="space-y-3">
                  {yearly.map(y => (
                    <div key={y.year} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                       <span className="text-xs font-black italic">{y.year}</span>
                       <span className="text-sm font-black">${y.total.toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
