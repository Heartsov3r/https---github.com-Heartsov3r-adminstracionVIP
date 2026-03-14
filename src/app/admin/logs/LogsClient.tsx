'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClientDateTime } from '@/components/ui/client-datetime'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Activity, Clock, ShieldCheck, User } from 'lucide-react'
import { PaginationControls } from '@/components/ui/pagination-controls'

const ITEMS_PER_PAGE = 20

export function LogsClient({ logs }: { logs: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const allFilteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesAction = actionFilter === 'all' || log.action_type === actionFilter

      return matchesSearch && matchesAction
    })
  }, [logs, searchTerm, actionFilter])

  const totalPages = Math.ceil(allFilteredLogs.length / ITEMS_PER_PAGE)
  
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return allFilteredLogs.slice(start, start + ITEMS_PER_PAGE)
  }, [allFilteredLogs, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, actionFilter])

  const actionTypes = useMemo(() => {
    const types = new Set(logs.map(log => log.action_type))
    return Array.from(types).sort()
  }, [logs])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <Input 
            placeholder="Buscar por descripción o admin..." 
            className="pl-12 h-14 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all font-medium shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Action Filter */}
        <div className="glass-card flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5 bg-white/5 shadow-xl">
           <Filter className="w-5 h-5 text-muted-foreground" />
           <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Tipo de Acción</p>
             <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-6 bg-transparent border-none focus:ring-0 text-sm font-bold p-0">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10 bg-zinc-900/95 backdrop-blur-xl">
                  <SelectItem value="all" className="text-sm font-bold">Todas las acciones</SelectItem>
                  {actionTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-sm font-mono">{type}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
           </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl animate-in fade-in duration-700">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground italic">Fecha / Hora</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Administrador</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Acción</TableHead>
              <TableHead className="py-6 px-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2 text-sm font-medium tabular-nums text-foreground/80">
                      <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                      <ClientDateTime 
                        date={log.created_at} 
                        options={{ 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        }} 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate">{log.admin?.full_name || 'Desconocido'}</span>
                        <span className="text-[10px] text-muted-foreground font-medium truncate opacity-60">{log.admin?.email || ''}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-[10px] font-mono font-black border border-white/10 px-2 py-1 rounded-md bg-white/5 text-muted-foreground uppercase tracking-wider">
                      {log.action_type}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-md">
                      {log.description}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-60 text-center text-muted-foreground bg-muted/5">
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    <Activity className="w-12 h-12" />
                    <p className="font-black text-sm uppercase tracking-[0.2em] italic">No hay registros que coincidan</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
             <PaginationControls 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
             />
          </div>
        )}
      </div>
    </div>
  )
}
