import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Save, Plus, Minus, RefreshCw, CheckCircle, Tag, ChevronDown, Trash2 } from 'lucide-react';
import {
  MODELS, OPTIONS, OPTION_CATS, calculateTotals, fmt,
  isOptionAvailable, activeHouseOptions, houseSubtotal, modelDescription,
} from '../utils/products';
import { downloadPDF } from '../utils/pdfGenerator';
import { quotesApi } from '../utils/api';
import { usePrices } from '../contexts/PricesContext';
import Button from '../components/Button';

const INIT_OPTS = OPTIONS.map(o => ({ optionId: o.id, quantity: 0 }));
let houseSeq = 0;
const newHouse = () => ({ key: ++houseSeq, modelId: '20m2', qty: 1, opts: INIT_OPTS });

const getModel   = (id) => MODELS.find(m => m.id === id);
const shortLabel = (id) => { const m = getModel(id); return m ? `${m.label}${m.type === 'pro' ? ' pro' : ''}` : id; };
const clamp      = (n, max) => Math.max(0, Math.min(max, n));

export default function QuoteGenerator() {
  const { priceFns, getOptionPrice } = usePrices();

  const [clientName, setClientName] = useState('');
  const [phone,      setPhone]      = useState('');
  const [houses,     setHouses]     = useState(() => [newHouse()]);
  const [openKey,    setOpenKey]    = useState(() => houses[0].key);
  const [discount,   setDiscount]   = useState(0);
  const [quoteNum,   setQuoteNum]   = useState('MH-…');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');

  const totals = calculateTotals(houses, discount, priceFns);

  const fetchNumber = useCallback(() => {
    quotesApi.getNextNumber()
      .then(r => setQuoteNum(r.data.number))
      .catch(() => setQuoteNum('MH-001'));
  }, []);
  useEffect(() => { fetchNumber(); }, [fetchNumber]);

  /* ── maisons ── */
  const updateHouse = (key, fn) => setHouses(prev => prev.map(h => (h.key === key ? fn(h) : h)));
  const addHouse = () => {
    const h = newHouse();
    setHouses(prev => [...prev, h]);
    setOpenKey(h.key);
  };
  const removeHouse = (key) => {
    if (!window.confirm('Retirer cette maison du devis ?')) return;
    setHouses(prev => prev.filter(h => h.key !== key));
  };

  /* ── payloads ── */
  const buildData = () => ({
    clientName, phone,
    houses: houses.map(h => {
      const model = getModel(h.modelId);
      return {
        description: modelDescription(model),
        qty:         h.qty,
        modelPrice:  priceFns.getModelPrice(h.modelId),
        transport:   priceFns.getModelTransport(h.modelId),
        options: activeHouseOptions(h).map(o => ({
          label:     OPTIONS.find(x => x.id === o.optionId).label,
          unitPrice: getOptionPrice(o.optionId, h.modelId),
          quantity:  o.quantity,
        })),
        subtotal: houseSubtotal(h, priceFns),
      };
    }),
    totalGross: totals.gross,
    totalHT:    totals.ht,
    totalTVA:   totals.tva,
    totalTTC:   totals.ttc,
    acompte:    totals.acompte,
    discount:   totals.discount,
    quoteNumber: quoteNum,
    quoteDate: new Date(),
  });

  const buildNotionPayload = () => {
    const optsOf = (h) => activeHouseOptions(h).map(o => {
      const opt = OPTIONS.find(x => x.id === o.optionId);
      return `${opt.label} ×${o.quantity}`;
    }).join(', ');

    const single  = houses.length === 1 && houses[0].qty === 1;
    const optsStr = single
      ? optsOf(houses[0])
      : houses.map((h, i) => {
          const o = optsOf(h);
          return `Maison ${i + 1} (${shortLabel(h.modelId)} ×${h.qty})${o ? ` : ${o}` : ''}`;
        }).join(' | ');
    const discStr = totals.discount > 0 ? ` | Remise: -${fmt(totals.discount)}` : '';

    return {
      clientName, phone,
      model:    houses.length === 1 ? getModel(houses[0].modelId).label : 'Plusieurs maisons',
      options:  optsStr + discStr,
      totalHT:  totals.ht,
      tva:      totals.tva,
      totalTTC: totals.ttc,
      quoteNumber: quoteNum,
      quoteDate: new Date().toISOString().split('T')[0],
    };
  };

  const validate = () => {
    if (!clientName.trim()) { setError('Veuillez saisir le nom du client.'); return false; }
    setError(''); return true;
  };

  const handlePDF = () => { if (!validate()) return; downloadPDF(buildData()); };

  const handleNotion = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await quotesApi.create(buildNotionPayload());
      setSaved(true); fetchNumber();
      setTimeout(() => setSaved(false), 3500);
    } catch { setError('Erreur Notion — vérifiez la connexion.'); }
    setSaving(false);
  };

  const handleBoth = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      downloadPDF(buildData());
      await quotesApi.create(buildNotionPayload());
      setSaved(true); fetchNumber();
      setTimeout(() => setSaved(false), 3500);
    } catch { setError('Erreur lors de la génération ou sauvegarde.'); }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-mh-text tracking-tight">Nouveau devis</h2>
          <p className="text-sm text-mh-text-3 mt-0.5">
            Numéro :&nbsp;<span className="font-mono font-medium text-mh-text">{quoteNum}</span>
          </p>
        </div>
        <button onClick={fetchNumber} title="Rafraîchir"
          className="p-2 text-mh-text-4 hover:text-mh-text-2 hover:bg-mh-paper-3 rounded-lg transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_296px] gap-5">

        {/* ── FORMULAIRE ── */}
        <div className="space-y-4">

          {/* 1 · Client */}
          <section className="card">
            <SectionHeader n={1} label="Informations client" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Nom du client *</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                  placeholder="Jean Dupont" className="input-field" />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+596 696 00 00 00" className="input-field" />
              </div>
            </div>
          </section>

          {/* 2 · Maisons */}
          <div className="flex items-center justify-between px-1 pt-1">
            <SectionHeader n={2} label={houses.length > 1 ? `Maisons (${houses.length})` : 'Maison'} />
          </div>

          {houses.map((h, i) => (
            <HouseCard key={h.key}
              house={h} index={i}
              open={openKey === h.key}
              onToggle={() => setOpenKey(openKey === h.key ? null : h.key)}
              onRemove={houses.length > 1 ? () => removeHouse(h.key) : null}
              onChange={(fn) => updateHouse(h.key, fn)}
              priceFns={priceFns}
              getOptionPrice={getOptionPrice}
            />
          ))}

          <button onClick={addHouse}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-mh border-2 border-dashed border-mh-line-2
                       text-sm font-medium text-mh-text-3 hover:border-mh-noir hover:text-mh-noir transition-colors">
            <Plus size={14} /> Ajouter une maison
          </button>

          {/* 3 · Remise */}
          <section className="card">
            <SectionHeader n={3} label="Remise" />
            <div className="mt-4 max-w-xs">
              <label className="label">Montant de la remise sur le total (€ HT)</label>
              <div className="relative">
                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mh-text-4" />
                <input type="number" min="0" step="1" value={discount || ''}
                  onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="input-field pl-9 font-mono"
                />
              </div>
              {discount > 0 && (
                <p className="text-xs text-mh-text-3 mt-1.5">
                  Remise appliquée : <span className="font-medium text-mh-text">- {fmt(totals.discount)}</span> sur le HT
                </p>
              )}
            </div>
          </section>
        </div>

        {/* ── RÉCAP STICKY ── */}
        <div className="xl:sticky xl:top-[76px] h-fit">
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-mh-text">Récapitulatif</h3>

            <div className="space-y-3 text-[13px]">
              {houses.map((h, i) => {
                const opts = activeHouseOptions(h);
                return (
                  <div key={h.key}>
                    <Row
                      label={`${houses.length > 1 ? `Maison ${i + 1} · ` : 'Maison '}${shortLabel(h.modelId)}${h.qty > 1 ? ` ×${h.qty}` : ''}`}
                      val={fmt(houseSubtotal(h, priceFns))} />
                    <p className="text-[11px] text-mh-text-4 mt-0.5 leading-snug">
                      Transport inclus{opts.length > 0 && ` · ${opts.map(o => OPTIONS.find(x => x.id === o.optionId).label).join(', ')}`}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-mh-line pt-3 space-y-1.5">
              {totals.discount > 0 && (
                <Row label="Remise" val={`- ${fmt(totals.discount)}`} muted />
              )}
              <Row label="Total HT" val={fmt(totals.ht)} muted />
              <Row label="TVA 8,5 %" val={fmt(totals.tva)} muted />
              <div className="bg-mh-noir text-white rounded-mh px-4 py-3 flex justify-between font-semibold text-[13px]">
                <span>Total TTC</span><span>{fmt(totals.ttc)}</span>
              </div>
              <div className="bg-mh-paper-3 border border-mh-line rounded-mh px-4 py-2.5 flex justify-between text-xs font-medium text-mh-text-2">
                <span>Acompte 40 %</span><span>{fmt(totals.acompte)}</span>
              </div>
            </div>

            {error && <p className="text-xs text-mh-text-2 bg-mh-paper-3 border border-mh-line px-3 py-2 rounded-mh">{error}</p>}
            {saved  && (
              <div className="flex items-center gap-2 text-xs text-mh-text-2 bg-mh-paper-3 border border-mh-line px-3 py-2 rounded-mh">
                <CheckCircle size={12} /> Sauvegardé dans Notion
              </div>
            )}

            <div className="space-y-2 pt-1">
              <Button variant="primary" className="w-full justify-center py-3"
                onClick={handleBoth} disabled={saving || !clientName}>
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><FileText size={14} /> Générer &amp; Sauvegarder</>
                }
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="justify-center"
                  onClick={handlePDF} disabled={saving || !clientName}>
                  <Download size={13} /> PDF seul
                </Button>
                <Button variant="secondary" size="sm" className="justify-center"
                  onClick={handleNotion} disabled={saving || !clientName}>
                  <Save size={13} /> Notion seul
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HouseCard({ house, index, open, onToggle, onRemove, onChange, priceFns, getOptionPrice }) {
  const { modelId, qty, opts } = house;
  const nOpts = activeHouseOptions(house).length;

  const setModel  = (id) => onChange(h => ({ ...h, modelId: id }));
  const setHQty   = (n)  => onChange(h => ({ ...h, qty: Math.max(1, Math.min(20, n || 1)) }));
  const setOptQty = (id, n) => onChange(h => ({
    ...h, opts: h.opts.map(o => (o.optionId === id ? { ...o, quantity: clamp(n || 0, 10) } : o)),
  }));
  const optQty = (id) => opts.find(o => o.optionId === id)?.quantity || 0;

  return (
    <section className={`card !p-0 overflow-hidden ${open ? 'ring-1 ring-mh-noir' : ''}`}>
      {/* En-tête */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
        <button onClick={onToggle} className="flex-1 min-w-0 flex items-center gap-3 text-left">
          <ChevronDown size={16} className={`text-mh-text-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-mh-text truncate">
              Maison {index + 1} · {shortLabel(modelId)}
            </p>
            <p className="text-[11px] text-mh-text-4">
              {nOpts === 0 ? 'Aucune option' : `${nOpts} option${nOpts > 1 ? 's' : ''}`} · {fmt(houseSubtotal(house, priceFns))} HT
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0" title="Nombre de maisons identiques">
          <QtyBtn onClick={() => setHQty(qty - 1)} disabled={qty <= 1}><Minus size={10} /></QtyBtn>
          <span className="w-8 text-center text-sm font-semibold text-mh-text">×{qty}</span>
          <QtyBtn onClick={() => setHQty(qty + 1)} disabled={qty >= 20}><Plus size={10} /></QtyBtn>
        </div>

        {onRemove && (
          <button onClick={onRemove} title="Retirer cette maison"
            className="p-2 text-mh-text-4 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-mh-line px-4 sm:px-5 py-4 space-y-5">
          {/* Modèle */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-mh-text-4 mb-2">Résidentiel</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {MODELS.filter(m => !m.type).map(m => (
                <ModelBtn key={m.id} m={m} selected={modelId === m.id} onClick={() => setModel(m.id)} priceFns={priceFns} />
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-mh-text-4 mt-4 mb-2">Professionnel</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {MODELS.filter(m => m.type === 'pro').map(m => (
                <ModelBtn key={m.id} m={m} selected={modelId === m.id} onClick={() => setModel(m.id)} priceFns={priceFns} pro />
              ))}
            </div>
          </div>

          {/* Options */}
          {OPTION_CATS.map(cat => {
            const catOpts = OPTIONS.filter(o => o.cat === cat.id && isOptionAvailable(o, modelId));
            if (!catOpts.length) return null;
            return (
              <div key={cat.id}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-mh-text-4 mb-2">{cat.label}</p>
                <div className="space-y-1.5">
                  {catOpts.map(opt => {
                    const q     = optQty(opt.id);
                    const price = getOptionPrice(opt.id, modelId);
                    return (
                      <div key={opt.id}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-mh transition-colors ${
                          q > 0 ? 'bg-mh-paper-3 border border-mh-line-2' : 'bg-mh-paper-2 hover:bg-mh-paper-3'
                        }`}>
                        <div className="min-w-0 flex-1 mr-3">
                          <span className="text-sm text-mh-text">{opt.label}</span>
                          <span className="text-xs text-mh-text-4 ml-2">
                            {fmt(price)}{opt.pricesByModel ? ' / modèle actuel' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {q > 0 && <span className="text-xs font-medium text-mh-text-2 mr-1">{fmt(price * q)}</span>}
                          <QtyBtn onClick={() => setOptQty(opt.id, q - 1)} disabled={q === 0}><Minus size={10} /></QtyBtn>
                          <input type="number" min="0" max="10" value={q}
                            onChange={e => setOptQty(opt.id, parseInt(e.target.value))}
                            className="w-9 text-center text-sm font-medium border border-mh-line-2 rounded-lg py-1
                                       bg-white focus:outline-none focus:ring-1 focus:ring-mh-noir" />
                          <QtyBtn onClick={() => setOptQty(opt.id, q + 1)} disabled={q >= 10}><Plus size={10} /></QtyBtn>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ModelBtn({ m, selected, onClick, priceFns, pro }) {
  return (
    <button onClick={onClick}
      className={`p-4 rounded-mh border-2 text-left transition-all ${
        selected ? 'border-mh-noir bg-mh-paper-3' : 'border-mh-line bg-white hover:border-mh-line-2'
      }`}>
      <p className={`font-bold text-2xl tracking-tight ${selected ? 'text-mh-noir' : 'text-mh-text-2'}`}>
        {m.label}
      </p>
      <p className="text-[11px] text-mh-text-4 mt-1">{pro ? 'Container pro' : 'Maison container'}</p>
      <p className="text-sm font-semibold text-mh-text mt-2">{fmt(priceFns.getModelPrice(m.id))}</p>
      <p className="text-[11px] text-mh-text-3">+ {fmt(priceFns.getModelTransport(m.id))} transport</p>
    </button>
  );
}
function SectionHeader({ n, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-5 h-5 bg-mh-noir text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{n}</span>
      <span className="text-sm font-semibold text-mh-text">{label}</span>
    </div>
  );
}
function QtyBtn({ children, ...props }) {
  return (
    <button className="w-7 h-7 rounded-lg border border-mh-line-2 bg-white flex items-center justify-center
                       text-mh-text-2 hover:bg-mh-paper-3 disabled:opacity-30 transition-colors" {...props}>
      {children}
    </button>
  );
}
function Row({ label, val, muted }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-mh-text-3' : 'text-mh-text'}`}>
      <span className="truncate mr-2">{label}</span>
      <span className="font-medium shrink-0">{val}</span>
    </div>
  );
}
