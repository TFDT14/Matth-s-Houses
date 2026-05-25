import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Grid, List } from 'lucide-react';
import { quotesApi } from '../utils/api';
import { fmt, fmtDate } from '../utils/products';

const STATUTS = ['Tous', 'En attente', 'Accepté', 'Refusé', 'En cours'];
const MODELS  = ['Tous', '20m²', '37m²', '56m²', '74m²'];

const STATUS_STYLE = {
  'En attente': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Accepté':    'bg-green-50  text-green-700  border-green-200',
  'Refusé':     'bg-red-50    text-red-700    border-red-200',
  'En cours':   'bg-blue-50   text-blue-700   border-blue-200',
};

export default function ClientTracking() {
  const [quotes, setQuotes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [search, setSearch]       = useState('');
  const [statut, setStatut]       = useState('Tous');
  const [modele, setModele]       = useState('Tous');
  const [view, setView]           = useState('table');

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

  const filtered = quotes.filter(q =>
    !search || q.clientName.toLowerCase().includes(search.toLowerCase()) ||
    q.quoteNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher client…" className="pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-sm w-44 focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          {/* Statut filter */}
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
          {/* Modèle filter */}
          <select value={modele} onChange={e => setModele(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
            {MODELS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={fetchQuotes} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setView(v => v === 'table' ? 'cards' : 'table')}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            {view === 'table' ? <Grid size={15} /> : <List size={15} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Aucun devis trouvé</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou créez un nouveau devis.</p>
        </div>
      ) : view === 'table' ? (
        <TableView quotes={filtered} onStatusChange={handleStatusChange} updating={updating} />
      ) : (
        <CardsView quotes={filtered} onStatusChange={handleStatusChange} updating={updating} />
      )}
    </div>
  );
}

function StatusBadge({ statut }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[statut] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {statut}
    </span>
  );
}

function StatusSelect({ id, statut, onStatusChange, updating }) {
  return (
    <select
      value={statut}
      disabled={updating === id}
      onChange={e => onStatusChange(id, e.target.value)}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${STATUS_STYLE[statut] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
    >
      {['En attente', 'En cours', 'Accepté', 'Refusé'].map(s =>
        <option key={s} value={s}>{s}</option>
      )}
    </select>
  );
}

function TableView({ quotes, onStatusChange, updating }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['N° Devis', 'Client', 'Modèle', 'Total TTC', 'Date', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {quotes.map(q => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-red-600 text-xs">{q.quoteNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{q.clientName}</p>
                  {q.phone && <p className="text-xs text-gray-400">{q.phone}</p>}
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">{q.model}</td>
                <td className="px-4 py-3 font-bold text-gray-900">{fmt(q.totalTTC)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{q.quoteDate ? fmtDate(q.quoteDate) : '—'}</td>
                <td className="px-4 py-3">
                  <StatusSelect id={q.id} statut={q.statut} onStatusChange={onStatusChange} updating={updating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardsView({ quotes, onStatusChange, updating }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {quotes.map(q => (
        <div key={q.id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{q.quoteNumber}</span>
            <StatusSelect id={q.id} statut={q.statut} onStatusChange={onStatusChange} updating={updating} />
          </div>
          <p className="font-bold text-gray-900 text-base">{q.clientName}</p>
          {q.phone && <p className="text-xs text-gray-400 mt-0.5">{q.phone}</p>}
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400">Modèle</p>
              <p className="text-sm font-semibold text-gray-700">{q.model}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total TTC</p>
              <p className="text-base font-black text-gray-900">{fmt(q.totalTTC)}</p>
            </div>
          </div>
          {q.quoteDate && <p className="text-xs text-gray-400 mt-2">Émis le {fmtDate(q.quoteDate)}</p>}
        </div>
      ))}
    </div>
  );
}
