import { useEffect, useState, useRef } from 'react';

export default function HeroManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState(null);
  const [editingAlt, setEditingAlt] = useState(null);
  const fileRef = useRef(null);
  const dragRef = useRef(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero-media', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setItems(data.media);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const uploadFile = async (file) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo && !file.type.startsWith('image/')) { setMsg('Only images and MP4 videos allowed'); return; }
    if (file.size > 50 * 1024 * 1024) { setMsg('File too large (max 50MB)'); return; }

    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('altText', '');
      fd.append('isPrimary', items.length === 0 ? 'true' : 'false');
      const res = await fetch('/api/hero-media', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (data.success) { setMsg('Uploaded'); fetchItems(); }
      else setMsg(data.error || 'Upload failed');
    } catch { setMsg('Upload failed'); }
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

  const setPrimary = async (id) => {
    try {
      await fetch(`/api/hero-media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPrimary: true }),
      });
      fetchItems();
    } catch { }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.originalName}"?`)) return;
    try {
      const res = await fetch(`/api/hero-media/${item.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setMsg('Deleted'); fetchItems(); if (preview?.id === item.id) setPreview(null); }
      else setMsg(data.error || 'Delete failed');
    } catch { setMsg('Delete failed'); }
  };

  const toggleActive = async (item) => {
    try {
      await fetch(`/api/hero-media/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      });
      fetchItems();
    } catch { }
  };

  const saveAltText = async (id) => {
    if (!editingAlt) return;
    try {
      await fetch(`/api/hero-media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ altText: editingAlt.altText }),
      });
      setEditingAlt(null);
      setMsg('Alt text updated');
      fetchItems();
    } catch { }
  };

  const moveItem = async (id, direction) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0 || idx + direction < 0 || idx + direction >= items.length) return;
    const swap = [...items];
    [swap[idx], swap[idx + direction]] = [swap[idx + direction], swap[idx]];
    swap.forEach((item, i) => { item.displayOrder = i; });
    setItems(swap);
    try {
      await Promise.all(swap.map((item) =>
        fetch(`/api/hero-media/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ displayOrder: item.displayOrder }),
        })
      ));
    } catch { }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Hero Manager</h1>
          <span className="text-xs text-muted">Manage hero section images & videos</span>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-upload'}`} /> {uploading ? 'Uploading...' : 'Add Media'}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" onChange={handleFileChange} className="hidden" />
      </div>

      {msg && (
        <div className="text-xs rounded-lg px-4 py-3 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="ml-2">&times;</button>
        </div>
      )}

      <div ref={dragRef} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
        className="border-2 border-dashed border-gold-soft/30 rounded-xl p-6 text-center mb-6 hover:border-emerald-deep/40 transition cursor-pointer"
        onClick={() => fileRef.current?.click()}>
        <i className="fas fa-cloud-upload-alt text-2xl text-muted mb-1" />
        <p className="text-sm text-body font-light">Drag & drop hero media here, or click to browse</p>
        <p className="text-[0.65rem] text-muted mt-0.5">JPG, PNG, WebP, MP4 up to 50MB</p>
      </div>

      {loading ? (
        <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          <i className="fas fa-image text-3xl mb-3 opacity-30" /><br />No hero media yet. Upload your first image or video.
        </div>
      ) : (
        <div>
          <div className="flex gap-3 mb-4 text-xs text-muted font-semibold px-1">
            <span className="w-12">Order</span>
            <span className="flex-1">Preview</span>
            <span className="w-20">Type</span>
            <span className="w-24">Status</span>
            <span className="w-40">Actions</span>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-[16px] p-3 flex items-center gap-3 border border-gold-soft/10">
                <div className="flex flex-col gap-1 w-12 items-center">
                  <button onClick={() => moveItem(item.id, -1)} disabled={idx === 0}
                    className="text-muted hover:text-heading disabled:opacity-20 text-xs"><i className="fas fa-chevron-up" /></button>
                  <span className="text-[0.6rem] font-mono text-muted">{idx + 1}</span>
                  <button onClick={() => moveItem(item.id, 1)} disabled={idx === items.length - 1}
                    className="text-muted hover:text-heading disabled:opacity-20 text-xs"><i className="fas fa-chevron-down" /></button>
                </div>
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-ivory flex-shrink-0 cursor-pointer" onClick={() => setPreview(item)}>
                  {item.mediaType === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/5 text-muted"><i className="fas fa-video text-xl" /></div>
                  ) : (
                    <img src={item.fileUrl} alt={item.altText} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-heading truncate">{item.originalName}</p>
                  <p className="text-[0.6rem] text-muted">{formatSize(item.fileSize)} &middot; {item.width}&times;{item.height}</p>
                </div>
                <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full w-20 text-center ${item.mediaType === 'video' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {item.mediaType}
                </span>
                <div className="flex items-center gap-1.5 w-56">
                  {!item.isPrimary ? (
                    <button onClick={() => setPrimary(item.id)}
                      className="px-2.5 py-1 text-[0.55rem] font-semibold bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 whitespace-nowrap">Set as Primary</button>
                  ) : (
                    <span className="px-2.5 py-1 text-[0.55rem] font-semibold bg-emerald-50 text-emerald-600 rounded-md whitespace-nowrap">
                      <i className="fas fa-star mr-0.5" /> Primary
                    </span>
                  )}
                  <button onClick={() => setEditingAlt({ id: item.id, altText: item.altText })}
                    className="px-2 py-1 text-[0.55rem] bg-ivory rounded-md hover:bg-gold-soft/20 text-muted" title="Edit alt text"><i className="fas fa-pen" /></button>
                  <button onClick={() => toggleActive(item)}
                    className="px-2 py-1 text-[0.55rem] bg-red-50 text-red-500 rounded-md hover:bg-red-100" title="Remove from hero"><i className="fas fa-eye-slash" /></button>
                  <button onClick={() => deleteItem(item)}
                    className="px-2 py-1 text-[0.55rem] bg-red-50 text-red-500 rounded-md hover:bg-red-100" title="Delete permanently"><i className="fas fa-trash" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setPreview(null)}>
          <div className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[16px] p-5 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-3 right-3 text-gray-400 hover:text-heading text-xl z-10">&times;</button>
            {preview.mediaType === 'video' ? (
              <video src={preview.fileUrl} controls className="w-full rounded-xl max-h-[60vh]" />
            ) : (
              <img src={preview.fileUrl} alt={preview.altText} className="w-full rounded-xl max-h-[60vh] object-contain bg-ivory" />
            )}
            <p className="text-sm font-semibold text-heading mt-3">{preview.originalName}</p>
            <p className="text-xs text-muted">{formatSize(preview.fileSize)} &middot; {preview.width}&times;{preview.height} &middot; {preview.mediaType} {preview.isPrimary && '· Primary'}</p>
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
