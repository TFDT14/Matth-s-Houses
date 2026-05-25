import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image, Users, Plus, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { quotesApi } from '../utils/api';
import { fmt } from '../utils/products';

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    red:    'bg-red-50 text-red-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue:   'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, attente: 0, accepte: 0, volume: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quotesApi.getAll()
      .then(res => {
        const q = res.data.quotes || [];
        setStats({
          total:   q.length,
          attente: q.filter(x => x.statut === 'En attente').length,
          accepte: q.filter(x => x.statut === 'Accepté').length,
          volume:  q.reduce((s, x) => s + (x.totalTTC || 0), 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const val = (v, isNum = false) => loading ? '…' : (isNum ? fmt(v) : v);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Bonjour 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Espace de gestion — Matth's Houses</p>
        </div>
        <button onClick={() => navigate('/devis')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nouveau devis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total devis"   value={val(stats.total)}           icon={FileText}     color="blue"   />
        <StatCard label="En attente"    value={val(stats.attente)}          icon={Clock}        color="yellow" />
        <StatCard label="Acceptés"      value={val(stats.accepte)}          icon={CheckCircle}  color="green"  />
        <StatCard label="Volume TTC"    value={val(stats.volume, true)}     icon={TrendingUp}   color="red"    />
      </div>

      {/* Modules */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: 'Générateur de devis', desc: 'Créez des devis PDF pro en quelques clics, enregistrement auto dans Notion.', path: '/devis', cta: 'Créer un devis' },
            { icon: Image,    title: 'Médiathèque',          desc: 'Gérez plaquettes, photos et présentations. Stockage Cloudinary.', path: '/media', cta: 'Voir les fichiers' },
            { icon: Users,    title: 'Suivi clients',        desc: 'Liste de tous vos devis. Filtres, changement de statut en 1 clic.', path: '/clients', cta: 'Voir les clients' },
          ].map(({ icon: Icon, title, desc, path, cta }) => (
            <div key={path} className="card hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(path)}>
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1.5">{title}</h4>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
              <span className="text-sm text-red-600 font-semibold group-hover:underline">{cta} →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
