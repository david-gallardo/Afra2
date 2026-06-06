'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate } from '@/components/UI';

export default function Veles() {
  const { loaded, veles, addVela, updateVela, deleteVela } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', tipus: 'Major', marca: '', teixit: '', superficie: '', gratil: '', baluma: '', pujamen: '', estat: 'Bo', ubicacion: '', darreraRevisio: '', notes: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => {
    if (!form.nombre) return;
    if (editItem) updateVela(editItem.id, form);
    else addVela(form);
    setModal(false);
  };

  const filtered = veles.filter(v => v.nombre?.toLowerCase().includes(search.toLowerCase()) || v.tipus?.toLowerCase().includes(search.toLowerCase()));
  const tipusVeles = ['Major', 'Gènova', 'Floc', 'Trinqueta', 'Spinnaker', 'Gennaker / Asimètric', 'Codi Zero', 'Altres'];
  const estats = ['Excel·lent', 'Bo', 'Usat', 'Danyat / Reparar', 'Vell'];

  return (
    <>
      <div className="page-header">
        <h1>⛵ Pañol de Veles</h1>
        <p>Inventari de veles, mesures, estat de conservació i revisions de veleria</p>
      </div>
      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar vela..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Afegir Vela</button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Icons.sail} message="Sense veles registrades al pañol." />
      ) : (
        <div className="item-list">
          {filtered.map(item => (
            <AccordionItem key={item.id} title={item.nombre} subtitle={`${item.tipus} · ${item.marca || 'Sense marca'}`} badge={item.estat} badgeClass={item.estat === 'Excel·lent' || item.estat === 'Bo' ? 'ok' : item.estat === 'Usat' ? 'stock' : 'low'}>
              <div className="item-details">
                <div><span className="item-detail-label">Tipus: </span><span className="item-detail-value accent">{item.tipus}</span></div>
                <div><span className="item-detail-label">Marca: </span><span className="item-detail-value">{item.marca || '—'}</span></div>
                <div><span className="item-detail-label">Teixit: </span><span className="item-detail-value">{item.teixit || '—'}</span></div>
                <div><span className="item-detail-label">Superfície: </span><span className="item-detail-value accent">{item.superficie ? `${item.superficie} m²` : '—'}</span></div>
                <div><span className="item-detail-label">Gràtil (G): </span><span className="item-detail-value">{item.gratil ? `${item.gratil} m` : '—'}</span></div>
                <div><span className="item-detail-label">Baluma (B): </span><span className="item-detail-value">{item.baluma ? `${item.baluma} m` : '—'}</span></div>
                <div><span className="item-detail-label">Pujamen (P): </span><span className="item-detail-value">{item.pujamen ? `${item.pujamen} m` : '—'}</span></div>
                <div><span className="item-detail-label">Ubicació: </span><span className="item-detail-value">{item.ubicacion || '—'}</span></div>
                {item.darreraRevisio && <div style={{ gridColumn: 'span 2' }}><span className="item-detail-label">Darrera revisió: </span><span className="item-detail-value">{formatDate(item.darreraRevisio)}</span></div>}
              </div>
              {item.notes && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.notes}</p>}
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteVela(item.id)}>{Icons.trash} Esborrar</button>
              </div>
            </AccordionItem>
          ))}
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Vela' : 'Afegir Nova Vela'}>
        <div className="form-group"><label>Nom de la vela</label><input value={form.nombre || ''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Major Hood Dacron" /></div>
        <div className="form-row">
          <div className="form-group"><label>Tipus de vela</label><select value={form.tipus || ''} onChange={e => setForm({...form, tipus: e.target.value})}>{tipusVeles.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Marca / Veleria</label><input value={form.marca || ''} onChange={e => setForm({...form, marca: e.target.value})} placeholder="Ex: Hood Sails" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Teixit / Material</label><input value={form.teixit || ''} onChange={e => setForm({...form, teixit: e.target.value})} placeholder="Ex: Dacron Marblehead" /></div>
          <div className="form-group"><label>Superfície (m²)</label><input type="number" step="0.01" value={form.superficie || ''} onChange={e => setForm({...form, superficie: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Gràtil (m)</label><input type="number" step="0.01" value={form.gratil || ''} onChange={e => setForm({...form, gratil: e.target.value})} /></div>
          <div className="form-group"><label>Baluma (m)</label><input type="number" step="0.01" value={form.baluma || ''} onChange={e => setForm({...form, baluma: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Pujamen (m)</label><input type="number" step="0.01" value={form.pujamen || ''} onChange={e => setForm({...form, pujamen: e.target.value})} /></div>
          <div className="form-group"><label>Estat</label><select value={form.estat || ''} onChange={e => setForm({...form, estat: e.target.value})}>{estats.map(e => <option key={e}>{e}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Ubicació al vaixell</label><input value={form.ubicacion || ''} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Ex: Sac Proa o Tambutx popa" /></div>
          <div className="form-group"><label>Revisió o Bugaderia</label><input type="date" value={form.darreraRevisio || ''} onChange={e => setForm({...form, darreraRevisio: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Observacions / Reparacions pendents</label><textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Ex: Petit estrip prop del puny d'escota. Sables en bon estat." /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Vela</button>
      </Modal>
    </>
  );
}
