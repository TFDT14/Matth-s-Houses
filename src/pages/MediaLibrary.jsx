import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, File, Image, FileText, RefreshCw } from 'lucide-react';
import { mediaApi } from '../utils/api';

function fileIcon(type) {
  if (type?.startsWith('image')) return Image;
  if (type?.includes('pdf'))    return FileText;
  return File;
}

function FileCard({ file, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const Icon = fileIcon(file.format);
  const isImage = file.resource_type === 'image';

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${file.public_id}" ?`)) return;
    setDeleting(true);
    try { await onDelete(file.public_id); }
    catch { alert('Erreur lors de la suppression'); setDeleting(false); }
  };

  return (
    <div className="card p-0 overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={file.secure_url} alt={file.public_id}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Icon size={36} />
            <span className="text-xs uppercase font-bold">{file.format || 'fichier'}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-800 truncate" title={file.public_id}>
          {file.public_id.split('/').pop()}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {file.bytes ? `${(file.bytes / 1024).toFixed(0)} Ko` : ''} {file.format && `• ${file.format.toUpperCase()}`}
        </p>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <a href={file.secure_url} target="_blank" rel="noreferrer" download
          className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
          <Download size={12} /> Télécharger
        </a>
        <button onClick={handleDelete} disabled={deleting}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function MediaLibrary() {
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
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
    setUploading(true);
    setError('');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Médiathèque</h2>
          <p className="text-sm text-gray-400 mt-0.5">{files.length} fichier{files.length !== 1 ? 's' : ''} • Cloudinary</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchFiles} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="btn-primary flex items-center gap-2 text-sm">
            {uploading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Upload size={15} /> Importer</>
            }
          </button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload}
            accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx" />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const dt = new DataTransfer(); dt.items.add(f); inputRef.current.files = dt.files; handleUpload({ target: inputRef.current }); } }}
        className="border-2 border-dashed border-gray-300 hover:border-red-400 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
      >
        <Upload size={28} className="mx-auto text-gray-300 group-hover:text-red-400 transition-colors mb-2" />
        <p className="text-sm text-gray-500">Glissez-déposez un fichier ou <span className="text-red-600 font-semibold">cliquez pour importer</span></p>
        <p className="text-xs text-gray-400 mt-1">Images, PDF, présentations, documents — Max 20 Mo</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <File size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun fichier</p>
          <p className="text-sm mt-1">Importez votre première plaquette ou photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map(f => <FileCard key={f.public_id} file={f} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
