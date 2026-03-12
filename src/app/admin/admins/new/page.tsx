'use client'

import React, { useState, useTransition } from 'react'
import { registerNewAdmin } from '../../actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, Lock, ShieldCheck, Loader2, ArrowLeft, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewAdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const result = await registerNewAdmin(formData)
      if (result?.error) {
        toast.error(result.error)
        setIsLoading(false)
      } else {
        toast.success('Administrador registrado correctamente')
        router.push('/admin')
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado al intentar registrar.')
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/admin">
           <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
           </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Nuevo Administrador</h1>
          <p className="text-sm text-muted-foreground">Crea una nueva cuenta con acceso total al sistema.</p>
        </div>
      </div>

      <Card className="glass-card p-8 border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
           <UserPlus className="w-32 h-32" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
           <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nombre Completo</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        required
                        placeholder="Ej. Juan Pérez"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Teléfono</label>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="+51 987 654 321"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Correo Electrónico</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        required
                        type="email"
                        placeholder="admin@ejemplo.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Contraseña</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        required
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirmar</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        required
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                 </div>
              </div>
           </div>

           <div className="pt-4 border-t border-white/5 mt-8">
              <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full premium-gradient h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group disabled:opacity-50"
              >
                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                 Registrar Administrador
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest">
                 El nuevo administrador tendrá acceso completo al panel y base de datos.
              </p>
           </div>
        </form>
      </Card>
    </div>
  )
}
