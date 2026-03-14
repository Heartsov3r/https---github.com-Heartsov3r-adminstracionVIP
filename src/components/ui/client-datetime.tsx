'use client'

import { useEffect, useState } from 'react'

interface ClientDateTimeProps {
  className?: string
  /** Opciones de formato para Intl.DateTimeFormat */
  options?: Intl.DateTimeFormatOptions
}

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

/**
 * Muestra la fecha/hora LOCAL del dispositivo del usuario.
 * Funciona correctamente para administradores en distintos países (Perú, México, etc.)
 * porque usa el reloj del NAVEGADOR, no el del servidor.
 */
export function ClientDateTime({ className, options = DEFAULT_OPTIONS }: ClientDateTimeProps) {
  const [dateStr, setDateStr] = useState<string>('')

  useEffect(() => {
    // Se ejecuta en el navegador, donde conocemos la zona horaria real del usuario
    const formatted = new Intl.DateTimeFormat('es-PE', options).format(new Date())
    // Capitalizar primera letra
    setDateStr(formatted.charAt(0).toUpperCase() + formatted.slice(1))
  }, [options])

  // Mientras se hidrata, mostrar un placeholder invisible para evitar flash
  if (!dateStr) return <span className={className} aria-hidden="true">&nbsp;</span>

  return <span className={className}>{dateStr}</span>
}
