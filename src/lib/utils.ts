import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retorna la fecha/hora actual en la "zona horaria de negocio" (America/Lima, Peru UTC-5).
 * Usar SOLO en el servidor para cálculos financieros y de vencimientos.
 * La UI debe usar la hora local del navegador del usuario (componente ClientDateTime).
 */
export function getBusinessDate() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }))
}
