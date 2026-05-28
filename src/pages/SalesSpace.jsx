import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Image, FileText, File, Download, FolderOpen, Mail, Instagram } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { MODELS, TVA_RATE } from '../utils/products';
import { mediaApi } from '../utils/api';

/* ── helpers ── */
const TVA = 1 + TVA_RATE;

function fmtTTC(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
}

/* ── infos modèles ── */
const MODEL_INFO = {
  '20m2': {
    type: 'Studio modulaire',
    uses: 'Chambre étudiante · Pied-à-terre · Dépendance',
    desc: "L'unité minimale. Compact, optimisée, prête à vivre.",
  },
  '37m2': {
    type: 'Maison 2 pièces',
    uses: 'Couple · Télétravail · Résidence principale',
    desc: 'Tout le confort essentiel dans un format maîtrisé.',
  },
  '56m2': {
    type: 'Maison familiale',
    uses: 'Famille · Colocation · Logement modulable',
    desc: 'Espace de vie complet, entièrement personnalisable.',
  },
  '74m2': {
    type: 'Villa container',
    uses: 'Résidence premium · Grand confort · Investissement',
    desc: 'Notre modèle signature. Finitions haut de gamme.',
  },
};

/* ── catégories médiathèque ── */
const CATS = [
  { id: 'all',     label: 'Tous' },
  { id: '20m2',    label: '20 m²' },
  { id: '37m2',    label: '37 m²' },
  { id: '56m2',    label: '56 m²' },
  { id: '74m2',    label: '74 m²' },
  { id: 'options', label: 'Options' },
];

function fileIcon(fmt) {
  if (['jpg','jpeg','png','gif','webp','svg'].includes(fmt)) return Image;
  if (fmt === 'pdf') return FileText;
  return File;
}

/* ── Card média lecture seule ── */
function MediaCard({ file }) {
  const Icon    = fileIcon(file.format);
  const isImage = file.resource_type === 'image';

  return (
    <div className="bg-white border border-mh-line rounded-xl overflow-hidden
                    hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,.08)] transition-shadow group">
      <div className="h-40 bg-mh-paper-2 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={file.secure_url} alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-mh-text-4">
            <Icon size={32} />
            <span className="text-[10px] uppercase font-mono tracking-wider">{file.format || 'fichier'}</span>
          </div>
        )}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-mh-text truncate">{file.public_id.split('/').pop()}</p>
        <a href={file.secure_url} target="_blank" rel="noreferrer" download
          className="shrink-0 p-1.5 text-mh-text-4 hover:text-mh-text hover:bg-mh-paper-3 rounded-lg transition-colors">
          <Download size={13} />
        </a>
      </div>
    </div>
  );
}

