// Se corrige la ruta en src\app\admin\users\actions.ts
import { fetchUsers } from './actions'
import { fetchPlans } from '@/app/admin/plans/actions'

import { UsersTable } from './UsersTable'
import { CreateUserModal } from './CreateUserModal'

export default async function UsersPage() {
  const { data: users, error } = await fetchUsers()
  const { data: plans } = await fetchPlans()

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra clientes, asigna roles o elimina cuentas.</p>
        </div>
        <CreateUserModal plans={plans || []} />
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Error cargando usuarios: {error}
        </div>
      ) : (
        <UsersTable users={users || []} plans={plans || []} />
      )}
    </div>
  )
}
