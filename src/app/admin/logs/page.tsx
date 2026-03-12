import { fetchAdminLogs } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AdminLogsPage() {
  const { data: logs, error } = await fetchAdminLogs()

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-red-500">No se pudieron cargar los registros: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Registro de Actividades</h1>
        <p className="text-muted-foreground">Historial de las acciones administrativas sobre planes, usuarios y pagos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Administradores</CardTitle>
          <CardDescription>Visualiza qué administrador realizó las acciones y cuándo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha / Hora</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{log.admin?.full_name || 'Desconocido'}</span>
                      <p className="text-xs text-muted-foreground">{log.admin?.email || ''}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono bg-muted p-1 rounded">
                        {log.action_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No hay actividades registradas aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
