'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate, formatCurrency } from '@/components/UI';

export default function Despeses() {
  const { loaded, despeses, addDespesa, updateDespesa, deleteDespesa } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ concepto: '', importe: '', fecha: new Date().toISOString().split('T')[0], categoria: 'Manteniment', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.concepto) return; editItem ? updateDespesa(editItem.id, form) : addDespesa(form); setModal(false); };

  const total = despeses.reduce((s, g) => s + (parseFloat(g.importe) || 0), 0);
  const categories = ['Manteniment', 'Combustible', 'Amarrador / Port', 'Assegurança', 'ITB / Impostos', 'Celler / Provisions', 'Electrònica', 'Veles i Axarcia', 'Material / Pintura', 'Altres'];
  const filtered = despeses.filter(g => g.concepto?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-header">
        <h1>💰 Finances i Despeses</h1>
        <p>Control de despeses de l'embarcació</p>
      </div>
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-label">Total Invertit</div>
          <div className="summary-card-value negative">{formatCurrency(total)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Nº de pagaments</div>
          <div className="summary-card-value accent">{despeses.length}</div>
        </div>
      </div>
      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar despesa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nova despesa</button>
      </div>
      {filtered.length === 0 ? <EmptyState icon={Icons.dollar} message="Sense despeses registrades." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.concepto} subtitle={`${formatDate(item.fecha)} · ${item.categoria}`} badge={formatCurrency(parseFloat(item.importe)||0)} badgeClass="expired">
            <div className="item-details">
              <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.categoria}</span></div>
              <div><span className="item-detail-label">Import: </span><span className="item-detail-value red">{formatCurrency(parseFloat(item.importe)||0)}</span></div>
            </div>
            {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notas}</p>}
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteDespesa(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Despesa' : 'Registrar Nova Despesa'}>
        <div className="form-group"><label>Concepte / Factura</label><input value={form.concepto||''} onChange={e => setForm({...form, concepto: e.target.value})} placeholder="Ex: Antifouling i ànodes Hempel" /></div>
        <div className="form-row">
          <div className="form-group"><label>Import (€)</label><input type="number" step="0.01" value={form.importe||''} onChange={e => setForm({...form, importe: e.target.value})} /></div>
          <div className="form-group"><label>Data de pagament</label><input type="date" value={form.fecha||''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Categoria</label><select value={form.categoria||''} onChange={e => setForm({...form, categoria: e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label>Observacions / Proveïdor / Garantia</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Pintures Marina S.L. 2 anys de garantia" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Despesa</button>
      </Modal>
    </>
  );
}
