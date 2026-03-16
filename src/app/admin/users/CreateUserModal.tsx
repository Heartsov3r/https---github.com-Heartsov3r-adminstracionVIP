'use client'

import { useState, useTransition } from 'react'
import { createUser } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Función simple para parsear código de país a bandera
function getCountryFlag(phone: string) {
  if (phone.startsWith('+51')) return '🇵🇪'
  if (phone.startsWith('+52')) return '🇲🇽'
  if (phone.startsWith('+54')) return '🇦🇷'
  if (phone.startsWith('+56')) return '🇨🇱'
  if (phone.startsWith('+57')) return '🇨🇴'
  if (phone.startsWith('+58')) return '🇻🇪'
  if (phone.startsWith('+591')) return '🇧🇴'
  if (phone.startsWith('+593')) return '🇪🇨'
  if (phone.startsWith('+595')) return '🇵🇾'
  if (phone.startsWith('+598')) return '🇺🇾'
  if (phone.startsWith('+34')) return '🇪🇸'
  if (phone.startsWith('+1')) return '🇺🇸'
  if (phone.startsWith('+')) return '🌐'
  return '📱' // Por defecto
}

export function CreateUserModal({ plans }: { plans: any[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  
  // Por defecto intentamos preseleccionar el plan VIP si existe, si no "none"
  const defaultPlanId = Array.isArray(plans) 
    ? (plans.find(p => p.name?.toLowerCase().includes('vip'))?.id || 'none')
    : 'none'
  const [planId, setPlanId] = useState<string>(defaultPlanId)

  function handleNext() {
    if (!fullName || !email || !password || !phone) {
      alert("Todos los datos, incluyendo el celular, son obligatorios.")
      return
    }
    setStep(2)
  }

  function submitForm() {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('phone', phone)
      formData.append('role', 'client') // Obligamos siempre a Cliente
      formData.append('planId', planId)

      const res = await createUser(formData)
      if (res.error) {
        alert(`Error: ${res.error}`)
      } else {
        alert("Cliente creado exitosamente")
        setOpen(false)
        resetForm()
      }
    })
  }

  function resetForm() {
    setStep(1)
    setFullName('')
    setEmail('')
    setPassword('')
    setPhone('')
    setPlanId(defaultPlanId)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      <DialogTrigger render={<Button>+ Nuevo Cliente</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente VIP</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {step === 1 && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Ej. Juan Pérez" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Número de WhatsApp / Teléfono *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-lg">
                    {getCountryFlag(phone)}
                  </div>
                  <Input 
                    id="phone" 
                    type="tel" 
                    className="pl-10"
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+51999888777" 
                    required 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Asignar Contraseña Temporal *</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-2 mb-4">
                <Label>Vincular Plan de Membresía (Opcional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Puedes asignarle directamente el Plan VIP para que sus 31 días se activen desde este momento.
                </p>
                <Select value={planId} onValueChange={(v: string | null) => setPlanId(v || defaultPlanId)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin membresía actual</SelectItem>
                    {plans.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - ${p.price} ({p.duration_days} días)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} disabled={isPending}>
                Atrás
              </Button>
            )}
            
            {step === 1 ? (
              <Button onClick={handleNext}>Siguiente</Button>
            ) : (
              <Button onClick={submitForm} disabled={isPending}>
                {isPending ? 'Creando...' : 'Finalizar Registro'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
