export const MODELS = [
  { id: '20m2', label: '20m²', price: 21945, transport: 6000 },
  { id: '37m2', label: '37m²', price: 25425, transport: 8000 },
  { id: '56m2', label: '56m²', price: 35365, transport: 10000 },
  { id: '74m2', label: '74m²', price: 43495, transport: 12000 },
];

export const OPTIONS = [
  // Portes
  { id: 'porte_double_alu',    label: 'Porte double battant aluminium',           price: 463.86, cat: 'portes' },
  { id: 'porte_simple',        label: 'Porte simple battant aluminium',           price: 277.60, cat: 'portes' },
  { id: 'porte_coulissante',   label: 'Porte coulissante aluminium',              price: 463.86, cat: 'portes' },
  { id: 'porte_grille',        label: 'Porte simple à grille aluminium',          price: 347.59, cat: 'portes' },
  { id: 'porte_bois_nb',       label: 'Porte en bois — encadrement noir/blanc',  price: 70.00,  cat: 'portes' },
  { id: 'porte_bois_simple',   label: 'Porte en bois — finition blanche',        price: 70.00,  cat: 'portes' },
  { id: 'porte_bois_marron',   label: 'Porte en bois — finition marron',         price: 70.00,  cat: 'portes' },
  // Fenêtres
  { id: 'fenetre_coulissante', label: 'Fenêtre coulissante alliage aluminium',    price: 70.00,  cat: 'fenetres' },
  { id: 'fenetre_rt',          label: 'Fenêtre coulissante à rupture thermique',  price: 130.00, cat: 'fenetres' },
  { id: 'fenetre_grille',      label: 'Fenêtre à battant aluminium',             price: 138.80, cat: 'fenetres' },
  // Intérieur
  { id: 'meubles_hauts',          label: 'Placards muraux de cuisine',           price: 185.07, cat: 'interieur' },
  { id: 'vasque_miroir',          label: 'Meuble vasque avec miroir',            price: 0,      cat: 'interieur' },
  { id: 'vasque_miroir_eclairant',label: 'Meuble vasque avec miroir éclairant',  price: 0,      cat: 'interieur' },
  { id: 'vasque_miroir_led',      label: 'Meuble vasque avec miroir LED',        price: 0,      cat: 'interieur' },
  { id: 'plafond_interieur',      label: 'Plafond intérieur',                    price: 0,      cat: 'interieur' },
  { id: 'mur_vitre',              label: 'Mur rideau en verre',                  price: 742.64, cat: 'interieur' },
  // Extérieur — prix variable selon le modèle
  {
    id: 'panneaux_ext', label: 'Panneaux métalliques', price: null, cat: 'exterieur',
    pricesByModel: { '20m2': 325, '37m2': 580, '56m2': 812, '74m2': 1043 },
  },
];

export const OPTION_CATS = [
  { id: 'portes',    label: 'Portes' },
  { id: 'fenetres',  label: 'Fenêtres' },
  { id: 'interieur', label: 'Intérieur' },
  { id: 'exterieur', label: 'Extérieur' },
];

/** Prix par défaut d'une option (sans override) */
export function getDefaultOptionPrice(optionId, modelId) {
  const opt = OPTIONS.find(o => o.id === optionId);
  if (!opt) return 0;
  if (opt.pricesByModel) return opt.pricesByModel[modelId] ?? 0;
  return opt.price ?? 0;
}

export const TVA_RATE      = 0.085;
export const ACOMPTE_RATE  = 0.40;
export const VALIDITY_DAYS = 14;

/**
 * Calcule les totaux.
 * @param {string}   modelId
 * @param {Array}    selectedOptions  [{optionId, quantity}]
 * @param {number}   discount         remise en euros HT
 * @param {object}   priceFns         { getModelPrice, getModelTransport, getOptionPrice } (optionnel)
 */
export function calculateTotals(modelId, selectedOptions = [], discount = 0, priceFns = null) {
  const getMP  = (id) => priceFns?.getModelPrice(id)     ?? MODELS.find(m => m.id === id)?.price     ?? 0;
  const getTR  = (id) => priceFns?.getModelTransport(id) ?? MODELS.find(m => m.id === id)?.transport ?? 0;
  const getOP  = (optId, mdlId) => priceFns?.getOptionPrice(optId, mdlId) ?? getDefaultOptionPrice(optId, mdlId);

  let ht = getMP(modelId) + getTR(modelId);
  selectedOptions.forEach(({ optionId, quantity }) => {
    if (quantity > 0) ht += getOP(optionId, modelId) * quantity;
  });

  const discAmt = Math.min(Math.max(0, discount || 0), ht);
  ht = round(ht - discAmt);

  const tva     = round(ht * TVA_RATE);
  const ttc     = round(ht + tva);
  const acompte = round(ttc * ACOMPTE_RATE);
  return { ht, tva, ttc, acompte, discount: discAmt };
}

function round(n) { return Math.round(n * 100) / 100; }

export function fmt(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(d) {
  return new Intl.DateTimeFormat('fr-FR').format(d instanceof Date ? d : new Date(d));
}
