import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Save, Plus, Minus, RefreshCw, CheckCircle } from 'lucide-react';
import { MODELS, OPTIONS, calculateTotals, fmt } from '../utils/products';
import { downloadPDF } from '../utils/pdfGenerator';
import { quotesApi } from '../utils/api';

const INIT_OPTIONS = OPTIONS.map(o => ({ optionId: o.id, quantity: 0 }));

export default function QuoteGenerator() {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone]           = useState('');
  const [modelId, setModelId]       = useState('20m2');
  const [opts, setOpts]             = useState(INIT_OPTIONS);
  const [quoteNum, setQuoteNum]     = useState('MH-…');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');

  const totals       = calculateTotals(modelId, opts);
  const selectedModel = MODELS.find(m => m.id === modelId);
  const activeOpts   = opts.filter(o => o.quantity > 0);

  const fetchNumber = useCallback(() => {
    quotesApi.getNextNumber()
      .then(r => setQuoteNum(r.data.number))
      .catch(() => setQuoteNum('MH-001'));
  }, []);

  useEffect(() => { fetchNumber(); }, [fetchNumber]);

  const changeQty = (id, delta) =>
    setOpts(prev => prev.map(o =>
      o.optionId === id ? { ...o, quantity: Math.max(0, Math.min(10, o.quantity + delta)) } : o
    ));

  const setQty = (id, val) =>
    setOpts(prev => prev.map(o =>
      o.optionId === id ? { ...o, quantity: Math.max(0, Math.min(10, parseInt(val) || 0)) } : o
    ));

  const buildData = () => ({
    clientName, phone, modelId,
    selectedOptions: activeOpts,
    totalHT:  totals.ht,
    totalTVA: totals.tva,
    totalTTC: totals.ttc,
    acompte:  totals.acompte,
    quoteNumber: quoteNum,
    quoteDate: new Date(),
  });

  const buildNotionPayload = () => ({
    clientName, phone,
    model:   selectedModel?.label || modelId,
    options: activeOpts.map(o => {
      const opt = OPTIONS.find(x => x.id === o.optionId);
      return `${opt?.label || o.optionId} ×${o.quantity}`;
    }).join(', '),
    totalHT:  totals.ht,
    tva:      totals.tva,
    totalTTC: totals.ttc,
    quoteNumber: quoteNum,
    quoteDate: new Date().toISOString().split('T')[0],
  });

  const validate = () => {
    if (!clientName.trim()) { setError('Veuillez saisir le nom du client.'); return false; }
    setError('');
    return true;
  };

  const handlePDFOnly = () => {
    if (!validate()) return;
    downloadPDF(buildData());
  };

  const handleNotionOnly = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await quotesApi.create(buildNotionPayload());
      setSaved(true);
      fetchNumber();
      setTimeout(() => setSaved(false), 3500);
    } catch { setError('Erreur Notion — vérifiez la connexion.'); }
    setSaving(false);
  };

  const handleGenerateAndSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      downloadPDF(buildData());
      await quotesApi.create(buildNotionPayload());
      setSaved(true);
      fetchNumber();
      setTimeout(() => setSaved(false), 3500);
    } catch { setError('Erreur lors de la génération ou de la sauvegarde.'); }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Nouveau devis</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Numéro : <span className="font-mono font-bold text-red-600">{quoteNum}</span>
          </p>
        </div>
        <button onClick={fetchNumber} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Rafraîchir le numéro">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* ── FORMULAIRE ── */}
        <div className="space-y-5">

          {/* 1 · Client */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Step n={1} /> Informations client
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* 2 · Modèle */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Step n={2} /> Modèle de maison
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {MODELS.map(m => (
                <button key={m.id} onClick={() => setModelId(m.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    modelId === m.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className={`font-black text-2xl ${modelId === m.id ? 'text-red-600' : 'text-gray-900'}`}>{m.label}</p>
                  <p className="text-xs text-gray-400 mt-1">Maison container</p>
                  <p className="text-sm font-bold text-gray-800 mt-2">{fmt(m.price)}</p>
                  <p className="text-xs text-gray-400">+ {fmt(m.transport)} transport</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3 · Options */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Step n={3} /> Options
            </h3>
            <div className="space-y-1.5">
              {OPTIONS.map(opt => {
                const qty = opts.find(o => o.optionId === opt.id)?.quantity || 0;
                return (
                  <div key={opt.id}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      qty > 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{fmt(opt.price)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {qty > 0 && (
                        <span className="text-xs font-bold text-red-600 mr-1">{fmt(opt.price * qty)}</span>
                      )}
                      <button onClick={() => changeQty(opt.id, -1)} disabled={qty === 0}
                        className="w-7 h-7 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                        <Minus size={11} />
                      </button>
                      <input type="number" min="0" max="10" value={qty}
                        onChange={e => setQty(opt.id, e.target.value)}
                        className="w-9 text-center text-sm font-bold border border-gray-300 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white" />
                      <button onClick={() => changeQty(opt.id, 1)} disabled={qty >= 10}
                        className="w-7 h-7 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RÉCAP STICKY ── */}
        <div className="xl:sticky xl:top-5 h-fit">
          <div className="card space-y-4">
            <h3 className="font-bold text-gray-900">Récapitulatif</h3>

            {/* Lignes */}
            <div className="space-y-1.5 text-sm">
              {selectedModel && (
                <>
                  <Row label={`Maison ${selectedModel.label}`} val={fmt(selectedModel.price)} />
                  <Row label="Transport" val={fmt(selectedModel.transport)} />
                </>
              )}
              {activeOpts.map(({ optionId, quantity }) => {
                const opt = OPTIONS.find(o => o.id === optionId);
                if (!opt) return null;
                return <Row key={optionId} label={`${opt.label} ×${quantity}`} val={fmt(opt.price * quantity)} />;
              })}
            </div>

            <div className="border-t pt-3 space-y-2">
              <Row label="Total HT" val={fmt(totals.ht)} muted />
              <Row label="TVA 8,5%" val={fmt(totals.tva)} muted />
              <div className="bg-gray-900 text-white rounded-xl px-3.5 py-3 flex justify-between font-bold text-sm">
                <span>Total TTC</span><span>{fmt(totals.ttc)}</span>
              </div>
              <div className="bg-red-600 text-white rounded-xl px-3.5 py-2.5 flex justify-between text-xs font-semibold">
                <span>Acompte 40%</span><span>{fmt(totals.acompte)}</span>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            {saved && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle size={13} /> Sauvegardé dans Notion !
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button onClick={handleGenerateAndSave} disabled={saving || !clientName}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><FileText size={15} /> Générer & Sauvegarder</>
                }
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handlePDFOnly} disabled={saving || !clientName}
                  className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2">
                  <Download size={13} /> PDF seul
                </button>
                <button onClick={handleNotionOnly} disabled={saving || !clientName}
                  className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2">
                  <Save size={13} /> Notion seul
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n }) {
  return (
    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
      {n}
    </span>
  );
}

function Row({ label, val, muted }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-gray-500' : 'text-gray-800'}`}>
      <span className="truncate mr-2">{label}</span>
      <span className="font-medium flex-shrink-0">{val}</span>
    </div>
  );
}
