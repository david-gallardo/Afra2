'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons } from '@/components/UI';

export default function Inventari() {
  const { loaded, inventari, addInventari, updateInventari, deleteInventari } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', referencia: '', precio: '', stock: '1', alertaMinima: '1', categoria: 'General', ubicacionGeneral: 'Sense assignar', ubicacionEspecifica: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => {
    if (!form.nombre) return;
    if (editItem) updateInventari(editItem.id, form);
    else addInventari(form);
    setModal(false);
  };

  const filtered = inventari.filter(i => i.nombre?.toLowerCase().includes(search.toLowerCase()) || i.referencia?.toLowerCase().includes(search.toLowerCase()));
  const categories = ['General', 'Motor', 'Electricitat', 'Electrònica', 'Coberta i Jarrecia', 'Seguretat', 'Fondeig', 'Veles', 'Fontaneria', 'Altres'];
  const locations = ['Sense assignar', 'Tambutx proa', 'Tambutx popa babor', 'Tambutx popa estribor', 'Mirall de popa', 'Cofre banyera', 'Pañol de veles', 'Sentina', 'Calaixos cuina', 'Taula de cartes', 'Motor', 'Altres'];

  const lowStock = inventari.filter(i => i.alertaMinima && parseInt(i.stock) <= parseInt(i.alertaMinima)).length;

  return (
    <>
      <div className="page-header">
        <h1>📦 Inventari i Recanvis</h1>
        <p>Controla on vas desar cada peça, corretja o filtre i l'stock disponible</p>
      </div>
      {lowStock > 0 && (
        <div className="summary-cards" style={{ marginBottom: 20 }}>
          <div className="summary-card">
            <div className="summary-card-label">Articles sota mínims</div>
            <div className="summary-card-value warning">{lowStock}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Total referències</div>
            <div className="summary-card-value accent">{inventari.length}</div>
          </div>
        </div>
      )}
      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar peça o recanvi..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Afegir peça</button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Icons.box} message="L'inventari està buit. Afegeix el teu primer recanvi." />
      ) : (
        <div className="item-list">
          {filtered.map(item => {
            const isLow = item.alertaMinima && parseInt(item.stock) <= parseInt(item.alertaMinima);
            return (
              <AccordionItem key={item.id} title={item.nombre} subtitle={`Ref: ${item.referencia || 'Sense referència'}`} badge={`${item.stock} unit.`} badgeClass={isLow ? 'low' : 'stock'}>
                <div className="item-details">
                  <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.categoria}</span></div>
                  <div><span className="item-detail-label">Preu aproximat: </span><span className="item-detail-value">{item.precio ? `${item.precio} €` : '—'}</span></div>
                  <div><span className="item-detail-label">Ubicació General: </span><span className="item-detail-value">{item.ubicacionGeneral || '—'}</span></div>
                  {item.ubicacionEspecifica && <div><span className="item-detail-label">Ubicació Específica: </span><span className="item-detail-value">{item.ubicacionEspecifica}</span></div>}
                  <div><span className="item-detail-label">Stock Actual: </span><span className={`item-detail-value ${isLow ? 'orange' : 'green'}`}>{item.stock}</span></div>
                  <div><span className="item-detail-label">Alerta de Stock Mínim: </span><span className="item-detail-value">{item.alertaMinima || '—'}</span></div>
                </div>
                <div className="item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteInventari(item.id)}>{Icons.trash} Esborrar</button>
                </div>
              </AccordionItem>
            );
          })}
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Peça' : 'Nova Peça / Recanvi'}>
        <div className="form-group"><label>Nom de la peça</label><input value={form.nombre || ''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Impeller/Turbina bomba aigua" /></div>
        <div className="form-row">
          <div className="form-group"><label>Referència / Part Number</label><input value={form.referencia || ''} onChange={e => setForm({...form, referencia: e.target.value})} placeholder="Ex: 128296-42070" /></div>
          <div className="form-group"><label>Preu unitari (€)</label><input type="number" step="0.01" value={form.precio || ''} onChange={e => setForm({...form, precio: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Unitats en Stock</label><input type="number" value={form.stock || ''} onChange={e => setForm({...form, stock: e.target.value})} /></div>
          <div className="form-group"><label>Alerta Mínima (Stock)</label><input type="number" value={form.alertaMinima || ''} onChange={e => setForm({...form, alertaMinima: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Categoria</label><select value={form.categoria || ''} onChange={e => setForm({...form, categoria: e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group"><label>Ubicació General</label><select value={form.ubicacionGeneral || ''} onChange={e => setForm({...form, ubicacionGeneral: e.target.value})}>{locations.map(u => <option key={u}>{u}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Ubicació Detallada / Caixa</label><input value={form.ubicacionEspecifica || ''} onChange={e => setForm({...form, ubicacionEspecifica: e.target.value})} placeholder="Ex: Caixa plàstic vermella sota llitera babor" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Peça</button>
      </Modal>
    </>
  );
}
