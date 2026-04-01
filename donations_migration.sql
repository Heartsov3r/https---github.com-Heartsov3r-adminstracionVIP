-- Tabla de Donaciones (Módulo VIP)
create table public.donations (
    id uuid default gen_random_uuid() primary key,
    
    -- Monto de la donación
    amount numeric not null check (amount > 0),
    
    -- Método de pago (vinculado a la tabla estandar payment_methods)
    payment_method_id uuid references public.payment_methods(id) on delete set null,
    
    -- Información del Donante (Puede ser un usuario registrado o un nombre manual)
    donor_id uuid references public.profiles(id) on delete set null,
    donor_name text,
    
    -- Campos OBLIGATORIOS por transparencia
    reason text not null,
    receipt_url text not null,
    
    -- Auditoría Administrativa
    registered_by uuid not null references public.profiles(id) on delete restrict,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS (Row Level Security)
-- Solo los administradores pueden gestionar o ver el historial completo de donaciones de manera general en el panel.
alter table public.donations enable row level security;

create policy "Administradores pueden ver todas las donaciones"
    on public.donations for select
    using ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin') );

create policy "Administradores pueden insertar donaciones"
    on public.donations for insert
    with check ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin') );

create policy "Administradores pueden actualizar donaciones"
    on public.donations for update
    using ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin') );

create policy "Administradores pueden eliminar donaciones"
    on public.donations for delete
    using ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin') );
