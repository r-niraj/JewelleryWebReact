import { useEffect, useState, useRef } from 'react';

const SECTIONS = [
  'general', 'hero', 'gallery', 'product_detail', 'whats_included',
  'benefits', 'testimonials', 'checkout',
];

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [editingAlt, setEditingAlt] = useState(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const dragRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('section', filter);
      const res = await fetch(`/api/media?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setMedia(data.media);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, [filter]);

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) { setMsg('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg('File too large (max 5MB)'); return; }

    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sectionName', filter || 'general');
      const res = await fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMsg('Uploaded successfully');
        fetchMedia();
      } else {
        setMsg(data.error || 'Upload failed');
      }
    } catch {
      setMsg('Upload failed');
    }
    finally { setUploading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const deleteMedia = async (item) => {
    if (!confirm(`Delete "${item.originalName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/media/${item.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMsg('Deleted');
        fetchMedia();
        if (preview?.id === item.id) setPreview(null);
      } else {
        setMsg(data.error || 'Delete failed');
      }
    } catch {
      setMsg('Delete failed');
    }
  };

  const toggleActive = async (item) => {
    try {
      await fetch(`/api/media/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchMedia();
    } catch { }
  };

  const saveAltText = async (id) => {
    if (!editingAlt) return;
    try {
      await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ altText: editingAlt.altText }),
      });
      setEditingAlt(null);
      setMsg('Alt text updated');
      fetchMedia();
    } catch { }
  };

  const filtered = media.filter((m) =>
    !search || m.originalName.toLowerCase().includes(search.toLowerCase()) || m.altText.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Media Library</h1>
          <span className="text-xs text-muted">Upload and manage website images</span>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-upload'}`} /> {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      </div>

      {msg && (
        <div className="text-xs rounded-lg px-4 py-3 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-700 ml-2">&times;</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${!filter ? 'bg-emerald-deep text-white' : 'bg-white text-body border border-gold-soft/20 hover:border-emerald-deep/30'}`}>All</button>
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === s ? 'bg-emerald-deep text-white' : 'bg-white text-body border border-gold-soft/20 hover:border-emerald-deep/30'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search images..."
          className="ml-auto px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white focus:border-emerald-deep w-48" />
      </div>

      <div
        ref={dragRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gold-soft/30 rounded-xl p-8 text-center mb-6 hover:border-emerald-deep/40 transition cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <i className="fas fa-cloud-upload-alt text-2xl text-muted mb-2" />
        <p className="text-sm text-body font-light">Drag & drop an image here, or click to browse</p>
        <p className="text-[0.65rem] text-muted mt-1">JPG, PNG, WebP up to 5MB</p>
      </div>

      {loading ? (
        <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          <i className="fas fa-images text-3xl mb-3 opacity-30" /><br />No images found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-[16px] overflow-hidden border border-gold-soft/10 group relative">
              <div className="aspect-square overflow-hidden bg-ivory cursor-pointer" onClick={() => setPreview(item)}>
                <img src={item.fileUrl} alt={item.altText || item.originalName} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-2.5">
                <p className="text-[0.65rem] font-medium text-heading truncate">{item.originalName}</p>
                <p className="text-[0.55rem] text-muted">{formatSize(item.fileSize)} &middot; {item.width}&times;{item.height}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <button onClick={() => setPreview(item)}
                    className="flex-1 py-1 text-[0.55rem] font-semibold bg-ivory rounded-md hover:bg-gold-soft/20 transition text-muted" title="Preview">
                    <i className="fas fa-eye" />
                  </button>
                  <button onClick={() => setEditingAlt({ id: item.id, altText: item.altText })}
                    className="flex-1 py-1 text-[0.55rem] font-semibold bg-ivory rounded-md hover:bg-gold-soft/20 transition text-muted" title="Edit Alt Text">
                    <i className="fas fa-pen" />
                  </button>
                  <button onClick={() => toggleActive(item)}
                    className={`flex-1 py-1 text-[0.55rem] font-semibold rounded-md transition ${item.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    title={item.isActive ? 'Active' : 'Inactive'}>
                    <i className={`fas ${item.isActive ? 'fa-eye' : 'fa-eye-slash'}`} />
                  </button>
                  <button onClick={() => deleteMedia(item)}
                    className="flex-1 py-1 text-[0.55rem] font-semibold bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition" title="Delete">
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setPreview(null)}>
          <div className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[16px] p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-3 right-3 text-gray-400 hover:text-heading text-xl">&times;</button>
            <img src={preview.fileUrl} alt={preview.altText} className="w-full rounded-xl max-h-[50vh] object-contain bg-ivory mb-4" />
            <p className="text-sm font-semibold text-heading">{preview.originalName}</p>
            <p className="text-xs text-muted">{formatSize(preview.fileSize)} &middot; {preview.width}&times;{preview.height} &middot; {preview.sectionName}</p>
            {preview.altText && <p className="text-xs text-body mt-1 italic">Alt: {preview.altText}</p>}
          </div>
        </div>
      )}

      {editingAlt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setEditingAlt(null)}>
          <div className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[16px] p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg font-semibold text-heading mb-3">Edit Alt Text</h3>
            <input value={editingAlt.altText} onChange={(e) => setEditingAlt({ ...editingAlt, altText: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setEditingAlt(null)} className="flex-1 py-2.5 border-2 border-gold-soft/30 rounded-[14px] text-xs font-semibold text-heading">Cancel</button>
              <button onClick={() => saveAltText(editingAlt.id)} className="flex-1 py-2.5 bg-emerald-deep text-white rounded-[14px] text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
