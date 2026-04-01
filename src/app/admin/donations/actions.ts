'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function fetchDonations() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('donations')
    .select(`
      id,
      amount,
      reason,
      receipt_url,
      donation_date,
      created_at,
      donor_id,
      donor_name,
      profiles!donor_id (
        id,
        full_name,
        email
      ),
      payment_methods (
        id,
        name,
        details
      ),
      registered_by_admin:profiles!registered_by (
        id,
        full_name
      )
    `)
    .order('donation_date', { ascending: false })

  if (error) {
    console.error('Error fetching donations:', JSON.stringify(error, null, 2))
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function registerDonation(formData: FormData) {
  const supabase = await createClient()

  // Campos básicos
  const amountStr = formData.get('amount') as string
  const reason = formData.get('reason') as string
  const file = formData.get('file') as File | null
  
  // Campos opcionales (Donante)
  const donorId = formData.get('donorId') as string // UUID del select (si eligieron de la base)
  const donorName = formData.get('donorName') as string // Nombre manual si no es usuario registrado
  const paymentMethodId = formData.get('paymentMethodId') as string // UUID del método de pago

  if (!amountStr || !reason || !file || file.size === 0) {
    return { error: 'El monto, el motivo y el comprobante de donación son obligatorios.' }
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    return { error: 'El monto ingresado no es válido.' }
  }

  // Get current Admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No tienes sesión activa como administrador.' }
  }

  // Subir el archivo al bucket "receipts" (reutilizando el existente)
  const fileExt = file.name.split('.').pop()
  const fileName = `donations/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(fileName, file)

  if (uploadError) {
    return { error: `Error subiendo comprobante: ${uploadError.message}` }
  }

  const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
  const receiptUrl = publicUrlData.publicUrl

  // Insertar en Base de Datos
  const insertData: any = {
    amount,
    reason,
    receipt_url: receiptUrl,
    registered_by: user.id
  }

  if (paymentMethodId && paymentMethodId !== 'none') insertData.payment_method_id = paymentMethodId
  if (donorId && donorId !== 'none') insertData.donor_id = donorId
  if (donorName && donorName.trim() !== '') insertData.donor_name = donorName.trim()

  const { data: insertedData, error: dbError } = await supabase
    .from('donations')
    .insert(insertData)
    .select('id')
    .single()

  if (dbError) {
    return { error: `Error registrando donación en base de datos: ${dbError.message}` }
  }

  // Auditar
  const donorRef = (donorName && donorName.trim()) ? donorName : (donorId !== 'none' ? 'Usuario Registrado' : 'Anónimo')
  await logAdminAction('REGISTER_DONATION', `Se registró una donación de $${amount} de ${donorRef}. Motivo: ${reason}`, insertedData.id)

  revalidatePath('/admin/donations')
  return { success: true }
}

export async function deleteDonation(donationId: string, reason_for_deletion: string) {
  const supabase = await createClient()

  if (!reason_for_deletion || reason_for_deletion.trim() === '') {
    return { error: 'Debes proporcionar un motivo para eliminar la donación.' }
  }

  const { error } = await supabase.from('donations').delete().eq('id', donationId)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('DELETE_DONATION', `Se eliminó una donación del sistema de forma manual. Motivo: ${reason_for_deletion}`, donationId)

  revalidatePath('/admin/donations')
  return { success: true }
}
