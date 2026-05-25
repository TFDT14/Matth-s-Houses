import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, File, Image, FileText, RefreshCw } from 'lucide-react';
import { mediaApi } from '../utils/api';
import Button from '../components/Button';

function fileIcon(fmt) {
  if (fmt?.startsWith('image') || ['jpg','jpeg','png','gif','webp','svg'].includes(fmt)) return Image;
  if (fmt?.includes('pdf') || fmt === 'pdf') return FileText;
  return File;
}

function FileCard({ file, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const Icon    = fileIcon(file.format);
  const isImage = file.resource_type === 'image';

  const handleDelete = async () => {
    if (!confirm(`Supprimer ce fichier ?`)) return;
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

export default function MediaLibrary() {
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const inputRef = useRef();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await mediaApi.getAll();
      setFiles(res.data.files || []);
    } catch { setError('Impossible de charger les fichiers. Vérifiez la config Cloudinary.'); }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      await mediaApi.upload(form);
      await fetchFiles();
    } catch { setError("Erreur lors de l'upload."); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (publicId) => {
    await mediaApi.delete(publicId);
    setFiles(prev => prev.filter(f => f.public_id !== publicId));
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-mh-text tracking-tight">Médiathèque</h2>
          <p className="text-sm text-mh-text-3 mt-0.5">
            {files.length} fichier{files.length !== 1 ? 's' : ''} · Cloudinary
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchFiles}
            className="p-2 text-mh-text-4 hover:text-mh-text-2 hover:bg-mh-paper-3 rounded-lg transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Upload size={14} /> Importer</>
            }
          </Button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload}
            accept="image/*,.pdf,.ppt,.pptx,.doc,.docx" />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) { const dt = new DataTransfer(); dt.items.add(f); inputRef.current.files = dt.files; handleUpload({ target: inputRef.current }); }
        }}
        className="border-2 border-dashed border-mh-line hover:border-mh-line-2 rounded-2xl p-8 text-center
                   cursor-pointer transition-colors group"
      >
        <Upload size={24} className="mx-auto text-mh-text-4 group-hover:text-mh-text-3 transition-colors mb-2" />
        <p className="text-sm text-mh-text-3">
          Glissez-déposez ou <span className="font-medium text-mh-text">cliquez pour importer</span>
        </p>
        <p className="text-xs text-mh-text-4 mt-1">Images, PDF, présentations — max 20 Mo</p>
      </div>

      {error && (
        <p className="text-sm text-mh-text-2 bg-mh-paper-3 border border-mh-line px-4 py-3 rounded-xl">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-7 h-7 border-2 border-mh-line-2 border-t-mh-noir rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-mh-text-4">
          <File size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-mh-text-3">Aucun fichier</p>
          <p className="text-sm mt-1">Importez votre première plaquette ou photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {files.map(f => <FileCard key={f.public_id} file={f} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
