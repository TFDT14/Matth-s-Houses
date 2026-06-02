import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MODELS, OPTIONS, TVA_RATE, ACOMPTE_RATE, VALIDITY_DAYS, fmtDate } from './products';
import { LOGO_BASE64 } from '../assets/logoBase64';

/* ─── helpers ──────────────────────────────────────────────────── */
function eur(n) {
  // Formatage manuel — espace ASCII pure, aucune dependance a Intl (evite U+202F/U+00A0)
  const abs = Math.abs(n);
  const [intPart, decPart] = abs.toFixed(2).split('.');
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\x20');
  const sign = n < 0 ? '- ' : '';
  return sign + intFmt + ',' + decPart + ' \u20AC';
}

function pad2(n) { return String(n).padStart(2, '0'); }

const pct = (r) => `${Math.round(r * 100)} %`;

/* ─── couleurs ─────────────────────────────────────────────────── */
const NOIR   = [10,  10,  10];
const BLANC  = [255, 255, 255];
const GRIS_1 = [82,  80,  80];
const GRIS_2 = [138, 133, 124];
const LINE   = [232, 230, 224];
const PAPER2 = [250, 250, 249];

/* ─── générateur principal ─────────────────────────────────────── */
export function generateQuotePDF(quoteData) {
  const {
    clientName, phone, modelId, selectedOptions = [],
    modelPrice, modelTransport,
    totalHT, totalTVA, totalTTC, acompte, discount = 0,
    quoteNumber, quoteDate,
  } = quoteData;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();   // 210
  const PL  = 18;
  const PR  = 18;
  const CW  = W - PL - PR;

  doc.setFont('helvetica');

  /* ── HEADER ────────────────────────────────────────────────── */
  let y = 16;

  // Logo MH
  const mhX = W - PR - 28;
  doc.addImage(LOGO_BASE64, 'PNG', mhX, y, 28, 28);

  // "DEVIS"
  doc.setTextColor(...NOIR);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(52);
  doc.text('DEVIS', PL, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRIS_2);
  doc.text(`N° ${quoteNumber}  ·  MARTINIQUE`, PL, y + 26);

  y += 38;

  /* ── DATES ─────────────────────────────────────────────────── */
  const dateObj   = quoteDate instanceof Date ? quoteDate : new Date(quoteDate);
  const dateStr   = fmtDate(dateObj);
  const validDate = new Date(dateObj);
  validDate.setDate(validDate.getDate() + VALIDITY_DAYS);
  const validStr  = fmtDate(validDate);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...NOIR);
  doc.text('Date du devis',     PL,       y);
  doc.text('Validité du devis', PL + 55,  y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRIS_1);
  doc.text(`: ${dateStr}`,  PL + 31, y);
  doc.text(`: ${validStr}`, PL + 86, y);

  y += 10;

  /* ── DIVIDER ────────────────────────────────────────────────── */
  doc.setDrawColor(...NOIR);
  doc.setLineWidth(0.4);
  doc.line(PL, y, W - PR, y);
  y += 8;

  /* ── ÉMETTEUR / DESTINATAIRE ────────────────────────────────── */
  // Gauche
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS_2);
  doc.text('DE', PL, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NOIR);
  doc.text("MATTH'S HOUSES", PL, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRIS_1);
  doc.text('06 96 55 58 27',       PL, y + 11);
  doc.text('matthshouses@gmail.com', PL, y + 16);
  doc.text('Martinique, France',    PL, y + 21);

  // Droite
  const rX = W - PR;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS_2);
  doc.text("A L'ATTENTION DE", rX, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NOIR);
  doc.text(clientName.toUpperCase(), rX, y + 5.5, { align: 'right' });

  if (phone) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRIS_1);
    doc.text(phone, rX, y + 11, { align: 'right' });
  }

  y += 30;

  /* ── TABLEAU ARTICLES ───────────────────────────────────────── */
  const model  = MODELS.find(m => m.id === modelId);
  const mPrice = modelPrice     ?? model?.price     ?? 0;
  const mTrans = modelTransport ?? model?.transport ?? 0;
  const rows   = [];

  if (model) {
    rows.push([`Maison container ${model.label}`, eur(mPrice), pad2(1), eur(mPrice)]);
    rows.push(['Transport & livraison (Martinique)', eur(mTrans), pad2(1), eur(mTrans)]);
  }

  selectedOptions.forEach(({ optionId, quantity, unitPrice }) => {
    if (quantity < 1) return;
    const opt   = OPTIONS.find(o => o.id === optionId);
    if (!opt) return;
    const price = unitPrice ?? opt.price ?? 0;
    if (price === 0) return;   // ne pas afficher les options sans prix défini
    rows.push([opt.label, eur(price), pad2(quantity), eur(price * quantity)]);
  });

  autoTable(doc, {
    startY: y,
    head: [['DESCRIPTION', 'PRIX', 'QTÉ', 'TOTAL']],
    body: rows,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 5 },
      textColor: NOIR,
      lineColor: LINE,
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: false,
      textColor: GRIS_2,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 5, left: 3, right: 5 },
    },
    bodyStyles:          { fillColor: false },
    alternateRowStyles:  { fillColor: PAPER2 },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 40,     halign: 'right' },
      2: { cellWidth: 18,     halign: 'center' },
      3: { cellWidth: 40,     halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: PL, right: PR },
    tableLineColor: NOIR,
    tableLineWidth: 0.4,
  });

  y = doc.lastAutoTable.finalY + 6;

  /* ── TOTAUX ────────────────────────────────────────────────── */
  const totW = 82;
  const totX = W - PR - totW;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  // Sous-total HT
  doc.setTextColor(...GRIS_1);
  doc.text('Sous-total HT', totX, y);
  doc.text(eur(totalHT), W - PR, y, { align: 'right' });

  // Remise (si > 0)
  if (discount > 0) {
    y += 5.5;
    doc.setTextColor(...GRIS_2);
    doc.text('Remise', totX, y);
    doc.text(`- ${eur(discount)}`, W - PR, y, { align: 'right' });
  }

  y += 5.5;
  doc.setTextColor(...GRIS_1);
  doc.text('TVA (8,5 %)', totX, y);
  doc.text(eur(totalTVA), W - PR, y, { align: 'right' });

  y += 9;

  // Bande noire TOTAL TTC — hauteur 15 pour loger un grand montant
  doc.setFillColor(...NOIR);
  doc.roundedRect(totX - 4, y, totW + 8, 15, 1.5, 1.5, 'F');
  doc.setTextColor(...BLANC);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL TTC', totX, y + 9.5);
  doc.setFontSize(12);
  doc.text(eur(totalTTC), W - PR, y + 10, { align: 'right' });

  y += 18;

  // Acompte
  if (acompte && acompte > 0) {
    doc.setFillColor(...PAPER2);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.roundedRect(totX - 4, y, totW + 8, 10, 1, 1, 'FD');
    doc.setTextColor(...GRIS_1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Acompte ${pct(ACOMPTE_RATE)}`, totX, y + 6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(eur(acompte), W - PR, y + 6.5, { align: 'right' });
    y += 13;
  } else {
    y += 3;
  }

  /* ── BAS DE PAGE — termes + signature ──────────────────────── */
  const botY  = y + 4;
  const halfW = CW / 2 - 5;

  // Gauche : termes
  doc.setTextColor(...NOIR);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Termes et conditions', PL, botY);

  const termes = [
    `· Un acompte de ${pct(ACOMPTE_RATE)} est requis à la commande`,
    `· Validité du devis : ${VALIDITY_DAYS} jours`,
    '· Livraison en Martinique incluse',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRIS_1);
  termes.forEach((t, i) => doc.text(t, PL, botY + 7 + i * 5.5));

  // Note provisoire
  const noteY = botY + 27;
  doc.setFillColor(...PAPER2);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.roundedRect(PL, noteY, halfW, 18, 1.5, 1.5, 'FD');
  doc.setDrawColor(...NOIR);
  doc.setLineWidth(1.2);
  doc.line(PL, noteY + 1, PL, noteY + 17);
  doc.setLineWidth(0.25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...NOIR);
  doc.text('Note —', PL + 4, noteY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRIS_1);
  const noteText = doc.splitTextToSize(
    "L'Équipe MH vous informe que ce devis est provisoire et que le définitif sera délivré uniquement après la visite du terrain par le transporteur.",
    halfW - 8,
  );
  doc.setFontSize(7.5);
  doc.text(noteText, PL + 4, noteY + 10);

  // Droite : signature
  const sigX = PL + halfW + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NOIR);
  const sigLabel = doc.splitTextToSize(
    'Signature suivie de la mention « bon pour accord »',
    halfW,
  );
  doc.text(sigLabel, sigX + halfW / 2, botY + 5, { align: 'center' });

  const lineY = botY + 24;
  doc.setDrawColor(...NOIR);
  doc.setLineWidth(0.4);
  doc.line(sigX, lineY, sigX + halfW, lineY);

  /* ── FOOTER ────────────────────────────────────────────────── */
  const footerY = Math.max(noteY + 26, lineY + 10) + 8;
  doc.setDrawColor(...NOIR);
  doc.setLineWidth(0.4);
  doc.line(PL, footerY, W - PR, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...NOIR);
  doc.text('MERCI DE VOTRE CONFIANCE', W / 2, footerY + 5.5, { align: 'center' });

  return doc;
}

export function downloadPDF(quoteData) {
  const doc  = generateQuotePDF(quoteData);
  const name = `${quoteData.quoteNumber}-${quoteData.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(name);
}
