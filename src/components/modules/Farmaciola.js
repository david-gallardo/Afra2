'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, getExpiryClass, getExpiryLabel } from '@/components/UI';

export default function Farmaciola() {
  const { loaded, farmaciola, addFarmaciola, updateFarmaciola, deleteFarmaciola } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', cantidad: '1', caducidad: '', tipo: 'Medicament', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateFarmaciola(editItem.id, form) : addFarmaciola(form); setModal(false); };
  const tipos = ['Medicament', 'Vendatge', 'Antisèptic', 'Material Quirúrgic', 'Altres'];

  return (
    <>
      <div className="page-header">
        <h1>💊 Farmaciola de Seguretat</h1>
        <p>Medicaments, material sanitari i dates de caducitat obligatòries</p>
      </div>
      <div className="toolbar"><div /><button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou element</button></div>
      {farmaciola.length === 0 ? <EmptyState icon={Icons.heart} message="Farmaciola buida." /> : (
        <div className="item-list">{farmaciola.map(item => {
          const ec = getExpiryClass(item.caducidad);
          return (
            <AccordionItem key={item.id} title={item.nombre} subtitle={item.tipo} badge={item.caducidad ? getExpiryLabel(item.caducidad) : ''} badgeClass={ec === 'expiry-expired' ? 'expired' : ec === 'expiry-warning' ? 'low' : 'ok'}>
              <div className="item-details">
                <div><span className="item-detail-label">Quantitat: </span><span className="item-detail-value accent">{item.cantidad}</span></div>
                <div><span className="item-detail-label">Caducitat: </span><span className={`item-detail-value ${ec === 'expiry-expired' ? 'red' : ec === 'expiry-warning' ? 'orange' : 'green'}`}>{item.caducidad ? getExpiryLabel(item.caducidad) : '—'}</span></div>
              </div>
              {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notas}</p>}
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteFarmaciola(item.id)}>{Icons.trash} Esborrar</button>
              </div>
            </AccordionItem>
          );
        })}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Farmaciola' : 'Afegir a Farmaciola'}>
        <div className="form-group"><label>Nom del medicament / material</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Ibuprofèn 600mg" /></div>
        <div className="form-row">
          <div className="form-group"><label>Quantitat</label><input type="number" value={form.cantidad||''} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
          <div className="form-group"><label>Data de caducitat</label><input type="date" value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Tipus</label><select value={form.tipo||''} onChange={e => setForm({...form, tipo: e.target.value})}>{tipos.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label>Observacions / Posologia a bord</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Per al mal de cap o febre" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar</button>
      </Modal>
    </>
  );
}
