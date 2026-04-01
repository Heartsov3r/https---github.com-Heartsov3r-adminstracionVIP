'use client'

import { useEffect, useState } from 'react'

interface ClientDateTimeProps {
  date?: string | Date | number
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
 * @param date - Fecha a mostrar (ISO string, Date o timestamp). Si no se provee, usa la hora actual.
 */
export function ClientDateTime({ date, className, options = DEFAULT_OPTIONS }: ClientDateTimeProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsMounted(true)
  }, [])

  if (!isMounted) return <span className={className} aria-hidden="true">&nbsp;</span>

  const targetDate = date ? new Date(date) : new Date()
  const formatted = new Intl.DateTimeFormat('es-PE', options).format(targetDate)
  const dateStr = formatted.charAt(0).toUpperCase() + formatted.slice(1)

  return <span className={className}>{dateStr}</span>
}
