'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, getExpiryClass, getExpiryLabel } from '@/components/UI';

export default function Seguretat() {
  const { loaded, seguretat, addSeguretat, updateSeguretat, deleteSeguretat } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', cantidad: '1', caducidad: '', tipo: 'Armilla', ubicacion: '', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateSeguretat(editItem.id, form) : addSeguretat(form); setModal(false); };
  const tipos = ['Armilla Salvavides', 'Bengales / Senyals', 'Extintor', 'Balsa Salvavides', 'Aro salvavides', 'Ràdiobalisa', 'Bocina de boira', 'Llanterna de senyals', 'Altres'];

  return (
    <>
      <div className="page-header">
        <h1>🛡️ Seguretat i Emergències</h1>
        <p>Elements de seguretat, equips de supervivència i control d'inspeccions de l'embarcació</p>
      </div>

      {/* Ràpid / Cheatsheet de Canals VHF d'Emergència & Equips Pendents */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="dashboard-card" style={{ padding: 14, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--red)' }}>
          <h4 style={{ color: 'var(--red)', margin: '0 0 8px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>🚨 CANALS VHF D'EMERGÈNCIA</h4>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div><strong style={{color:'var(--red)'}}>Canal 16 (156.8 MHz):</strong> Socors i Seguretat</div>
            <div><strong>Canal 09:</strong> Serveis portuaris / Club Nàutic</div>
            <div><strong>Canal 70:</strong> DSC (Crida Selectiva)</div>
            <div><strong>Salvament Marítim:</strong> 900 202 202 / VHF 16</div>
          </div>
        </div>

        {(!seguretat.some(i => i.tipo === 'Balsa Salvavides' || i.nombre?.toLowerCase().includes('balsa')) ||
          !seguretat.some(i => i.tipo === 'Ràdiobalisa' || i.nombre?.toLowerCase().includes('radiobalisa') || i.nombre?.toLowerCase().includes('epirb'))) && (
          <div className="dashboard-card" style={{ padding: 14, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--orange)' }}>
            <h4 style={{ color: 'var(--orange)', margin: '0 0 8px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>⚠️ EQUIPS DE SEGURETAT DE TEMPORADA PENDENTS</h4>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {!seguretat.some(i => i.tipo === 'Balsa Salvavides' || i.nombre?.toLowerCase().includes('balsa')) && (
                <div style={{ color: 'var(--orange)' }}>• <strong>Balsa Salvavides (ISO/9650):</strong> Recomanada Duarry. Pendent d'adquirir.</div>
              )}
              {!seguretat.some(i => i.tipo === 'Ràdiobalisa' || i.nombre?.toLowerCase().includes('radiobalisa') || i.nombre?.toLowerCase().includes('epirb')) && (
                <div style={{ color: 'var(--orange)' }}>• <strong>Ràdiobalisa (EPIRB):</strong> Recomanada ACR GlobalFix. Pendent d'adquirir.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="toolbar"><div /><button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou element</button></div>
      {seguretat.length === 0 ? <EmptyState icon={Icons.shield} message="Sense elements de seguretat registrats." /> : (
        <div className="item-list">{seguretat.map(item => {
          const ec = getExpiryClass(item.caducidad);
          return (
            <AccordionItem key={item.id} title={item.nombre} subtitle={item.tipo} badge={item.caducidad ? getExpiryLabel(item.caducidad) : ''} badgeClass={ec === 'expiry-expired' ? 'expired' : ec === 'expiry-warning' ? 'low' : 'ok'}>
              <div className="item-details">
                <div><span className="item-detail-label">Tipus: </span><span className="item-detail-value accent">{item.tipo}</span></div>
                <div><span className="item-detail-label">Quantitat: </span><span className="item-detail-value">{item.cantidad}</span></div>
                {item.ubicacion && <div><span className="item-detail-label">Ubicació: </span><span className="item-detail-value">{item.ubicacion}</span></div>}
              </div>
              {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notes}</p>}
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteSeguretat(item.id)}>{Icons.trash} Esborrar</button>
              </div>
            </AccordionItem>
          );
        })}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Element' : 'Nou Element de Seguretat'}>
        <div className="form-group"><label>Nom de l'element</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Armilla autohinchable 150N" /></div>
        <div className="form-row">
          <div className="form-group"><label>Tipus</label><select value={form.tipo||''} onChange={e => setForm({...form, tipo: e.target.value})}>{tipos.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Quantitat</label><input type="number" value={form.cantidad||''} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Caducitat / Inspecció</label><input type="date" value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
          <div className="form-group"><label>Ubicació al vaixell</label><input value={form.ubicacion||''} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Ex: Cofre banyera babor" /></div>
        </div>
        <div className="form-group"><label>Notes / Manteniment realitzat</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Canvi de pastilla de sal i ampolla de CO2 realitzada el 2025" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar</button>
      </Modal>
    </>
  );
}
