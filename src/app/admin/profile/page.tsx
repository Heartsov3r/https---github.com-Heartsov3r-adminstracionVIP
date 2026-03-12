'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { getCurrentAdmin, updateAdminProfile } from '../actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Phone, Calendar, Shield, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    description: ''
  })

  useEffect(() => {
    async function load() {
      const { data } = await getCurrentAdmin()
      if (data) {
        setAdmin(data)
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          description: data.description || ''
        })
      }
    }
    load()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const { error } = await updateAdminProfile(formData)
      if (error) {
        toast.error(error)
      } else {
        toast.success('Perfil actualizado correctamente')
        setAdmin({ ...admin, ...formData })
      }
    })
  }

  if (!admin) return <div className="p-8"><Loader2 className="animate-spin" /></div>

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tus datos personales y ajustes de seguridad.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="glass-card p-6 border-none flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-4 shadow-2xl shadow-primary/20">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold">{admin.full_name || 'Administrador'}</h2>
            <p className="text-sm text-muted-foreground px-4">{admin.description || 'Sin descripción disponible.'}</p>
            
            <div className="w-full pt-6 mt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <span>{admin.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Unido el {new Date(admin.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border-none bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group cursor-pointer border border-emerald-500/20">
            <div className="flex items-center gap-3 text-emerald-500">
              <Shield className="w-5 h-5" />
              <span className="font-bold">Estado de Cuenta</span>
            </div>
            <p className="text-xs text-emerald-500/70 mt-2 font-medium">Administrador Verificado - Acceso Total</p>
          </Card>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2 space-y-8">
           <Card className="glass-card p-8 border-none space-y-6">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Información Personal</h3>
             </div>

             <form onSubmit={handleUpdate} className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</label>
                   <Input 
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono</label>
                   <Input 
                      placeholder="+51 987 654 321"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                   />
                </div>

                <div className="sm:col-span-2 space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Descripción / Biografía</label>
                   <Textarea 
                      placeholder="Escribe algo sobre ti..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:ring-1 focus:ring-primary/50 transition-all font-medium resize-none"
                   />
                </div>

                <div className="sm:col-span-2 pt-4">
                   <Button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full premium-gradient h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group disabled:opacity-50"
                   >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                      Guardar Cambios
                   </Button>
                </div>
             </form>
           </Card>

           <Card className="glass-card p-8 border-none border border-red-500/10 bg-red-500/5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                   <h4 className="font-bold text-red-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Seguridad de la Cuenta
                   </h4>
                   <p className="text-xs text-red-400/60 font-medium">Cambia tu contraseña para mantener tu acceso seguro.</p>
                </div>
                <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl h-11 px-6 font-bold">
                   Cambiar Contraseña
                </Button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
