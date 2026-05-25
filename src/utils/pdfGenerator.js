import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MODELS, OPTIONS, TVA_RATE, VALIDITY_DAYS, fmt, fmtDate } from './products';

const COMPANY = {
  name:    "MATTH'S HOUSES",
  legal:   'SARL',
  address: 'Martinique, France',
  email:   'contact@matthshouses.mq',
};

export function generateQuotePDF(quoteData) {
  const {
    clientName, phone, modelId, selectedOptions = [],
    totalHT, totalTVA, totalTTC, acompte,
    quoteNumber, quoteDate,
  } = quoteData;

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = doc.internal.pageSize.getWidth();
  const H    = doc.internal.pageSize.getHeight();
  const M    = 14;

  // ── WATERMARK ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(110);
  doc.setTextColor(245, 245, 245);
  doc.text('MH', W / 2, H / 2, { align: 'center', baseline: 'middle' });

  // ── RED DOTTED BORDER ──────────────────────────────────────
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.7);
  doc.setLineDash([3, 2.5], 0);
  doc.rect(M - 4, M - 4, W - (M - 4) * 2, H - (M - 4) * 2);
  doc.setLineDash([], 0);

  let y = M + 2;

  // ── LOGO BLOC ──────────────────────────────────────────────
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(M, y, 26, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MH', M + 13, y + 12, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(COMPANY.name, M + 30, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`${COMPANY.legal} • ${COMPANY.address}`, M + 30, y + 13);
  doc.text(COMPANY.email, M + 30, y + 18);

  // ── GRAND "DEVIS" ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  doc.setTextColor(220, 38, 38);
  doc.text('DEVIS', W - M, y + 14, { align: 'right' });
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(quoteNumber, W - M, y + 20, { align: 'right' });

  y += 26;

  // ── LIGNE ROUGE ───────────────────────────────────────────
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.4);
  doc.line(M, y, W - M, y);
  y += 5;

  // ── DATE / VALIDITÉ ───────────────────────────────────────
  const dateObj    = quoteDate instanceof Date ? quoteDate : new Date(quoteDate);
  const validUntil = new Date(dateObj);
  validUntil.setDate(validUntil.getDate() + VALIDITY_DAYS);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Date : ${fmtDate(dateObj)}`, M, y + 4);
  doc.text(`Valide jusqu'au : ${fmtDate(validUntil)}`, M + 60, y + 4);
  y += 10;

  // ── BLOC CLIENT ───────────────────────────────────────────
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, W - M * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.text('CLIENT', M + 4, y + 6);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(clientName, M + 4, y + 13);
  if (phone) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Tél : ${phone}`, M + 4, y + 19);
  }

  const model = MODELS.find(m => m.id === modelId);
  if (model) {
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(W - M - 36, y + 6, 36, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Modèle ${model.label}`, W - M - 18, y + 12.5, { align: 'center' });
  }

  y += 28;

  // ── TABLEAU ARTICLES ──────────────────────────────────────
  const rows = [];
  if (model) {
    rows.push([`Maison container ${model.label}`, fmt(model.price), '1', fmt(model.price)]);
    rows.push(['Transport & livraison (Martinique)', fmt(model.transport), '1', fmt(model.transport)]);
  }
  selectedOptions.forEach(({ optionId, quantity }) => {
    if (quantity < 1) return;
    const opt = OPTIONS.find(o => o.id === optionId);
    if (!opt) return;
    rows.push([opt.label, fmt(opt.price), String(quantity), fmt(opt.price * quantity)]);
  });

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Prix unitaire HT', 'Qté', 'Total HT']],
    body: rows,
    theme: 'grid',
    styles:     { font: 'helvetica', fontSize: 8.5, cellPadding: 3.5, textColor: [30, 30, 30], lineColor: [215, 215, 215] },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 38, halign: 'right' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 38, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: M, right: M },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── TOTAUX ────────────────────────────────────────────────
  const tX = W - M - 78;
  const tW = 78;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Total HT :', tX + 6, y + 5);
  doc.text(fmt(totalHT), tX + tW - 2, y + 5, { align: 'right' });
  doc.text(`TVA (${(TVA_RATE * 100).toFixed(1)}%) :`, tX + 6, y + 11);
  doc.text(fmt(totalTVA), tX + tW - 2, y + 11, { align: 'right' });

  y += 14;

  // Barre noire TTC
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(tX, y, tW, 13, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL TTC :', tX + 6, y + 8.5);
  doc.text(fmt(totalTTC), tX + tW - 3, y + 8.5, { align: 'right' });

  y += 16;

  // Barre rouge acompte
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(tX, y, tW, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Acompte 40% :', tX + 6, y + 6.5);
  doc.text(fmt(acompte), tX + tW - 3, y + 6.5, { align: 'right' });

  y += 16;

  // ── CONDITIONS ────────────────────────────────────────────
  if (y < H - 55) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, W / 2 - M - 4, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    doc.text('CONDITIONS DE VENTE', M + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text('• Acompte 40% à la commande', M + 4, y + 11);
    doc.text('• Validité : 30 jours', M + 4, y + 15.5);
    doc.text('• Prix HT + TVA 8,5%', M + 64, y + 11);
    doc.text('• Livraison en Martinique incluse', M + 64, y + 15.5);
    y += 22;
  }

  // ── ZONE SIGNATURES ───────────────────────────────────────
  const sigY = Math.max(y, H - 42);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  doc.roundedRect(M, sigY, 72, 27, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Signature client', M + 4, sigY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Bon pour accord, lu et approuvé', M + 4, sigY + 11);
  doc.text('Date : _____ / _____ / ________', M + 4, sigY + 23);

  doc.roundedRect(W - M - 72, sigY, 72, 27, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Signature Matth's Houses", W - M - 68, sigY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Responsable commercial', W - M - 68, sigY + 11);

  // ── PIED DE PAGE ──────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `MATTH'S HOUSES SARL • Martinique • ${quoteNumber} • Émis le ${fmtDate(dateObj)}`,
    W / 2, H - 7, { align: 'center' }
  );

  return doc;
}

export function downloadPDF(quoteData) {
  const doc = generateQuotePDF(quoteData);
  const name = `${quoteData.quoteNumber}-${quoteData.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(name);
}
