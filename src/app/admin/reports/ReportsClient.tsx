'use client'

import React from 'react'
import { ExportExcelButton } from '@/components/admin/ExportExcelButton'

interface ReportsClientProps {
  monthly: any[]
  yearly: any[]
}

export function ReportsClient({ monthly, yearly }: ReportsClientProps) {
  return (
    <div className="flex gap-3">
      <ExportExcelButton 
        data={monthly} 
        filename="recaudacion_mensual"
        headers={[
          { key: 'month', label: 'Mes' },
          { key: 'year', label: 'Año' },
          { key: 'total', label: 'Total Recaudado ($)' },
          { key: 'count', label: 'Cantidad de Cobros' }
        ]}
        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white"
      />
      <ExportExcelButton 
        data={yearly} 
        filename="recaudacion_anual"
        headers={[
          { key: 'year', label: 'Año' },
          { key: 'total', label: 'Total Recaudado ($)' }
        ]}
        className="bg-primary-foreground/10"
      />
    </div>
  )
}