/* ── Page principale ── */
export default function SalesSpace() {
  const navigate = useNavigate();

  /* médiathèque */
  const [files,     setFiles]     = useState([]);
  const [loadMedia, setLoadMedia] = useState(true);
  const [activeCat, setActiveCat] = useState('all');
  const [mediaErr,  setMediaErr]  = useState('');

  useEffect(() => {
    setLoadMedia(true); setMediaErr('');
    mediaApi.getAll(activeCat === 'all' ? undefined : activeCat)
      .then(r => setFiles(r.data.files || []))
      .catch(() => setMediaErr('Impossible de charger les supports.'))
      .finally(() => setLoadMedia(false));
  }, [activeCat]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-mh-paper-2">

      {/* Nav */}
      <nav className="bg-white border-b border-mh-line px-8 h-[60px] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={30} />
          <span className="text-sm font-semibold text-mh-text">Matth's Houses</span>
        </div>
        <button onClick={() => navigate('/select')}
          className="flex items-center gap-1.5 text-xs text-mh-text-3 hover:text-mh-text transition-colors">
          <ArrowLeft size={13} /> Changer d'espace
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* ── HERO ── */}
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mh-text-4 mb-3">
            Martinique · Maisons Container
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.02em] text-mh-text mb-4">
            Construisez votre espace de vie.
          </h1>
          <p className="text-[15px] text-mh-text-3 max-w-xl mx-auto leading-relaxed">
            Matth's Houses conçoit et livre des maisons containers de qualité en Martinique.
            Choisissez le modèle qui vous correspond.
          </p>
        </div>

        {/* ── MODÈLES ── */}
        <section>
          <h2 className="text-sm font-semibold text-mh-text mb-5">Nos modèles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODELS.map(m => {
              const info   = MODEL_INFO[m.id] ?? {};
              const prixTTC = (m.price + m.transport) * TVA;
              return (
                <div key={m.id}
                  className="bg-white border border-mh-line rounded-xl p-6
                             hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,.1)] transition-shadow">

                  {/* Header carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-mh-paper-3 rounded-lg flex items-center justify-center">
                      <Home size={18} className="text-mh-text-2" />
                    </div>
                    <span className="font-mono text-[11px] text-mh-text-4 bg-mh-paper-2 border border-mh-line px-2 py-1 rounded-lg">
                      {m.label}
                    </span>
                  </div>

                  {/* Titre + type */}
                  <h3 className="text-lg font-semibold text-mh-text">Maison {m.label}</h3>
                  {info.type && (
                    <p className="text-[13px] font-medium text-mh-text-2 mt-0.5">{info.type}</p>
                  )}

                  {/* Usages */}
                  {info.uses && (
                    <p className="text-[12px] text-mh-text-4 mt-2 mb-1">{info.uses}</p>
                  )}

                  {/* Description */}
                  {info.desc && (
                    <p className="text-[12.5px] text-mh-text-3 leading-relaxed mb-5">{info.desc}</p>
                  )}

                  {/* Prix */}
                  <div className="pt-4 border-t border-mh-line mt-auto">
                    <p className="text-[11px] text-mh-text-4 font-medium uppercase tracking-wider mb-1">
                      À partir de
                    </p>
                    <p className="text-2xl font-bold text-mh-text tracking-tight">
                      {fmtTTC(prixTTC)}
                      <span className="text-sm font-normal text-mh-text-3 ml-1">TTC</span>
                    </p>
                    <p className="text-[11px] text-mh-text-4 mt-1">Maison + livraison incluse · sans options</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── MÉDIATHÈQUE ── */}
        <section>
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-mh-text mb-0.5">Nos supports</h2>
            <p className="text-[13px] text-mh-text-3">Photos et documents par modèle.</p>
          </div>

          {/* Onglets */}
          <div className="flex items-center gap-1 bg-white border border-mh-line rounded-xl p-1 w-fit mb-5">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeCat === c.id
                    ? 'bg-mh-paper shadow-[0_1px_3px_rgba(0,0,0,.06)] text-mh-text border border-mh-line'
                    : 'text-mh-text-3 hover:text-mh-text'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {mediaErr && (
            <p className="text-sm text-mh-text-3 bg-mh-paper-3 border border-mh-line px-4 py-3 rounded-xl mb-4">
              {mediaErr}
            </p>
          )}

          {loadMedia ? (
            <div className="flex justify-center py-10">
              <span className="w-6 h-6 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-mh-text-4">
              <FolderOpen size={36} className="mx-auto mb-3 opacity-25" />
              <p className="text-sm text-mh-text-3">Aucun support dans cette rubrique.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {files.map(f => <MediaCard key={f.public_id} file={f} />)}
            </div>
          )}
        </section>

        {/* ── CONTACT ── */}
        <div className="bg-mh-noir text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Intéressé par un modèle ?</h2>
          <p className="text-sm text-white/60 mb-7">Contactez-nous pour obtenir un devis personnalisé.</p>
          <div className="flex flex-col items-center gap-3">
            <a href="mailto:matthshouses@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-mh-noir text-sm font-medium
                         px-5 py-2.5 rounded-lg hover:bg-mh-paper-3 transition-colors w-64 justify-center">
              <Mail size={14} />
              matthshouses@gmail.com
            </a>
            <a href="https://www.instagram.com/matthshouses" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium
                         px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors w-64 justify-center">
              <Instagram size={14} />
              @matthshouses
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
