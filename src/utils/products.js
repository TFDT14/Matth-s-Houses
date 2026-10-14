export const MODELS = [
  // Résidentiel
  { id: '20m2', label: '20m²', price: 19360,   transport: 6000 },
  { id: '37m2', label: '37m²', price: 22010,   transport: 8000 },
  { id: '56m2', label: '56m²', price: 28125,   transport: 10000 },
  { id: '74m2', label: '74m²', price: 33625,   transport: 12000 },
  // Professionnel
  { id: '10ft', label: '20m²', price: 15700, transport: 6000,  type: 'pro' },
  { id: '20ft', label: '37m²', price: 17100, transport: 8000,  type: 'pro' },
  { id: '30ft', label: '56m²', price: 24600, transport: 10000, type: 'pro' },
  { id: '40ft', label: '74m²', price: 26600, transport: 12000, type: 'pro' },
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
  { id: 'salle_de_bain',          label: 'Salle de bain',                        price: 750,    cat: 'interieur', proOnly: true },
  { id: 'cuisine_u',              label: 'Cuisine U',                            price: 700,    cat: 'interieur', proOnly: true },
  { id: 'chambre',                label: 'Chambre / Pièce',                      price: 235,    cat: 'interieur', proOnly: true },
  { id: 'meubles_hauts',          label: 'Placards muraux de cuisine',           price: 185.07, cat: 'interieur' },
  { id: 'vasque_miroir',          label: 'Meuble vasque avec miroir',            price: 0,      cat: 'interieur' },
  { id: 'vasque_miroir_eclairant',label: 'Meuble vasque avec miroir éclairant',  price: 0,      cat: 'interieur' },
  { id: 'vasque_miroir_led',      label: 'Meuble vasque avec miroir LED',        price: 0,      cat: 'interieur' },
  { id: 'plafond_interieur',      label: 'Plafond intérieur',                    price: 0,      cat: 'interieur' },
  { id: 'mur_vitre',              label: 'Mur rideau en verre',                  price: 742.64, cat: 'interieur' },
  // Extérieur — prix variable selon le modèle
  {
    id: 'toit', label: 'Toit', price: null, cat: 'exterieur',
    pricesByModel: { '20m2': 880, '37m2': 1580, '56m2': 2035, '74m2': 3025, '10ft': 0, '20ft': 0, '30ft': 0, '40ft': 0 },
  },
  {
    id: 'terrasse', label: 'Terrasse', price: null, cat: 'exterieur', residentialOnly: true,
    pricesByModel: { '20m2': 1705, '37m2': 1835, '56m2': 5205, '74m2': 6845 },
  },
  {
    id: 'panneaux_ext', label: 'Panneaux métalliques', price: null, cat: 'exterieur',
    pricesByModel: { '20m2': 325, '37m2': 580, '56m2': 812, '74m2': 1043 },
  },
  // Fondation & aménagement
  {
    id: 'pieux', label: 'Pieux de fondation', price: null, cat: 'fondation',
    pricesByModel: { '20m2': 7000, '37m2': 8000, '56m2': 10000, '74m2': 12000, '10ft': 7000, '20ft': 8000, '30ft': 10000, '40ft': 12000 },
  },
  { id: 'micro_station', label: "Micro station d'épuration", price: 7500, cat: 'fondation' },
];

export const OPTION_CATS = [
  { id: 'portes',    label: 'Portes' },
  { id: 'fenetres',  label: 'Fenêtres' },
  { id: 'interieur', label: 'Intérieur' },
  { id: 'exterieur', label: 'Extérieur' },
  { id: 'fondation', label: 'Fondation & aménagement' },
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

export function isOptionAvailable(opt, modelId) {
  const isPro = MODELS.find(m => m.id === modelId)?.type === 'pro';
  return (!opt.proOnly || isPro) && (!opt.residentialOnly || !isPro);
}

export function modelDescription(model) {
  return model.type === 'pro' ? `Container professionnel ${model.label}` : `Maison container ${model.label}`;
}

/** Options actives d'une maison (qté > 0 et disponibles pour son modèle) */
export function activeHouseOptions(house) {
  return house.opts.filter(o => {
    if (o.quantity < 1) return false;
    const opt = OPTIONS.find(x => x.id === o.optionId);
    return opt && isOptionAvailable(opt, house.modelId);
  });
}

/** Total HT d'une maison, quantité de maisons comprise */
export function houseSubtotal(house, priceFns) {
  let unit = priceFns.getModelPrice(house.modelId) + priceFns.getModelTransport(house.modelId);
  activeHouseOptions(house).forEach(({ optionId, quantity }) => {
    unit += priceFns.getOptionPrice(optionId, house.modelId) * quantity;
  });
  return round(unit * house.qty);
}

/** houses: [{ modelId, qty, opts: [{optionId, quantity}] }] — remise en € HT sur le total */
export function calculateTotals(houses, discount, priceFns) {
  const gross   = round(houses.reduce((s, h) => s + houseSubtotal(h, priceFns), 0));
  const discAmt = Math.min(Math.max(0, discount || 0), gross);
  const ht      = round(gross - discAmt);
  const tva     = round(ht * TVA_RATE);
  const ttc     = round(ht + tva);
  const acompte = round(ttc * ACOMPTE_RATE);
  return { gross, ht, tva, ttc, acompte, discount: discAmt };
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
