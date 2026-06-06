'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, getExpiryClass, getExpiryLabel } from '@/components/UI';

export default function Seguretat() {
  const { loaded, seguretat, addSeguretat, addMultipleSeguretat, updateSeguretat, deleteSeguretat } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', cantidad: '1', caducidad: '', tipo: 'Armilla Salvavides', ubicacion: '', estado: 'A bord', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ estado: 'A bord', ...item }); setEditItem(item); setModal(true); };
  const save = () => { 
    if (!form.nombre) return; 
    const finalForm = { estado: 'A bord', ...form };
    editItem ? updateSeguretat(editItem.id, finalForm) : addSeguretat(finalForm); 
    setModal(false); 
  };
  const tipos = ['Armilla Salvavides', 'Bengales / Senyals', 'Extintor', 'Balsa Salvavides', 'Aro salvavides', 'Ràdiobalisa', 'Bocina de boira', 'Llanterna de senyals', 'Altres'];

  const prepolarZona4 = async () => {
    if (window.confirm("Vols pre-popular el material de seguretat obligatori per a la Zona 4 (fins a 12 milles, apte per a PER) en estat 'Pendent'?")) {
      const itemsZona4 = [
        { nombre: "Armilles Salvavides 150N (Adult)", tipo: "Armilla Salvavides", cantidad: "4", caducidad: "", ubicacion: "Cabina", estado: "Pendent", notas: "Mínim 150N. Una per tripulant màxim legal de la targeta polonesa." },
        { nombre: "Aro Salvavides homologat SOLAS", tipo: "Aro salvavides", cantidad: "1", caducidad: "", ubicacion: "Balconada popa", estado: "Pendent", notas: "Amb rabiza flotant i llum automàtica." },
        { nombre: "Bengales de mà vermelles (Kit 12M)", tipo: "Bengales / Senyals", cantidad: "3", caducidad: "", ubicacion: "Cofre taula cartes", estado: "Pendent", notas: "Homologades Zona 4. Caducitat 4 anys." },
        { nombre: "Coets roigs amb paracaigudes (Kit 12M)", tipo: "Bengales / Senyals", cantidad: "3", caducidad: "", ubicacion: "Cofre taula cartes", estado: "Pendent", notas: "Homologades Zona 4. Caducitat 4 anys." },
        { nombre: "Extintor de pols seca 21B (2kg)", tipo: "Extintor", cantidad: "1", caducidad: "", ubicacion: "Entrada cabina", estado: "Pendent", notas: "Mínim 21B per a eslora <10m i motor interior. Revisió anual." },
        { nombre: "Bocina de boira portàtil", tipo: "Bocina de boira", cantidad: "1", caducidad: "", ubicacion: "Taula de cartes", estado: "Pendent", notas: "Manual o gas (amb recanvi)." },
        { nombre: "Llanterna estanca (amb piles de respecte)", tipo: "Llanterna de senyals", cantidad: "1", caducidad: "", ubicacion: "Taula de cartes", estado: "Pendent", notas: "Llum de respecte." },
        { nombre: "Espill de senyals (heliògraf)", tipo: "Bengales / Senyals", cantidad: "1", caducidad: "", ubicacion: "Taula de cartes", estado: "Pendent", notas: "Senyalització diürna." },
        { nombre: "Reflector de radar", tipo: "Altres", cantidad: "1", caducidad: "", ubicacion: "Estai de popa", estado: "Pendent", notas: "Obligatori per a vaixell de fibra." },
        { nombre: "Compàs magnètic de govern", tipo: "Altres", cantidad: "1", caducidad: "", ubicacion: "Bitàcola", notas: "Navegació Zona 4." },
        { nombre: "Prismàtics marins", tipo: "Altres", cantidad: "1", caducidad: "", ubicacion: "Taula de cartes", estado: "Pendent", notas: "Recomanat Zona 4." },
        { nombre: "Galleda d'achique de 5 L (amb rabiza)", tipo: "Altres", cantidad: "1", caducidad: "", ubicacion: "Banyera", estado: "Pendent", notas: "Material d'achique manual." },
        { nombre: "Bichero (Gaf)", tipo: "Altres", cantidad: "1", caducidad: "", ubicacion: "Coberta", estado: "Pendent", notas: "Ajudes a la maniobra." },
        { nombre: "Estaches d'amarre de respecte", tipo: "Altres", cantidad: "2", caducidad: "", ubicacion: "Cofre banyera", estado: "Pendent", notas: "Cables d'amarre auxiliars." }
      ];

      const toAdd = itemsZona4.filter(item => {
        return !seguretat.some(s => s.nombre?.toLowerCase().trim() === item.nombre.toLowerCase().trim());
      });

      if (toAdd.length > 0) {
        await addMultipleSeguretat(toAdd);
        alert(`S'han afegit ${toAdd.length} equips de seguretat Zona 4 com a 'Pendents'!`);
      } else {
        alert("Tots els equips estàndard de la Zona 4 ja estan registrats.");
      }
    }
  };

  const toggleEstado = (item) => {
    const nouEstado = item.estado === 'Pendent' ? 'A bord' : 'Pendent';
    updateSeguretat(item.id, {
      ...item,
      estado: nouEstado,
      caducidad: nouEstado === 'Pendent' ? '' : (item.caducidad || '')
    });
  };

  const totalItems = seguretat.length;
  const pendingItems = seguretat.filter(i => i.estado === 'Pendent').length;
  const inStockItems = seguretat.filter(i => !i.estado || i.estado === 'A bord').length;

  return (
    <>
      <div className="page-header">
        <h1>🛡️ Seguretat i Emergències</h1>
        <p>Elements de seguretat, equips de supervivència i control d'inspeccions de l'embarcació</p>
      </div>

      {/* TARGETES DE RESUM */}
      <div className="summary-cards" style={{ marginBottom: 20 }}>
        <div className="summary-card">
          <div className="summary-card-label">A bord</div>
          <div className="summary-card-value accent">{inStockItems}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Pendents de comprar</div>
          <div className="summary-card-value warning">{pendingItems}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Total referències</div>
          <div className="summary-card-value">{totalItems}</div>
        </div>
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

        {pendingItems > 0 && (
          <div className="dashboard-card" style={{ padding: 14, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--orange)' }}>
            <h4 style={{ color: 'var(--orange)', margin: '0 0 8px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>⚠️ MATERIAL DE SEGURETAT ZONA 4 PENDENT</h4>
            <p style={{ fontSize: '0.8rem', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
              Tens <strong>{pendingItems}</strong> elements pendents de comprar per navegar legalment fins a 12 milles (Kit Zona 4).
            </p>
          </div>
        )}
      </div>

      <div className="toolbar" style={{ justifyContent: 'space-between', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={prepolarZona4} style={{ border: '1px dashed var(--accent)', color: 'var(--accent)' }}>
          📦 Pre-popular Equips Zona 4 (12M)
        </button>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou element</button>
      </div>

      {seguretat.length === 0 ? <EmptyState icon={Icons.shield} message="Sense elements de seguretat registrats." /> : (
        <div className="item-list">{seguretat.map(item => {
          const isPendent = item.estado === 'Pendent';
          const ec = isPendent ? 'expiry-warning' : getExpiryClass(item.caducidad);
          const badgeText = isPendent ? 'Pendent' : (item.caducidad ? getExpiryLabel(item.caducidad) : 'A bord');
          const badgeClass = isPendent ? 'low' : (ec === 'expiry-expired' ? 'expired' : ec === 'expiry-warning' ? 'low' : 'ok');

          return (
            <AccordionItem 
              key={item.id} 
              title={item.nombre} 
              subtitle={`${item.tipo} • ${isPendent ? 'Pendent' : 'A bord'}`} 
              badge={badgeText} 
              badgeClass={badgeClass}
            >
              <div className="item-details">
                <div><span className="item-detail-label">Tipus: </span><span className="item-detail-value accent">{item.tipo}</span></div>
                <div><span className="item-detail-label">Quantitat: </span><span className="item-detail-value">{item.cantidad}</span></div>
                <div><span className="item-detail-label">Estat: </span><span className={`item-detail-value ${isPendent ? 'orange' : 'green'}`} style={{ fontWeight: 600 }}>{isPendent ? 'Pendent d\'adquirir' : 'A bord'}</span></div>
                {item.ubicacion && <div><span className="item-detail-label">Ubicació: </span><span className="item-detail-value">{item.ubicacion}</span></div>}
                {!isPendent && item.caducidad && (
                  <div><span className="item-detail-label">Caducitat / Control: </span><span className={`item-detail-value ${ec === 'expiry-expired' ? 'red' : ec === 'expiry-warning' ? 'orange' : 'green'}`}>{getExpiryLabel(item.caducidad)}</span></div>
                )}
              </div>
              {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notas}</p>}
              <div className="item-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 12 }}>
                <button 
                  className={`btn btn-sm ${isPendent ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={() => toggleEstado(item)}
                  style={{ border: isPendent ? 'none' : '1px solid var(--border-color)' }}
                >
                  {isPendent ? '📥 Canviar a: A bord' : '⚠️ Canviar a: Pendent'}
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteSeguretat(item.id)}>{Icons.trash} Esborrar</button>
                </div>
              </div>
            </AccordionItem>
          );
        })}</div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Element' : 'Nou Element de Seguretat'}>
        <div className="form-group"><label>Nom de l'element</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Armilla autohinchable 150N" /></div>
        <div className="form-row">
          <div className="form-group"><label>Tipus</label><select value={form.tipo||''} onChange={e => setForm({...form, tipo: e.target.value})}>{tipos.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Quantitat</label><input type="number" value={form.cantidad||''} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Estat</label>
            <select value={form.estado || 'A bord'} onChange={e => setForm({...form, estado: e.target.value})}>
              <option value="A bord">A bord (Disponible)</option>
              <option value="Pendent">Pendent d'adquirir</option>
            </select>
          </div>
          <div className="form-group"><label>Ubicació al vaixell</label><input value={form.ubicacion||''} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Ex: Cofre banyera babor" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Caducitat / Inspecció (si està a bord)</label><input type="date" disabled={form.estado === 'Pendent'} value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Notes / Manteniment realitzat</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Canvi de pastilla de sal i ampolla de CO2 realitzada el 2025" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar</button>
      </Modal>
    </>
  );
}
