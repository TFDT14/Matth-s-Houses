import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Grid, List, Trash2 } from 'lucide-react';
import { quotesApi } from '../utils/api';
import { fmt, fmtDate } from '../utils/products';

const STATUTS = ['Tous', 'En attente', 'Accepté', 'Refusé', 'En cours'];
const MODELS  = ['Tous', '20m²', '37m²', '56m²', '74m²'];

const STATUS_STYLE = {
  'En attente': 'bg-amber-50  text-amber-700  border-amber-200',
  'Accepté':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Refusé':     'bg-mh-paper-3 text-mh-text-2  border-mh-line-2',
  'En cours':   'bg-blue-50   text-blue-700   border-blue-200',
};

export default function ClientTracking() {
  const [quotes,    setQuotes]   = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [updating,  setUpdating] = useState(null);
  const [deleting,  setDeleting] = useState(null);   // id en cours de suppression
  const [deleteAll, setDeleteAll] = useState(false); // suppression de masse en cours
  const [search,    setSearch]   = useState('');
  const [statut,    setStatut]   = useState('Tous');
  const [modele,    setModele]   = useState('Tous');
  const [view,      setView]     = useState('table');

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statut !== 'Tous') params.statut = statut;
      if (modele !== 'Tous') params.modele = modele;
      const res = await quotesApi.getAll(params);
      setQuotes(res.data.quotes || []);
    } catch { setQuotes([]); }
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, [statut, modele]);

  const handleStatusChange = async (id, newStatut) => {
    setUpdating(id);
    try {
      await quotesApi.updateStatus(id, newStatut);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, statut: newStatut } : q));
    } catch { alert('Erreur lors de la mise à jour'); }
    setUpdating(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce devis ? Cette action est irréversible.')) return;
    setDeleting(id);
    try {
      await quotesApi.delete(id);
      setQuotes(prev => prev.filter(q => q.id !== id));
    } catch { alert('Erreur lors de la suppression.'); }
    setDeleting(null);
  };

  const handleDeleteAll = async () => {
    const n = filtered.length;
    if (!confirm(`Supprimer les ${n} devis affichés ? Cette action est irréversible.`)) return;
    setDeleteAll(true);
    try {
      await Promise.all(filtered.map(q => quotesApi.delete(q.id)));
      const deletedIds = new Set(filtered.map(q => q.id));
      setQuotes(prev => prev.filter(q => !deletedIds.has(q.id)));
    } catch { alert('Erreur lors de la suppression.'); }
    setDeleteAll(false);
  };

  const filtered = quotes.filter(q =>
    !search || q.clientName.toLowerCase().includes(search.toLowerCase()) ||
    q.quoteNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mh-text-4" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="pl-8 pr-3 py-2 border border-mh-line-2 rounded-mh text-sm w-44 bg-white
                         focus:outline-none focus:ring-1 focus:ring-mh-noir focus:border-mh-noir" />
          </div>
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="border border-mh-line-2 rounded-mh px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-1 focus:ring-mh-noir text-mh-text">
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={modele} onChange={e => setModele(e.target.value)}
            className="border border-mh-line-2 rounded-mh px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-1 focus:ring-mh-noir text-mh-text">
            {MODELS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-mh-text-4">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>

          {/* Bouton "Tout supprimer" — visible uniquement quand il y a des devis */}
          {filtered.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deleteAll}
              title={`Supprimer les ${filtered.length} devis affichés`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200
                         bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40">
              {deleteAll
                ? <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                : <Trash2 size={12} />}
              Tout supprimer
            </button>
          )}

          <button onClick={fetchQuotes} className="p-2 text-mh-text-4 hover:text-mh-text-2 hover:bg-mh-paper-3 rounded-lg transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setView(v => v === 'table' ? 'cards' : 'table')}
            className="p-2 text-mh-text-4 hover:text-mh-text-2 hover:bg-mh-paper-3 rounded-lg transition-colors">
            {view === 'table' ? <Grid size={14} /> : <List size={14} />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-7 h-7 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-mh-text-4">
          <p className="text-base font-medium text-mh-text-3">Aucun devis trouvé</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou créez un nouveau devis.</p>
        </div>
      ) : view === 'table' ? (
        <TableView quotes={filtered} onStatusChange={handleStatusChange} onDelete={handleDelete}
                   updating={updating} deleting={deleting} />
      ) : (
        <CardsView quotes={filtered} onStatusChange={handleStatusChange} onDelete={handleDelete}
                   updating={updating} deleting={deleting} />
      )}
    </div>
  );
}

