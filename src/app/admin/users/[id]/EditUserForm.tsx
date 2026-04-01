'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile, addMembershipDays } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function EditUserForm({ user }: { user: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // States for basic info
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  // States for membership extension
  const [daysToAdd, setDaysToAdd] = useState<number>(31)
  const [daysReason, setDaysReason] = useState('')

  const membership = user?.latestMembership
  const hasActiveMembership = membership && !isNaN(new Date(membership.end_date).getTime())

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('phone', phone)

      const res = await updateUserProfile(user.id, formData)
      if (res.error) {
        alert(res.error)
      } else {
        alert("Perfil actualizado correctamente")
      }
    })
  }

  async function handleAddDays() {
    if (!daysReason.trim()) { alert('El motivo es obligatorio.'); return }
    startTransition(async () => {
      const res = await addMembershipDays(user.id, membership?.id || null, daysToAdd, daysReason)
      if (res.error) {
        alert(res.error)
      } else {
        alert("Días añadidos con éxito")
        setDaysReason('')
      }
    })
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>Actualiza el nombre, teléfono, etc.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Correo (Solo lectura)</Label>
              <Input value={user?.email} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Rol del Sistema</Label>
              <Input value={user?.role === 'admin' ? 'Administrador' : 'Cliente'} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/users')}>Volver</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {user?.role === 'client' && (
      <Card>
        <CardHeader>
          <CardTitle>Membresía y Días</CardTitle>
          <CardDescription>Añadir días adicionales de acceso</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="rounded-lg border p-4 bg-muted/30">
             <div className="text-sm text-muted-foreground mb-1">Estado de acceso:</div>
             {hasActiveMembership ? (
               <div>
                 <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Activo</Badge>
                 <div className="font-medium">
                   Vence el: {format(new Date(membership.end_date), "PPpp", { locale: es })}
                 </div>
               </div>
             ) : (
               <Badge variant="destructive">Sin membresía / Vencida</Badge>
             )}
          </div>

          <div className="grid gap-2">
             <Label htmlFor="days">¿Cuántos días quieres otorgar?</Label>
             <div className="flex gap-2">
                <Input 
                  id="days" 
                  type="number" 
                  value={daysToAdd} 
                  onChange={e => setDaysToAdd(parseInt(e.target.value) || 0)} 
                  min={1}
                />
                <Button onClick={handleAddDays} disabled={isPending || daysToAdd < 1 || !daysReason.trim()}>
                   Conceder Días
                </Button>
             </div>
             <div className="grid gap-2 mt-2">
               <Label htmlFor="reason">Motivo <span className="text-red-500">*</span></Label>
               <Textarea 
                 id="reason" 
                 value={daysReason} 
                 onChange={e => setDaysReason(e.target.value)} 
                 placeholder="Ej: Bonificación, cortesía..." 
                 className="min-h-[60px] resize-none text-sm"
               />
             </div>
             <p className="text-xs text-muted-foreground">
               Los días se sumarán a su fecha de expiración actual.
              </p>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
