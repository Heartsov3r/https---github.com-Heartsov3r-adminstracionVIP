'use client'

import React from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportExcelButtonProps {
  data: any[]
  filename: string
  headers: { key: string; label: string }[]
  variant?: "outline" | "default" | "ghost" | "secondary"
  className?: string
}

export function ExportExcelButton({ data, filename, headers, variant = "outline", className }: ExportExcelButtonProps) {
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar.")
      return
    }

    // 1. Crear cabeceras
    const csvHeaders = headers.map(h => h.label).join(',')
    
    // 2. Crear filas
    const csvRows = data.map(item => {
      return headers.map(header => {
        let value = item[header.key] ?? ''
        
        // Manejar objetos anidados si es necesario (ej: user.profile.name)
        if (header.key.includes('.')) {
          value = header.key.split('.').reduce((obj, key) => obj?.[key], item) ?? ''
        }

        // Limpiar el valor para CSV (evitar comas que rompan columnas)
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    })

    // 3. Unir todo con el BOM de UTF-8 para que Excel detecte tildes correctamente
    const csvContent = '\uFEFF' + [csvHeaders, ...csvRows].join('\n')
    
    // 4. Crear el archivo y el link de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button 
      variant={variant} 
      size="sm" 
      onClick={exportToExcel}
      className={`gap-2 rounded-xl font-bold h-9 sm:h-10 ${className}`}
    >
      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
      <span className="hidden sm:inline">Exportar Excel</span>
      <span className="sm:hidden">Excel</span>
    </Button>
  )
}
