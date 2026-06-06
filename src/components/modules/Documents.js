'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate } from '@/components/UI';

export default function Documents() {
  const { loaded, documents, addDocumento, updateDocumento, deleteDocumento } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', descripcion: '', categoria: 'Documentació Barco', fecha: '', caducidad: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateDocumento(editItem.id, form) : addDocumento(form); setModal(false); };

  const categorias = ['Documentació Barco', 'Assegurança', 'Certificats de Navegabilitat', 'Manuals d\'Equips', 'Títols de Patró', 'Factures / Rebuts', 'Altres'];
  const filtered = documents.filter(d => d.nombre?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-header">
        <h1>📄 Documents i Manuals</h1>
        <p>Documentació oficial, manuals dels equips, certificats i assegurances del vaixell</p>
      </div>
      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar document..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou document</button>
      </div>
      {filtered.length === 0 ? <EmptyState icon={Icons.file} message="Sense documents registrats." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.nombre} subtitle={item.descripcion || 'Sense descripció'} badge={item.categoria} badgeClass="ok">
            <div className="item-details">
              <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.categoria}</span></div>
              {item.fecha && <div><span className="item-detail-label">Data: </span><span className="item-detail-value">{formatDate(item.fecha)}</span></div>}
              {item.caducidad && <div><span className="item-detail-label">Caducitat: </span><span className="item-detail-value orange">{formatDate(item.caducidad)}</span></div>}
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteDocumento(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Document' : 'Afegir Document'}>
        <div className="form-group"><label>Nom del document</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Rol de Despatx, Assegurança Obligatòria..." /></div>
        <div className="form-group"><label>Breu descripció</label><input value={form.descripcion||''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ex: Pòlissa vigent fins el 2026..." /></div>
        <div className="form-group"><label>Categoria</label><select value={form.categoria||''} onChange={e => setForm({...form, categoria: e.target.value})}>{categorias.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="form-row">
          <div className="form-group"><label>Data document</label><input type="date" value={form.fecha||''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
          <div className="form-group"><label>Data de caducitat / Renovació</label><input type="date" value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Document</button>
      </Modal>
    </>
  );
}
