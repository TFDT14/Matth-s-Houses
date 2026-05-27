import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, File, Image, FileText, RefreshCw, X, FolderOpen } from 'lucide-react';
import { mediaApi } from '../utils/api';
import Button from '../components/Button';

/* ── constantes catégories ── */
const CATS = [
  { id: 'all',     label: 'Tous' },
  { id: '20m2',    label: '20 m²' },
  { id: '37m2',    label: '37 m²' },
  { id: '56m2',    label: '56 m²' },
  { id: '74m2',    label: '74 m²' },
  { id: 'options', label: 'Options' },
];

function fileIcon(fmt) {
  if (fmt?.startsWith('image') || ['jpg','jpeg','png','gif','webp','svg'].includes(fmt)) return Image;
  if (fmt?.includes('pdf') || fmt === 'pdf') return FileText;
  return File;
}

/* ── Card fichier ── */
function FileCard({ file, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const Icon    = fileIcon(file.format);
  const isImage = file.resource_type === 'image';

  const handleDelete = async () => {
    if (!confirm('Supprimer ce fichier ?')) return;
    setDeleting(true);
    try { await onDelete(file.public_id); }
    catch { alert('Erreur lors de la suppression'); setDeleting(false); }
  };

  return (
    <div className="bg-mh-paper border border-mh-line rounded-xl overflow-hidden
                    hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,.08)] transition-shadow group">
      <div className="h-36 bg-mh-paper-2 flex items-center justify-center overflow-hidden">
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
      <div className="p-3">
        <p className="text-xs font-medium text-mh-text truncate">{file.public_id.split('/').pop()}</p>
        <p className="text-[11px] text-mh-text-4 mt-0.5">
          {file.bytes ? `${(file.bytes / 1024).toFixed(0)} Ko` : ''}
          {file.format ? ` · ${file.format.toUpperCase()}` : ''}
        </p>
      </div>
      <div className="px-3 pb-3 flex gap-2">
        <a href={file.secure_url} target="_blank" rel="noreferrer" download
          className="btn-secondary text-xs py-1.5 flex-1 justify-center">
          <Download size={11} /> Télécharger
        </a>
        <button onClick={handleDelete} disabled={deleting}
          className="p-1.5 text-mh-text-4 hover:text-mh-text hover:bg-mh-paper-3 rounded-lg transition-colors disabled:opacity-40">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Modal upload ── */
function UploadModal({ onClose, onUpload, uploading }) {
  const [cat,      setCat]      = useState('all');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const submit = (file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    if (cat !== 'all') form.append('category', cat);
    onUpload(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-mh-paper border border-mh-line rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,.18)]
                      w-full max-w-sm p-6 space-y-5">

        {/* Entête */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-mh-text">Importer un fichier</h3>
          <button onClick={onClose}
            className="p-1.5 text-mh-text-4 hover:text-mh-text hover:bg-mh-paper-3 rounded-lg transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Catégorie */}
        <div>
          <label className="label">Rubrique</label>
          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  cat === c.id
                    ? 'border-mh-noir bg-mh-noir text-white'
                    : 'border-mh-line bg-mh-paper-2 text-mh-text-2 hover:border-mh-line-2'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zone drop */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) submit(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors ${
            dragging ? 'border-mh-noir bg-mh-paper-3' : 'border-mh-line hover:border-mh-line-2'
          }`}>
          {uploading ? (
            <span className="w-6 h-6 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin mx-auto block" />
          ) : (
            <>
              <Upload size={22} className="mx-auto text-mh-text-4 mb-2" />
              <p className="text-sm text-mh-text-3">
                Glissez ou <span className="font-medium text-mh-text">cliquez</span>
              </p>
              <p className="text-xs text-mh-text-4 mt-1">Images, PDF, présentations — 20 Mo max</p>
            </>
          )}
          <input ref={inputRef} type="file" className="hidden"
            accept="image/*,.pdf,.ppt,.pptx,.doc,.docx"
            onChange={e => { const f = e.target.files?.[0]; if (f) submit(f); e.target.value = ''; }} />
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ── */
export default function MediaLibrary() {
  const [files,       setFiles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState('');
  const [activeCat,   setActiveCat]   = useState('all');
  const [showModal,   setShowModal]   = useState(false);

  const fetchFiles = async (cat = activeCat) => {
    setLoading(true); setError('');
    try {
      const res = await mediaApi.getAll(cat === 'all' ? undefined : cat);
      setFiles(res.data.files || []);
    } catch {
      setError('Impossible de charger les fichiers. Vérifiez la config Cloudinary.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(activeCat); }, [activeCat]); // eslint-disable-line

  const handleCat = (id) => {
    setActiveCat(id);
  };

  const handleUpload = async (formData) => {
    setUploading(true); setError('');
    try {
      await mediaApi.upload(formData);
      setShowModal(false);
      await fetchFiles(activeCat);
    } catch { setError("Erreur lors de l'upload."); }
    setUploading(false);
  };

  const handleDelete = async (publicId) => {
    await mediaApi.delete(publicId);
    setFiles(prev => prev.filter(f => f.public_id !== publicId));
  };

  const catLabel = CATS.find(c => c.id === activeCat)?.label || 'Tous';

  return (
    <div className="space-y-5 max-w-5xl">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-mh-text tracking-tight">Médiathèque</h2>
          <p className="text-sm text-mh-text-3 mt-0.5">
            {files.length} fichier{files.length !== 1 ? 's' : ''} · {catLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchFiles(activeCat)}
            className="p-2 text-mh-text-4 hover:text-mh-text-2 hover:bg-mh-paper-3 rounded-lg transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="primary" onClick={() => setShowModal(true)} disabled={uploading}>
            <Upload size={14} /> Importer
          </Button>
        </div>
      </div>

      {/* Onglets catégories */}
      <div className="flex items-center gap-1 bg-mh-paper-2 border border-mh-line rounded-xl p-1 w-fit">
        {CATS.map(c => (
          <button key={c.id} onClick={() => handleCat(c.id)}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              activeCat === c.id
                ? 'bg-mh-paper shadow-[0_1px_3px_rgba(0,0,0,.06)] text-mh-text border border-mh-line'
                : 'text-mh-text-3 hover:text-mh-text'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-mh-text-2 bg-mh-paper-3 border border-mh-line px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* Grille */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-7 h-7 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-mh-text-4">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-mh-text-3">Aucun fichier dans cette rubrique</p>
          <p className="text-sm mt-1">Importez des supports via le bouton « Importer ».</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {files.map(f => (
            <FileCard key={f.public_id} file={f} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal upload */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
}
