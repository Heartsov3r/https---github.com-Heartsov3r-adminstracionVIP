import { login } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Grid, Lock, Mail, ArrowRight } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-[#030712]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6">
            <Grid className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            Membresías VIP
          </h1>
          <p className="text-sm text-white/40 font-medium mt-1">Sistema de Administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl ring-1 ring-white/5">
          <form action={login} className="space-y-6">
            {resolvedSearchParams?.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse" />
                {resolvedSearchParams.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@tuempresa.com"
                  required
                  className="h-13 pl-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-13 pl-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <Button
              className="w-full h-13 premium-gradient rounded-xl font-black text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group text-sm tracking-wide"
              type="submit"
            >
              Iniciar Sesión
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        <p className="text-center text-[10px] text-white/15 font-medium mt-8 tracking-wider uppercase">
          Acceso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  )
}
