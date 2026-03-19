interface ReceiptData {
  folio: string
  customerName: string
  customerPhone: string
  planName: string
  planDays: number
  amount: number
  date: string
  adminName: string
  notes?: string
  paymentMethod?: {
    name: string
    details: string
    owner_name: string
    type: string
    country?: string | null
  } | null
  planPrice?: number
  remainingBalance?: number
  companyName?: string
  companyRuc?: string
  companyAddress?: string
}

export async function generateReceiptPDF(data: ReceiptData): Promise<any> {
  const { jsPDF } = await import('jspdf')
  // Configuración del ticket (80mm ancho x alto dinámico aproximado)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 220] // Aumentado ligeramente el alto para el nuevo bloque
  })

  const margin = 5
  const width = 80
  let y = 15

  // 1. Cabecera - Nombre Empresa
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(data.companyName || 'MEMBRESÍAS VIP', width / 2, y, { align: 'center' })
  
  y += 6
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('COMPROBANTE ELECTRÓNICO', width / 2, y, { align: 'center' })
  
  y += 6
  doc.setLineDashPattern([1, 1], 0)
  doc.line(margin, y, width - margin, y)
  y += 6

  y += 6
  doc.setLineDashPattern([1, 1], 0)
  doc.line(margin, y, width - margin, y)
  y += 6

  // 2. Información del Folio y Fecha
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`FOLIO: REC-${data.folio}`, margin, y)
  
  doc.setFont('helvetica', 'normal')
  doc.text(`FECHA: ${data.date}`, width - margin, y, { align: 'right' })

  y += 8

  // 3. Datos del Cliente
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE:', margin, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(data.customerName.toUpperCase(), margin, y)
  y += 4
  doc.setFontSize(7)
  doc.text(`Telf: ${data.customerPhone}`, margin, y)

  y += 8
  doc.line(margin, y, width - margin, y)
  y += 6

  // 4. Detalle del Plan
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DESCRIPCIÓN', margin, y)
  doc.text('TOTAL', width - margin, y, { align: 'right' })

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(data.planName, margin, y)
  doc.text(`$ ${data.amount.toFixed(2)}`, width - margin, y, { align: 'right' })
  y += 4
  doc.setFontSize(7)
  doc.setTextColor(100)
  doc.text(`Servicio VIP por ${data.planDays} días`, margin, y)
  doc.setTextColor(0)

  y += 8

  // 5. Total Destacado (Desglose de Abono y Saldo)
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, width - (margin * 2), 16, 'F')
  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ABONO RECIBIDO:', margin + 2, y)
  doc.text(`$ ${data.amount.toFixed(2)}`, width - margin - 2, y, { align: 'right' })

  if (data.planPrice !== undefined && data.planPrice > data.amount) {
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text('Costo Total del Plan:', margin + 2, y)
    doc.text(`$ ${data.planPrice.toFixed(2)}`, width - margin - 2, y, { align: 'right' })
    
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 0, 0) // Rojo para el saldo
    doc.text('SALDO PENDIENTE:', margin + 2, y)
    doc.text(`$ ${(data.remainingBalance !== undefined ? data.remainingBalance : (data.planPrice - data.amount)).toFixed(2)}`, width - margin - 2, y, { align: 'right' })
    doc.setTextColor(0)
  }

  y += 10

  // 5.5 Información del Método de Pago (NUEVO)
  if (data.paymentMethod) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('MÉTODO DE PAGO:', width / 2, y, { align: 'center' })
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`${data.paymentMethod.name} ${data.paymentMethod.country ? `(${data.paymentMethod.country})` : ''}: MEMBRESÍAS VIP`, width / 2, y, { align: 'center' })
    y += 8
    doc.line(margin, y, width - margin, y)
    y += 6
  }


  // 7. Footer
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0, 150, 0) // Verde éxito
  doc.text('¡PAGO COMPLETADO EXITOSAMENTE!', width / 2, y, { align: 'center' })
  
  y += 6
  doc.setTextColor(0)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(`Atendido por: ${data.adminName}`, width / 2, y, { align: 'center' })
  
  y += 8
  doc.setFontSize(6)
  doc.setTextColor(150)
  doc.text('Gracias por su preferencia.', width / 2, y, { align: 'center' })

  return doc
}
