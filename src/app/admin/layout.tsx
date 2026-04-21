'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { getCurrentAdmin } from './actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  LayoutDashboard,
  CreditCard,
  CalendarDays,
  Activity,
  Grid,
  Menu,
  X,
  LogOut,
  ChevronDown,
  UserPlus,
  User,
  BarChart3,
  FileText,
  Wallet,
  Heart,
  KeyRound
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<{ full_name?: string, email?: string } | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    async function loadAdmin() {
      const { data } = await getCurrentAdmin()
      if (data) setAdmin(data)
    }
    loadAdmin()
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Planes', href: '/admin/plans', icon: CalendarDays },
    { name: 'Pagos', href: '/admin/payments', icon: CreditCard },
    { name: 'Donaciones', href: '/admin/donations', icon: Heart },
    { name: 'Métodos de Pago', href: '/admin/payment-methods', icon: Wallet },
    { name: 'Recibos', href: '/admin/receipts', icon: FileText },
    { name: 'Reportes', href: '/admin/reports', icon: BarChart3 },
    { name: 'Logs', href: '/admin/logs', icon: Activity },
    { name: 'Cuentas', href: '/admin/accounts', icon: KeyRound },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Sidebar Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border shadow-2xl transition-transform duration-300 ease-in-out
        sm:translate-x-0 sm:static sm:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-8 gap-3">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
               <Grid className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Membresías VIP
            </span>
            <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto sm:hidden text-muted-foreground"
                onClick={() => setIsSidebarOpen(false)}
            >
                <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${isActive(item.href) 
                    ? 'premium-gradient text-white shadow-lg shadow-primary/20' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="p-6 border-t border-sidebar-border bg-sidebar-accent/20">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-6 h-6" />
                 </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-sm font-bold truncate">{admin?.full_name || 'Admin VIP'}</span>
                   <span className="text-xs text-muted-foreground truncate">{admin?.email || 'admin@maxton.com'}</span>
                </div>
             </div>
             <form action={logout}>
                <Button 
                    variant="secondary" 
                    className="w-full bg-sidebar-accent hover:bg-red-500/10 hover:text-red-500 border-none transition-all gap-2 h-11 rounded-xl font-bold"
                    type="submit"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
             </form>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-20 sticky top-0 z-30 bg-background/60 backdrop-blur-xl border-b flex items-center px-4 sm:px-8 shrink-0 justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="sm:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </Button>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-8 w-px bg-border mx-1 hidden sm:block invisible"></div>

                 <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted/50 transition-colors focus:outline-none shrink-0 border border-transparent hover:border-border">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                           <User className="w-5 h-5" />
                        </div>
                       <div className="hidden sm:flex flex-col items-start leading-none pr-1">
                          <span className="text-[11px] font-black uppercase text-primary tracking-widest mb-0.5">Admin</span>
                          <span className="text-sm font-black text-foreground">{admin?.full_name?.split(' ')[0] || 'Admin'}</span>
                       </div>
                       <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2 rounded-[1.5rem] border-white/5 bg-sidebar/95 backdrop-blur-xl p-2 shadow-2xl">
                    <div className="px-4 py-3 mb-2 border-b border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Sesión Iniciada como</p>
                        <p className="text-sm font-black text-foreground truncate">{admin?.email}</p>
                    </div>
                    
                     <Link href="/admin/profile">
                        <DropdownMenuItem className="p-3 gap-3 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Ver Mi Perfil</span>
                                <span className="text-[10px] text-muted-foreground">Gestionar tus datos</span>
                            </div>
                        </DropdownMenuItem>
                    </Link>
                    



                    <div className="my-2 border-t border-white/5" />

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
            </div>
        </header>
        
        <div className="flex-1 overflow-y-auto bg-background/50">
            <div className="mx-auto w-full">
                {children}
            </div>
        </div>
      </main>
    </div>
  )
}
