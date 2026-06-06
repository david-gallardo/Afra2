'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, getExpiryClass, getExpiryLabel } from '@/components/UI';

export default function Despensa() {
  const { loaded, despensa, addDespensa, updateDespensa, deleteDespensa } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', cantidad: '1', caducidad: '', ubicacion: 'Celler', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateDespensa(editItem.id, form) : addDespensa(form); setModal(false); };

  const filtered = despensa.filter(i => i.nombre?.toLowerCase().includes(search.toLowerCase()));
  const locations = ['General', 'Nevera', 'Congelador', 'Sentina', 'Pañol cuina', 'Alaca', 'Altres'];

  const expiring = despensa.filter(d => {
    if (!d.caducidad) return false;
    const diff = (new Date(d.caducidad) - new Date()) / (1000*60*60*24);
    return diff < 30;
  }).length;

  return (
    <>
      <div className="page-header">
        <h1>🥫 Control de Despensa</h1>
        <p>Provisions de menjar i beguda a bord. Dates de caducitat per a travesses llargues.</p>
      </div>
      {expiring > 0 && (
        <div className="summary-cards" style={{marginBottom:20}}>
          <div className="summary-card"><div className="summary-card-label">Caducant aviat</div><div className="summary-card-value warning">{expiring}</div></div>
          <div className="summary-card"><div className="summary-card-label">Total articles</div><div className="summary-card-value accent">{despensa.length}</div></div>
        </div>
      )}
      <div className="toolbar">
        <div className="toolbar-search">{Icons.search}<input placeholder="Buscar provisions..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Afegir provisió</button>
      </div>
      {filtered.length === 0 ? <EmptyState icon={Icons.coffee} message="Despensa buida. Afegeix menjar o beguda." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.nombre} subtitle={item.ubicacion} badge={`${item.cantidad} ud.`} badgeClass="stock">
            <div className="item-details">
              <div><span className="item-detail-label">Ubicació: </span><span className="item-detail-value">{item.ubicacion}</span></div>
              <div><span className="item-detail-label">Quantitat: </span><span className="item-detail-value accent">{item.cantidad}</span></div>
              <div><span className="item-detail-label">Caducitat: </span><span className={`item-detail-value ${getExpiryClass(item.caducidad)}`}>{item.caducidad ? getExpiryLabel(item.caducidad) : '—'}</span></div>
            </div>
            {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notas}</p>}
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteDespensa(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Provisió' : 'Nova Provisió'}>
        <div className="form-group"><label>Nom de l'article</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: llaunes de tonyina" /></div>
        <div className="form-row">
          <div className="form-group"><label>Quantitat</label><input type="number" value={form.cantidad||''} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
          <div className="form-group"><label>Data de caducitat</label><input type="date" value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Ubicació al vaixell</label><select value={form.ubicacion||''} onChange={e => setForm({...form, ubicacion: e.target.value})}>{locations.map(u => <option key={u}>{u}</option>)}</select></div>
        <div className="form-group"><label>Observacions</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Provisió</button>
      </Modal>
    </>
  );
}