function StatusSelect({ id, statut, onStatusChange, updating }) {
  return (
    <select
      value={statut}
      disabled={updating === id}
      onChange={e => onStatusChange(id, e.target.value)}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer
                  ${STATUS_STYLE[statut] || 'bg-mh-paper-3 text-mh-text-2 border-mh-line-2'}`}
    >
      {['En attente', 'En cours', 'Accepté', 'Refusé'].map(s => <option key={s}>{s}</option>)}
    </select>
  );
}

function TableView({ quotes, onStatusChange, onDelete, updating, deleting }) {
  return (
    <div className="bg-mh-paper border border-mh-line rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-mh-paper-2 border-b border-mh-line">
            {['N° Devis', 'Client', 'Modèle', 'Total TTC', 'Date', 'Statut', ''].map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-[11px] font-semibold text-mh-text-3 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-mh-line">
          {quotes.map(q => (
            <tr key={q.id} className="hover:bg-mh-paper-2 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-medium text-mh-text">{q.quoteNumber}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-mh-text">{q.clientName}</p>
                {q.phone && <p className="text-xs text-mh-text-4">{q.phone}</p>}
              </td>
              <td className="px-4 py-3 text-mh-text-2">{q.model}</td>
              <td className="px-4 py-3 font-semibold text-mh-text">{fmt(q.totalTTC)}</td>
              <td className="px-4 py-3 text-xs text-mh-text-4">{q.quoteDate ? fmtDate(q.quoteDate) : '—'}</td>
              <td className="px-4 py-3">
                <StatusSelect id={q.id} statut={q.statut} onStatusChange={onStatusChange} updating={updating} />
              </td>
              <td className="px-3 py-3">
                <button
                  onClick={() => onDelete(q.id)}
                  disabled={deleting === q.id}
                  title="Supprimer ce devis"
                  className="p-1.5 text-mh-text-4 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                  {deleting === q.id
                    ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" />
                    : <Trash2 size={13} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardsView({ quotes, onStatusChange, onDelete, updating, deleting }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {quotes.map(q => (
        <div key={q.id} className="card hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="font-mono text-xs font-medium text-mh-text bg-mh-paper-3 px-2 py-0.5 rounded">{q.quoteNumber}</span>
            <div className="flex items-center gap-2">
              <StatusSelect id={q.id} statut={q.statut} onStatusChange={onStatusChange} updating={updating} />
              <button
                onClick={() => onDelete(q.id)}
                disabled={deleting === q.id}
                title="Supprimer ce devis"
                className="p-1 text-mh-text-4 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                {deleting === q.id
                  ? <span className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" />
                  : <Trash2 size={12} />}
              </button>
            </div>
          </div>
          <p className="font-semibold text-mh-text">{q.clientName}</p>
          {q.phone && <p className="text-xs text-mh-text-4 mt-0.5">{q.phone}</p>}
          <div className="mt-3 pt-3 border-t border-mh-line flex justify-between items-end">
            <div>
              <p className="text-[11px] text-mh-text-4">Modèle</p>
              <p className="text-sm font-medium text-mh-text-2">{q.model}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-mh-text-4">Total TTC</p>
              <p className="text-base font-semibold text-mh-text">{fmt(q.totalTTC)}</p>
            </div>
          </div>
          {q.quoteDate && <p className="text-[11px] text-mh-text-4 mt-2">Émis le {fmtDate(q.quoteDate)}</p>}
        </div>
      ))}
    </div>
  );
}
