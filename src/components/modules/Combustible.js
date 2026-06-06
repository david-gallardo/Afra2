'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate, formatCurrency } from '@/components/UI';

export default function Combustible() {
  const { loaded, combustible, addCombustible, updateCombustible, deleteCombustible } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  const openNew = () => { setForm({ fecha: new Date().toISOString().split('T')[0], litros: '', coste: '', horasMotor: '', lugar: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.litros) return; editItem ? updateCombustible(editItem.id, form) : addCombustible(form); setModal(false); };

  const totalLitros = combustible.reduce((s, c) => s + (parseFloat(c.litros) || 0), 0);
  const totalCoste = combustible.reduce((s, c) => s + (parseFloat(c.coste) || 0), 0);

  return (
    <>
      <div className="page-header">
        <h1>⛽ Combustible</h1>
        <p>Historial de repostatges i càlcul de consums de gasoil</p>
      </div>
      <div className="summary-cards">
        <div className="summary-card"><div className="summary-card-label">Total litres</div><div className="summary-card-value accent">{totalLitros.toFixed(1)} L</div></div>
        <div className="summary-card"><div className="summary-card-label">Cost total</div><div className="summary-card-value negative">{formatCurrency(totalCoste)}</div></div>
        <div className="summary-card"><div className="summary-card-label">Preu mitjà per L</div><div className="summary-card-value accent">{totalLitros > 0 ? (totalCoste / totalLitros).toFixed(2) : '0.00'} €</div></div>
      </div>
      <div className="toolbar"><div /><button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou repostatge</button></div>
      {combustible.length === 0 ? <EmptyState icon={Icons.fuel} message="Sense registres de combustible." /> : (
        <div className="item-list">{combustible.map(item => (
          <AccordionItem key={item.id} title={`${item.litros} L — ${formatCurrency(parseFloat(item.coste)||0)}`} subtitle={`${formatDate(item.fecha)} · ${item.lugar || ''}`}>
            <div className="item-details">
              <div><span className="item-detail-label">Litres: </span><span className="item-detail-value accent">{item.litros} L</span></div>
              <div><span className="item-detail-label">Cost total: </span><span className="item-detail-value red">{formatCurrency(parseFloat(item.coste)||0)}</span></div>
              {item.horasMotor && <div><span className="item-detail-label">Holes de motor: </span><span className="item-detail-value">{item.horasMotor} h</span></div>}
              {item.lugar && <div><span className="item-detail-label">Lloc / Notes: </span><span className="item-detail-value">{item.lugar}</span></div>}
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteCombustible(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Repostatge' : 'Registrar Repostatge'}>
        <div className="form-group"><label>Data</label><input type="date" value={form.fecha||''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label>Litres repostatges</label><input type="number" step="0.1" value={form.litros||''} onChange={e => setForm({...form, litros: e.target.value})} /></div>
          <div className="form-group"><label>Cost Total (€)</label><input type="number" step="0.01" value={form.coste||''} onChange={e => setForm({...form, coste: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Hores de Motor (Opcional)</label><input type="number" step="0.1" value={form.horasMotor||''} onChange={e => setForm({...form, horasMotor: e.target.value})} /></div>
        <div className="form-group"><label>Gasolinera / Port / Comentaris</label><input value={form.lugar||''} onChange={e => setForm({...form, lugar: e.target.value})} placeholder="Ex: Port Ginesta" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Repostatge</button>
      </Modal>
    </>
  );
}
