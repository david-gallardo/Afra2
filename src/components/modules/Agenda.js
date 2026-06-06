'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons } from '@/components/UI';

export default function Agenda() {
  const { loaded, agenda, addContacto, updateContacto, deleteContacto } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', cargo: '', telefono: '', email: '', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateContacto(editItem.id, form) : addContacto(form); setModal(false); };

  const filtered = agenda.filter(c => c.nombre?.toLowerCase().includes(search.toLowerCase()) || c.cargo?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-header">
        <h1>📇 Agenda de Contactes</h1>
        <p>Contactes útils: marineria, mecànics, veleries, cofrades del port i emergències</p>
      </div>

      {/* Números d'emergència immediats estil Taerna del Puerto */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="dashboard-card" style={{ gridColumn: 'span 2', padding: 14, background: 'var(--card-bg)' }}>
          <h4 style={{ color: 'var(--accent)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>📞 Telèfons d'Emergència Nàutica</h4>
          <div style={{ fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div><strong>Salvament Marítim:</strong> 900 202 202</div>
            <div><strong>Urgències Mèdiques:</strong> 112</div>
            <div><strong>Radiomèdica Espanyola:</strong> +34 913 103 475</div>
            <div><strong>Grup de Rescat (GEAS):</strong> +34 934 123 456</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar contacte..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou contacte</button>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Icons.phone} message="Sense contactes a l'agenda." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.nombre} subtitle={item.cargo || 'General'} badge={item.telefono} badgeClass="ok">
            <div className="item-details">
              <div><span className="item-detail-label">Nom complet: </span><span className="item-detail-value accent">{item.nombre}</span></div>
              {item.cargo && <div><span className="item-detail-label">Rol / Servei: </span><span className="item-detail-value">{item.cargo}</span></div>}
              {item.telefono && <div><span className="item-detail-label">Telèfon: </span><span className="item-detail-value"><a href={`tel:${item.telefono}`} style={{color:'var(--accent)',textDecoration:'none'}}>{item.telefono}</a></span></div>}
              {item.email && <div><span className="item-detail-label">E-mail: </span><span className="item-detail-value"><a href={`mailto:${item.email}`} style={{color:'var(--accent)',textDecoration:'none'}}>{item.email}</a></span></div>}
            </div>
            {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notes}</p>}
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteContacto(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Contacte' : 'Nou Contacte'}>
        <div className="form-group"><label>Nom / Empresa / Port</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Pere (Mecànic Yanmar)" /></div>
        <div className="form-group"><label>Rol / Relació</label><input value={form.cargo||''} onChange={e => setForm({...form, cargo: e.target.value})} placeholder="Ex: Mecànic, Mariner, Amic de moll..." /></div>
        <div className="form-row">
          <div className="form-group"><label>Telèfon</label><input value={form.telefono||''} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="Ex: +34 600 123 456" /></div>
          <div className="form-group"><label>E-mail</label><input value={form.email||''} onChange={e => setForm({...form, email: e.target.value})} placeholder="Ex: pere@yanmarmarina.com" /></div>
        </div>
        <div className="form-group"><label>Observacions / Horaris / Adreça</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Ve molt ràpid si hi ha una urgència de motor." /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Contacte</button>
      </Modal>
    </>
  );
}
