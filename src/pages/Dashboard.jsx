import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image, Users, Plus } from 'lucide-react';
import KPICard    from '../components/KPICard';
import ModuleCard from '../components/ModuleCard';
import Button     from '../components/Button';
import { quotesApi } from '../utils/api';
import { fmt } from '../utils/products';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
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

  const v = (val, isMoney = false) =>
    loading ? '…' : isMoney ? fmt(val) : String(val);

  const modules = [
    {
      icon: FileText,
      title: 'Générateur de devis',
      description: 'Créez des devis PDF professionnels en quelques clics. Enregistrement automatique dans Notion.',
      cta: 'Créer un devis',
      path: '/devis',
    },
    {
      icon: Image,
      title: 'Médiathèque',
      description: 'Gérez vos plaquettes commerciales, photos et présentations. Stockage Cloudinary.',
      cta: 'Voir les fichiers',
      path: '/media',
    },
    {
      icon: Users,
      title: 'Suivi clients',
      description: 'Liste complète de vos devis. Filtres, changement de statut en un clic, sync Notion.',
      cta: 'Voir les clients',
      path: '/clients',
    },
  ];

  return (
    <div className="max-w-5xl">

      {/* Hero */}
      <div className="flex items-end justify-between mb-9">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-mh-text-3 mb-2">
            {todayLabel()}
          </p>
          <h1 className="text-[34px] font-semibold tracking-[-0.02em] leading-tight text-mh-text">
            {getGreeting()} Matthieu.
          </h1>
          <p className="text-sm text-mh-text-3 mt-1.5">Voici un aperçu de l'atelier ce mois-ci.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => navigate('/media')}>
            Médiathèque
          </Button>
          <Button variant="primary" onClick={() => navigate('/devis')}>
            <Plus size={14} />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-9">
        <KPICard label="Devis émis"  value={v(stats.total)}           sublabel={`${stats.total > 0 ? '+' + stats.total : '0'} au total`} />
        <KPICard label="En attente"  value={v(stats.attente)}         sublabel="À traiter" />
        <KPICard label="Acceptés"    value={v(stats.accepte)}         sublabel="Confirmés" />
        <KPICard label="Volume TTC"  value={v(stats.volume, true)}    sublabel="Total devis" />
      </div>

      {/* Modules */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[15px] font-semibold text-mh-text">Modules</h2>
          <span className="text-[12px] text-mh-text-3">3 actifs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {modules.map(m => (
            <ModuleCard key={m.path} {...m} onClick={() => navigate(m.path)} />
          ))}
        </div>
      </div>
    </div>
  );
}
