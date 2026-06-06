'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate, formatCurrency } from '@/components/UI';

export default function Despeses() {
  const { loaded, despeses, addDespesa, updateDespesa, deleteDespesa, addManteniment } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { 
    setForm({ 
      concepto: '', 
      importe: '', 
      fecha: new Date().toISOString().split('T')[0], 
      categoria: 'Manteniment', 
      notes: '', 
      crearManteniment: false, 
      horasMotor: '', 
      tipoManteniment: 'General' 
    }); 
    setEditItem(null); 
    setModal(true); 
  };

  const openEdit = (item) => { 
    setForm({ ...item }); 
    setEditItem(item); 
    setModal(true); 
  };

  const save = async () => { 
    if (!form.concepto) return; 
    if (editItem) {
      updateDespesa(editItem.id, form); 
    } else {
      const newExp = await addDespesa(form);
      if (form.categoria === 'Manteniment' && form.crearManteniment) {
        await addManteniment({
          titulo: form.concepto,
          tipo: form.tipoManteniment || 'General',
          fecha: form.fecha,
          horasMotor: form.horasMotor || '',
          descripcion: `Manteniment registrat automàticament des de Finances.\nCost: ${form.importe} €.\nObservacions: ${form.notes || 'Cap'}`,
          proximaRevision: ''
        });
      }
    }
    setModal(false); 
  };

  const total = despeses.reduce((s, g) => s + (parseFloat(g.importe) || 0), 0);
  const uniqueYears = Array.from(new Set(despeses.map(d => d.fecha ? new Date(d.fecha).getFullYear() : null).filter(Boolean)));
  const numYears = uniqueYears.length || 1;
  const mitjanaPerAny = total / numYears;

  const categories = ['Manteniment', 'Combustible', 'Amarrador / Port', 'Assegurança', 'ITB / Impostos', 'Rebost / Celler', 'Electrònica', 'Veles i Axarcia', 'Material / Pintura', 'Altres'];
  const mantenimentCategories = ['General', 'Motor', 'Casc i Cua', 'Electricitat', 'Veles i Axarcia', 'Electrònica', 'Fondeig', 'Fontaneria', 'Altres'];
  
  const filtered = despeses.filter(g => g.concepto?.toLowerCase().includes(search.toLowerCase()));

  const CATEGORY_COLORS = {
    'Manteniment': '#38BDF8',
    'Combustible': '#FBBF24',
    'Amarrador / Port': '#34D399',
    'Assegurança': '#A78BFA',
    'ITB / Impostos': '#F87171',
    'Rebost / Celler': '#F472B6',
    'Electrònica': '#2DD4BF',
    'Veles i Axarcia': '#818CF8',
    'Material / Pintura': '#FB923C',
    'Altres': '#9CA3AF',
  };

  const totalsByCategory = despeses.reduce((acc, d) => {
    let cat = d.categoria || 'Altres';
    if (cat === 'Celler / Provisions') cat = 'Rebost / Celler';
    const imp = parseFloat(d.importe) || 0;
    acc[cat] = (acc[cat] || 0) + imp;
    return acc;
  }, {});

  const sortedCategories = Object.entries(totalsByCategory)
    .map(([category, amount]) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  let accumulatedPercentage = 0;
  const segments = sortedCategories.map(cat => {
    const percentage = cat.percentage;
    const strokeLength = (percentage / 100) * 251.327;
    const strokeOffset = 251.327 - (accumulatedPercentage / 100) * 251.327;
    accumulatedPercentage += percentage;
    const color = CATEGORY_COLORS[cat.category] || '#9CA3AF';
    return {
      ...cat,
      strokeLength,
      strokeOffset,
      color
    };
  });

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
          <div className="summary-card-label">Mitjana Anual</div>
          <div className="summary-card-value negative">{formatCurrency(mitjanaPerAny)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Nº de pagaments</div>
          <div className="summary-card-value accent">{despeses.length}</div>
        </div>
      </div>

      {despeses.length > 0 && (
        <div className="dashboard-card" style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '25px', padding: '24px' }}>
          <div style={{ flex: '1 1 250px' }}>
            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Distribució de Despeses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedCategories.slice(0, 6).map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CATEGORY_COLORS[cat.category] || '#9CA3AF', display: 'inline-block' }}></span>
                    <span style={{ color: 'var(--text-main)' }}>{cat.category}</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {formatCurrency(cat.amount)} <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '6px' }}>({cat.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
              {sortedCategories.length > 6 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
                  i {sortedCategories.length - 6} categories més...
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '0 0 200px', margin: 'auto' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                {segments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${seg.strokeLength} 251.327`}
                    strokeDashoffset={seg.strokeOffset}
                    style={{ transition: 'all 0.3s' }}
                  />
                ))}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar despesa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nova despesa</button>
      </div>
      
      {filtered.length === 0 ? <EmptyState icon={Icons.dollar} message="Sense despeses registrades." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.concepto} subtitle={`${formatDate(item.fecha)} · ${item.categoria === 'Celler / Provisions' ? 'Rebost / Celler' : item.categoria}`} badge={formatCurrency(parseFloat(item.importe)||0)} badgeClass="expired">
            <div className="item-details">
              <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.categoria === 'Celler / Provisions' ? 'Rebost / Celler' : item.categoria}</span></div>
              <div><span className="item-detail-label">Import: </span><span className="item-detail-value red">{formatCurrency(parseFloat(item.importe)||0)}</span></div>
            </div>
            {item.notes && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notes}</p>}
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

        {form.categoria === 'Manteniment' && !editItem && (
          <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px dashed rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={form.crearManteniment || false} 
                onChange={e => setForm({ ...form, crearManteniment: e.target.checked })} 
              />
              Registrar també com a feina de manteniment
            </label>
            {form.crearManteniment && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Categoria de manteniment</label>
                  <select 
                    value={form.tipoManteniment || 'General'} 
                    onChange={e => setForm({ ...form, tipoManteniment: e.target.value })}
                  >
                    {mantenimentCategories.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Hores de motor actuals (opcional)</label>
                  <input 
                    type="number" 
                    value={form.horasMotor || ''} 
                    onChange={e => setForm({ ...form, horasMotor: e.target.value })} 
                    placeholder="Ex: 1245" 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-group"><label>Observacions / Proveïdor / Garantia</label><textarea value={form.notes||''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Ex: Pintures Marina S.L. 2 anys de garantia" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Despesa</button>
      </Modal>
    </>
  );
}
