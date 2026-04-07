import { jsPDF } from 'jspdf';

/**
 * Genera un ticket PDF con el diseño exacto de JessicaAleSuarez
 * @param {Object} pedidoData - Datos del pedido
 * @returns {jsPDF} - Objeto PDF
 */
export const generateTicketPDF = (pedidoData) => {
  // Calcular altura dinámica basada en número de productos
  const baseHeight = 150; // Altura base del ticket
  const heightPerProduct = 15; // Altura aproximada por producto (incluyendo colores)
  const totalProducts = pedidoData.productos?.length || 0;
  const totalColores = pedidoData.productos?.reduce((sum, p) => sum + (p.colores?.length || 0), 0) || 0;
  const dynamicHeight = Math.max(200, baseHeight + (totalProducts * 10) + (totalColores * 4));

  // Crear PDF tamaño ticket térmico (80mm ancho, altura dinámica)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, dynamicHeight]
  });

  let yPos = 5; // Posición vertical inicial
  const leftMargin = 5;
  const rightMargin = 75;
  const centerX = 40;

  // ===== HEADER CON LOGO =====
  // Logo (si existe)
  try {
    const logoPath = '/logo-ticket.png';
    const logoWidth = 20;
    const logoHeight = 20;
    doc.addImage(logoPath, 'PNG', centerX - logoWidth / 2, yPos, logoWidth, logoHeight);
    yPos += logoHeight + 3;
  } catch (error) {
    console.warn('Logo no encontrado, usando texto:', error);
  }

  // Título "JessicaAleSuarez"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('JessicaAleSuarez', centerX, yPos, { align: 'center' });
  yPos += 6;

  // Dirección
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Plaza de la Tecnología', centerX, yPos, { align: 'center' });
  yPos += 3.5;
  doc.text('Local 26 Entrada sobre Uruguay 11', centerX, yPos, { align: 'center' });
  yPos += 3.5;
  doc.text('Con salida al pasillo 2', centerX, yPos, { align: 'center' });
  yPos += 5;

  // Línea separadora
  doc.setLineWidth(0.3);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 5;

  // ===== CLIENTE =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Cliente:', leftMargin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(pedidoData.clienteNombre || 'LOCAL', leftMargin, yPos);
  yPos += 6;

  // Usuario, Fecha, No. (alineados a la derecha)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  doc.text('Usuario:', leftMargin, yPos);
  doc.text(pedidoData.usuario || 'N/A', rightMargin, yPos, { align: 'right' });
  yPos += 4;

  doc.text('Fecha:', leftMargin, yPos);
  const fecha = pedidoData.fecha ? new Date(pedidoData.fecha).toLocaleString('es-MX') : new Date().toLocaleString('es-MX');
  doc.text(fecha, rightMargin, yPos, { align: 'right' });
  yPos += 4;

  doc.text('No.', leftMargin, yPos);
  doc.text(pedidoData.numeroOrden || 'N/A', rightMargin, yPos, { align: 'right' });
  yPos += 5;

  // Línea separadora
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 5;

  // ===== TABLA DE PRODUCTOS =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  
  // Headers de tabla
  doc.text('PRODUCTO', leftMargin, yPos);
  doc.text('CANTIDAD', 35, yPos, { align: 'center' });
  doc.text('P/PIEZA', 50, yPos, { align: 'center' });
  doc.text('TOTAL', rightMargin - 5, yPos, { align: 'right' });
  yPos += 4;

  // Productos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  pedidoData.productos.forEach(producto => {
    // Nombre del producto
    doc.setFont('helvetica', 'bold');
    doc.text(producto.nombre, leftMargin, yPos);
    yPos += 3.5;

    // Colores con indentación
    doc.setFont('helvetica', 'normal');
    producto.colores.forEach(colorData => {
      // Si no hay color, mostrar "N/A"
      const colorText = `  - ${colorData.color || 'N/A'}`;
      doc.text(colorText, leftMargin + 2, yPos);
      doc.text(colorData.cantidad.toString(), 35, yPos, { align: 'center' });
      doc.text(`$${colorData.precio.toFixed(2)}`, 50, yPos, { align: 'center' });
      doc.text(`$${(colorData.cantidad * colorData.precio).toFixed(2)}`, rightMargin - 5, yPos, { align: 'right' });
      yPos += 3.5;
    });

    yPos += 2; // Espacio entre productos
  });

  yPos += 3;

  // Línea separadora
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 5;

  // ===== TOTALES =====
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  doc.text('Total de artículos:', leftMargin, yPos);
  doc.text(pedidoData.totalArticulos.toString(), rightMargin, yPos, { align: 'right' });
  yPos += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Precio total con IVA:', leftMargin, yPos);
  doc.text(`$${pedidoData.totalConIVA.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
  yPos += 6;

  // Línea separadora
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 5;

  // ===== GARANTÍA =====
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  
  const garantiaText = [
    '7 DÍAS DE GARANTIA CON TICKET ORIGINAL',
    '(DEFECTOM EN ESTUCHE O PARTES SOLO',
    'DEFECTOS DE FABRICA NO ROTO NO',
    'MALTRATADO NO HAY CAMBIOS NI',
    'DEVOLUCIONES MENORES A $50 MXN NO HAY',
    'GARANTIA',
    'DE LUNES A SABADO DE 11AM A 6PM'
  ];

  garantiaText.forEach(line => {
    doc.text(line, centerX, yPos, { align: 'center' });
    yPos += 3;
  });

  return doc;
};

/**
 * Abre el PDF en una nueva ventana para imprimir
 * @param {Object} pedidoData - Datos del pedido
 */
export const openTicketPDF = (pedidoData) => {
  const doc = generateTicketPDF(pedidoData);
  
  // Abrir en nueva ventana
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  window.open(pdfUrl, '_blank');
};

/**
 * Descargar PDF (opcional)
 * @param {Object} pedidoData - Datos del pedido
 */
export const downloadTicketPDF = (pedidoData) => {
  const doc = generateTicketPDF(pedidoData);
  doc.save(`ticket-${pedidoData.numeroOrden}.pdf`);
};
