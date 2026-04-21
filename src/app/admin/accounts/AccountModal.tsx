'use client'

import { useState, useTransition, useEffect } from 'react'
import { createAccount, updateAccount } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ShieldCheck, Plus } from 'lucide-react'

interface AccountModalProps {
  account?: any
  onSuccess?: () => void
  trigger?: React.ReactNode
  openOverride?: boolean
  setOpenOverride?: (open: boolean) => void
}

export function AccountModal({ account, onSuccess, trigger, openOverride, setOpenOverride }: AccountModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const open = openOverride !== undefined ? openOverride : internalOpen
  const setOpen = setOpenOverride !== undefined ? setOpenOverride : setInternalOpen
  
  const [isPending, startTransition] = useTransition()
  
  const [serviceName, setServiceName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [tvActivationLink, setTvActivationLink] = useState('')

  useEffect(() => {
    if (account) {
      setServiceName(account.service_name || '')
      setEmail(account.email || '')
      setPassword(account.password || '')
      setNotes(account.notes || '')
      setTvActivationLink(account.tv_activation_link || '')
    }
  }, [account, open])

  function resetForm() {
    if (!account) {
      setServiceName('')
      setEmail('')
      setPassword('')
      setNotes('')
      setTvActivationLink('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('service_name', serviceName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('notes', notes)
      formData.append('tv_activation_link', tvActivationLink)

      let res
      if (account?.id) {
        res = await updateAccount(account.id, formData)
      } else {
        res = await createAccount(formData)
      }

      if (res.error) {
        alert(`Error: ${res.error}`)
      } else {
        setOpen(false)
        resetForm()
        if (onSuccess) onSuccess()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      {trigger ? (
        <DialogTrigger 
          render={trigger} 
        />
      ) : openOverride === undefined ? (
        <DialogTrigger 
          render={(
            <Button className="premium-gradient shadow-lg shadow-primary/20 gap-2 h-11 rounded-xl font-bold">
              <Plus className="w-5 h-5" />
              Nueva Cuenta
            </Button>
          )} 
        />
      ) : null}
      <DialogContent className="sm:max-w-[500px] rounded-[1.5rem] border-white/5 bg-sidebar/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
        <div className="premium-gradient p-6 text-white relative overflow-hidden">
           <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
           <DialogHeader>
             <DialogTitle className="text-2xl font-black">{account ? 'Editar Cuenta' : 'Nueva Cuenta VIP'}</DialogTitle>
             <p className="text-white/70 text-sm font-medium">Gestiona credenciales de servicios compartidos.</p>
           </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre del Servicio</Label>
            <Input 
              value={serviceName} 
              onChange={e => setServiceName(e.target.value)} 
              placeholder="Ej. HBO Max, Disney+, Netflix" 
              className="rounded-xl bg-white/5 border-white/10"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email / Usuario</Label>
            <Input 
              type="text"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com" 
              className="rounded-xl bg-white/5 border-white/10"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Contraseña</Label>
            <Input 
              type="text"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="rounded-xl bg-white/5 border-white/10"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Link de Activación TV (Opcional)</Label>
            <Input 
              type="url"
              value={tvActivationLink} 
              onChange={e => setTvActivationLink(e.target.value)} 
              placeholder="https://www.netflix.com/tv8" 
              className="rounded-xl bg-white/5 border-white/10"
            />
          </div>


          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notas Adicionales</Label>
            <Textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Detalles extra..." 
              className="rounded-xl bg-white/5 border-white/10 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button 
                type="submit" 
                disabled={isPending} 
                className="premium-gradient shadow-lg shadow-primary/20 min-w-[140px] rounded-xl font-bold"
            >
              {isPending ? 'Guardando...' : (account ? 'Actualizar' : 'Guardar Cuenta')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
