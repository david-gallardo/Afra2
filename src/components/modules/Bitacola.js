'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate } from '@/components/UI';

export default function Bitacola() {
  const { loaded, bitacola, addBitacola, updateBitacola, deleteBitacola } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  const openNew = () => { setForm({ fecha: new Date().toISOString().split('T')[0], origen: '', destino: '', distancia: '', horasMotor: '', viento: '', mar: '', meteo: '', tripulacion: '', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.fecha) return; editItem ? updateBitacola(editItem.id, form) : addBitacola(form); setModal(false); };

  const totalnm = bitacola.reduce((s, b) => s + (parseFloat(b.distancia) || 0), 0);

  return (
    <>
      <div className="page-header">
        <h1>📖 Diari de Bitàcola</h1>
        <p>Diari de navegacions, rutes, meteorologia i milles acumulades</p>
      </div>
      <div className="summary-cards" style={{ marginBottom: 20 }}>
        <div className="summary-card">
          <div className="summary-card-label">Milles totals</div>
          <div className="summary-card-value accent">{totalnm.toFixed(1)} nm</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Sortides registrades</div>
          <div className="summary-card-value accent">{bitacola.length}</div>
        </div>
      </div>
      <div className="toolbar"><div /><button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nova sortida</button></div>
      {bitacola.length === 0 ? <EmptyState icon={Icons.book} message="Sense entrades al diari de bitàcola." /> : (
        <div className="item-list">{bitacola.map(item => (
          <AccordionItem key={item.id} title={`${item.origen || '?'} → ${item.destino || '?'}`} subtitle={formatDate(item.fecha)}>
            <div className="item-details">
              {item.distancia && <div><span className="item-detail-label">Distància: </span><span className="item-detail-value accent">{item.distancia} nm</span></div>}
              {item.horasMotor && <div><span className="item-detail-label">Hores motor: </span><span className="item-detail-value">{item.horasMotor} h</span></div>}
              {item.viento && <div><span className="item-detail-label">Vent: </span><span className="item-detail-value">{item.viento}</span></div>}
              {item.mar && <div><span className="item-detail-label">Estat de la mar: </span><span className="item-detail-value">{item.mar}</span></div>}
              {item.meteo && <div><span className="item-detail-label">Meteo: </span><span className="item-detail-value">{item.meteo}</span></div>}
              {item.tripulacion && <div><span className="item-detail-label">Tripulació: </span><span className="item-detail-value">{item.tripulacion}</span></div>}
            </div>
            {item.notes && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notes}</p>}
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteBitacola(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Sortida' : 'Nova Sortida de Bitàcola'}>
        <div className="form-group"><label>Data</label><input type="date" value={form.fecha||''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label>Origen</label><input value={form.origen||''} onChange={e => setForm({...form, origen: e.target.value})} placeholder="Ex: Port Ginesta" /></div>
          <div className="form-group"><label>Destí</label><input value={form.destino||''} onChange={e => setForm({...form, destino: e.target.value})} placeholder="Ex: Sitges" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Distància (nm)</label><input type="number" value={form.distancia||''} onChange={e => setForm({...form, distancia: e.target.value})} /></div>
          <div className="form-group"><label>Hores de motor fetes (h)</label><input type="number" step="0.1" value={form.horasMotor||''} onChange={e => setForm({...form, horasMotor: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Vent (Direcció/Força)</label><input value={form.viento||''} onChange={e => setForm({...form, viento: e.target.value})} placeholder="Ex: Garbí 12 kn" /></div>
          <div className="form-group"><label>Estat de la mar</label><input value={form.mar||''} onChange={e => setForm({...form, mar: e.target.value})} placeholder="Ex: Marejadilla" /></div>
        </div>
        <div className="form-group"><label>Meteo / Visibilitat</label><input value={form.meteo||''} onChange={e => setForm({...form, meteo: e.target.value})} placeholder="Ex: Assolellat, bona visibilitat" /></div>
        <div className="form-group"><label>Tripulació</label><input value={form.tripulacion||''} onChange={e => setForm({...form, tripulacion: e.target.value})} placeholder="Ex: Toni, Laura, David" /></div>
        <div className="form-group"><label>Comentaris / Incidències de la travessa</label><textarea value={form.notes||''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Ex: Navegació a vela fins a Sitges. Motor en l'entrada del port. Tot perfecte." /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Sortida</button>
      </Modal>
    </>
  );
}
