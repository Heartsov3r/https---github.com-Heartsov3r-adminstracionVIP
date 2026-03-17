'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'


export async function fetchMembershipsForPayments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      id,
      start_date,
      end_date,
      created_at,
      profiles (
        id,
        full_name,
        email,
        phone
      ),
      plans (
        id,
        name,
        price,
        duration_days
      ),
      manual_payments (
        id,
        amount,
        payment_date,
        notes,
        payment_methods (
          id,
          name,
          details,
          owner_name,
          type
        ),
        payment_receipts (
          id,
          file_url
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching memberships:', JSON.stringify(error, null, 2))
    return { data: null, error: error.message || 'Error desconocido en la consulta' }
  }

  return { data, error: null }
}

export async function registerPayment(formData: FormData) {
  const supabase = await createClient()
  
  const membershipId = formData.get('membershipId') as string
  const amountStr = formData.get('amount') as string
  const paymentMethodId = formData.get('paymentMethodId') as string
  const file = formData.get('file') as File | null
  
  if (!membershipId || !amountStr) {
    return { error: 'El ID de la membresía y el monto son obligatorios.' }
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    return { error: 'El monto ingresado no es válido.' }
  }

  // Obtenemos el admin_id (usuario actual)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No tienes sesión activa.' }
  }

  // 1. Insertamos el pago manual
  const { data: paymentData, error: paymentError } = await supabase
    .from('manual_payments')
    .insert({
      membership_id: membershipId,
      amount: amount,
      registered_by: user.id,
      payment_method_id: paymentMethodId || null
    })
    .select('id')
    .single()

  if (paymentError) {
    return { error: `Error guardando pago: ${paymentError.message}` }
  }

  // 2. Si se adjuntó un archivo, lo subimos
  if (file && file.size > 0 && paymentData) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${paymentData.id}-${Date.now()}.${fileExt}`
    const filePath = `payments/${fileName}`
    
    // Subida a Supabase Storage (búcket "receipts")
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Warning: Payment created but receipt upload failed:', uploadError)
    } else {
      // Si el archivo sube, insertamos en payment_receipts
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath)
      
      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          payment_id: paymentData.id,
          file_url: publicUrlData.publicUrl,
          storage_path: filePath
        })
        
      if (receiptError) {
          console.error("Error linking publicUrl:", receiptError)
      }
    }
  }

  // Recuperar info para el LOG
  const { data: mData } = await supabase.from('memberships').select('profiles(full_name), plans(name)').eq('id', membershipId).single()
  const dProfile: any = mData?.profiles
  const dPlan: any = mData?.plans
  
  await logAdminAction(
    'REGISTER_PAYMENT', 
    `Registró un cobro de $${amount} a ${dProfile?.full_name || 'Desconocido'} por el plan ${dPlan?.name || 'Manual'}`, 
    membershipId
  )

  revalidatePath('/admin/payments')
  revalidatePath(`/admin/users`) 
  return { success: true }
}

export async function updatePayment(formData: FormData) {
  const supabase = await createClient()
  const paymentId = formData.get('paymentId') as string
  const amountStr = formData.get('amount') as string
  const paymentMethodId = formData.get('paymentMethodId') as string
  const reason = formData.get('reason') as string

  if (!paymentId || !amountStr) return { error: 'Datos incompletos.' }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) return { error: 'Monto inválido.' }

  // Obtener info previa para el log
  const { data: oldPayment } = await supabase
    .from('manual_payments')
    .select('amount, membership_id, profiles!registered_by(full_name)')
    .eq('id', paymentId)
    .single()

  const { error } = await supabase
    .from('manual_payments')
    .update({
      amount: amount,
      payment_method_id: paymentMethodId || null
    })
    .eq('id', paymentId)

  if (error) return { error: error.message }

  await logAdminAction(
    'UPDATE_PAYMENT',
    `EDITÓ pago ID ${paymentId.slice(0,8)}: De $${oldPayment?.amount} a $${amount}. Motivo: ${reason || 'No especificado'}`,
    oldPayment?.membership_id
  )

  revalidatePath('/admin/payments')
  return { success: true }
}

export async function deletePayment(paymentId: string, reason: string) {
  const supabase = await createClient()

  // 1. Obtener info del pago y recibos antes de borrar
  const { data: payment } = await supabase
    .from('manual_payments')
    .select('id, amount, membership_id, payment_receipts(storage_path)')
    .eq('id', paymentId)
    .single()

  if (!payment) return { error: 'Pago no encontrado.' }

  // 2. Borrar archivos del storage si existen
  if (payment.payment_receipts && payment.payment_receipts.length > 0) {
    for (const receipt of payment.payment_receipts) {
      if (receipt.storage_path) {
        await supabase.storage.from('receipts').remove([receipt.storage_path])
      }
    }
  }

  // 3. Borrar registro de la DB (RLS y cascade se encargan del resto)
  const { error: deleteError } = await supabase
    .from('manual_payments')
    .delete()
    .eq('id', paymentId)

  if (deleteError) return { error: deleteError.message }

  await logAdminAction(
    'DELETE_PAYMENT',
    `ELIMINÓ pago de $${payment.amount}. Motivo: ${reason || 'Error de registro'}`,
    payment.membership_id
  )

  revalidatePath('/admin/payments')
  return { success: true }
}
