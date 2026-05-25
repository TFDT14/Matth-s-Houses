export const MODELS = [
  { id: '20m2', label: '20m²', price: 21945, transport: 6000 },
  { id: '37m2', label: '37m²', price: 25425, transport: 8000 },
  { id: '56m2', label: '56m²', price: 35365, transport: 10000 },
  { id: '74m2', label: '74m²', price: 43495, transport: 12000 },
];

export const OPTIONS = [
  { id: 'porte_double_alu',    label: 'Porte double battant alu', price: 463.86 },
  { id: 'porte_simple',        label: 'Porte simple',             price: 277.60 },
  { id: 'porte_coulissante',   label: 'Porte coulissante',        price: 463.86 },
  { id: 'porte_grille',        label: 'Porte grille',             price: 347.59 },
  { id: 'porte_bois_nb',       label: 'Porte bois noir/blanc',    price: 70.00  },
  { id: 'porte_bois_simple',   label: 'Porte bois simple',        price: 70.00  },
  { id: 'porte_bois_marron',   label: 'Porte bois marron',        price: 70.00  },
  { id: 'fenetre_coulissante', label: 'Fenêtre coulissante',      price: 70.00  },
  { id: 'fenetre_grille',      label: 'Fenêtre grille',           price: 138.80 },
  { id: 'meubles_hauts',       label: 'Meubles hauts',            price: 185.07 },
  { id: 'mur_vitre',           label: 'Mur vitré',                price: 742.64 },
];

export const TVA_RATE     = 0.085;
export const ACOMPTE_RATE = 0.40;
export const VALIDITY_DAYS = 30;

export function calculateTotals(modelId, selectedOptions = []) {
  const model = MODELS.find(m => m.id === modelId);
  if (!model) return { ht: 0, tva: 0, ttc: 0, acompte: 0 };

  let ht = model.price + model.transport;

  selectedOptions.forEach(({ optionId, quantity }) => {
    if (quantity > 0) {
      const opt = OPTIONS.find(o => o.id === optionId);
      if (opt) ht += opt.price * quantity;
    }
  });

  const tva    = round(ht * TVA_RATE);
  const ttc    = round(ht + tva);
  const acompte = round(ttc * ACOMPTE_RATE);

  return { ht: round(ht), tva, ttc, acompte };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

export function fmt(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(d) {
  return new Intl.DateTimeFormat('fr-FR').format(d instanceof Date ? d : new Date(d));
}
