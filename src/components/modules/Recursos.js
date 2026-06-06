'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons } from '@/components/UI';

export default function Recursos() {
  const { loaded, recursos, addRecurs, updateRecurs, deleteRecurs } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', descripcion: '', enlace: '', categoria: 'YouTube' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateRecurs(editItem.id, form) : addRecurs(form); setModal(false); };

  const filtered = recursos.filter(r => r.nombre?.toLowerCase().includes(search.toLowerCase()) || r.descripcion?.toLowerCase().includes(search.toLowerCase()));
  const categories = ['YouTube', 'Instagram', 'Fòrums i Comunitat', 'Blog', 'Eines i Meteo', 'Altres'];

  return (
    <>
      <div className="page-header">
        <h1>📱 Recursos Multimèdia</h1>
        <p>Enllaços d'interès a canals de YouTube, fòrums, comptes d'Instagram i eines per a armadors</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar recurs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou Recurs</button>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Icons.phone} message="Sense recursos guardats." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.nombre} subtitle={item.categoria} badge="Obre Enllaç" badgeClass="ok">
            <div className="item-details">
              <div style={{ gridColumn: 'span 2' }}>
                <span className="item-detail-label">Descripció: </span>
                <p className="item-detail-value" style={{ marginTop: 4, color: 'var(--text-main)' }}>{item.descripcion}</p>
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
                <span className="item-detail-label">Enllaç directe: </span>
                <a href={item.enlace} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600, marginTop: 4 }}>
                  🌐 {item.enlace}
                </a>
              </div>
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteRecurs(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Recurs' : 'Afegir Nou Recurs Multimèdia'}>
        <div className="form-group"><label>Nom del canal / compte / web</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Allende los mares" /></div>
        <div className="form-group"><label>Breu descripció</label><input value={form.descripcion||''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="De què tracta aquest recurs..." /></div>
        <div className="form-group"><label>URL / Enllaç</label><input value={form.enlace||''} onChange={e => setForm({...form, enlace: e.target.value})} placeholder="Ex: https://instagram.com/username" /></div>
        <div className="form-group"><label>Categoria</label><select value={form.categoria||'YouTube'} onChange={e => setForm({...form, categoria: e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Recurs</button>
      </Modal>
    </>
  );
}
