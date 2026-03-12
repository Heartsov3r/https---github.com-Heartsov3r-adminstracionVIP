'use client'

import React, { useState, useEffect } from 'react'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Grid, LogOut, User, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    loadProfile()
  }, [])

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans">
      {/* Top Header */}
      <header className="h-16 sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-8 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Grid className="text-white w-5 h-5" />
          </div>
          <span className="text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 hidden sm:block">
            Membresías VIP
          </span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted/50 transition-colors focus:outline-none border border-transparent hover:border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none pr-1">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest mb-0.5">Mi Cuenta</span>
              <span className="text-sm font-black text-foreground">{profile?.full_name?.split(' ')[0] || 'Cliente'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-[1.5rem] border-white/5 bg-sidebar/95 backdrop-blur-xl p-2 shadow-2xl">
            <div className="px-4 py-3 mb-2 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Sesión activa</p>
              <p className="text-sm font-black text-foreground truncate">{profile?.email}</p>
            </div>
            <DropdownMenuItem
              className="p-3 gap-3 rounded-xl cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 transition-colors"
              onClick={() => logout()}
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
