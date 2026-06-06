'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate } from '@/components/UI';

export default function Manteniment() {
  const { loaded, manteniment, addManteniment, updateManteniment, deleteManteniment } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ titulo: '', descripcion: '', fecha: new Date().toISOString().split('T')[0], tipo: 'General', horasMotor: '', proximaRevision: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => {
    if (!form.titulo) return;
    if (editItem) updateManteniment(editItem.id, form);
    else addManteniment(form);
    setModal(false);
  };

  const filtered = manteniment.filter(i => i.titulo?.toLowerCase().includes(search.toLowerCase()));
  const categories = ['General', 'Motor', 'Casc i Cua', 'Electricitat', 'Veles i Axarcia', 'Electrònica', 'Fondeig', 'Fontaneria', 'Altres'];

  return (
    <>
      <div className="page-header">
        <h1>🛠️ Manteniment i Revisions</h1>
        <p>Registra les hores de motor, canvis d'oli, ànodes, filtres i manteniments preventius</p>
      </div>
      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar manteniment..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou registre</button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Icons.wrench} message="Sense registres de manteniment. Afegeix la primera revisió." />
      ) : (
        <div className="item-list">
          {filtered.map(item => (
            <AccordionItem key={item.id} title={item.titulo} subtitle={formatDate(item.fecha)} badge={item.tipo} badgeClass="ok">
              <div className="item-details">
                <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.tipo}</span></div>
                <div><span className="item-detail-label">Data: </span><span className="item-detail-value">{formatDate(item.fecha)}</span></div>
                {item.horasMotor && <div><span className="item-detail-label">Hores motor: </span><span className="item-detail-value accent">{item.horasMotor} h</span></div>}
                {item.proximaRevision && <div><span className="item-detail-label">Proper control: </span><span className="item-detail-value orange">{formatDate(item.proximaRevision)}</span></div>}
              </div>
              {item.descripcion && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.descripcion}</p>}
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteManteniment(item.id)}>{Icons.trash} Esborrar</button>
              </div>
            </AccordionItem>
          ))}
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Registre' : 'Nou Registre de Manteniment'}>
        <div className="form-group"><label>Títol / Feina</label><input value={form.titulo || ''} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Canvi d'oli de motor i filtre" /></div>
        <div className="form-row">
          <div className="form-group"><label>Data</label><input type="date" value={form.fecha || ''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
          <div className="form-group"><label>Categoria</label><select value={form.tipo || ''} onChange={e => setForm({...form, tipo: e.target.value})}>{categories.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Hores motor (lectura tauler)</label><input type="number" value={form.horasMotor || ''} onChange={e => setForm({...form, horasMotor: e.target.value})} placeholder="Ex: 1255" /></div>
          <div className="form-group"><label>Propera revisió (data o control)</label><input type="date" value={form.proximaRevision || ''} onChange={e => setForm({...form, proximaRevision: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Descripció detallada / Referències utilitzades</label><textarea value={form.descripcion || ''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ex: Oli 15W40 Mineral. Filtre d'oli Mann-Filter W814/80." /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Manteniment</button>
      </Modal>
    </>
  );
}
