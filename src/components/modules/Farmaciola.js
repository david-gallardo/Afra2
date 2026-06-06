'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, getExpiryClass, getExpiryLabel } from '@/components/UI';

export default function Farmaciola() {
  const { loaded, farmaciola, addFarmaciola, addMultipleFarmaciola, updateFarmaciola, deleteFarmaciola, setAllFarmaciolaPending, eliminarDuplicatsFarmaciola } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  // El nou element s'afegeix com a 'Pendent' per defecte (l'usuari el marcarà 'A bord' en comprar-lo)
  const openNew = () => { setForm({ nombre: '', cantidad: '1', caducidad: '', tipo: 'Medicament', estado: 'Pendent', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ estado: 'Pendent', ...item }); setEditItem(item); setModal(true); };
  const save = () => { 
    if (!form.nombre) return; 
    const finalForm = { estado: 'Pendent', ...form };
    editItem ? updateFarmaciola(editItem.id, finalForm) : addFarmaciola(finalForm); 
    setModal(false); 
  };
  const tipos = ['Medicament', 'Vendatge', 'Antisèptic', 'Material Quirúrgic', 'Altres'];

  const prepolarFarmaciola = async () => {
    if (window.confirm("Vols afegir els 24 medicaments i materials de la farmaciola de seguretat estàndard (segons el llibre de manteniment del vaixell) en estat 'Pendent'?")) {
      const itemsEstandard = [
        { nombre: 'Topionic', tipo: 'Antisèptic', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Antisèptic general. Llibre de Manteniment.' },
        { nombre: 'Azol (gotes col·liri / sulfamida 0,25 mg/ml, 10 ml)', tipo: 'Antisèptic', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Sulfamida desinfectant ocular. Llibre de Manteniment.' },
        { nombre: 'Silvaderma (tub crema)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Crema per a cremades. Llibre de Manteniment.' },
        { nombre: 'Linitul (apòsits)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Apòsit impregnat per a cremades. Llibre de Manteniment.' },
        { nombre: 'Paracetamol', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Analgèsic general. Llibre de Manteniment.' },
        { nombre: 'Biodramina (20 comp.)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Antimareig. Llibre de Manteniment.' },
        { nombre: 'Fortasec (càpsules)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Antidiarreic. Llibre de Manteniment.' },
        { nombre: 'Epixtasol (ampolles)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Antihemorràgic. Llibre de Manteniment.' },
        { nombre: 'Optrex (col·liri)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Neteja ocular. Llibre de Manteniment.' },
        { nombre: 'Buscapina (12 comp. 50 mg)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Antiespasmòdic / dolor abdominal. Llibre de Manteniment.' },
        { nombre: 'AAS 500 (Aspirina)', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Antiinflamatori / analgèsic. Llibre de Manteniment.' },
        { nombre: 'Cafinitrina', tipo: 'Medicament', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Problemes cardíacs aguts. Llibre de Manteniment.' },
        { nombre: 'Fèrula de fixació', tipo: 'Material Quirúrgic', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Inmobilització de fractures. Llibre de Manteniment.' },
        { nombre: 'Vendes elàstiques adhesives (7,5 cm)', tipo: 'Vendatge', cantidad: '2', caducidad: '', estado: 'Pendent', notas: 'Llibre de Manteniment.' },
        { nombre: 'Compreses de gasa estèrils (20 x 20 cm, 40 unit.)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Llibre de Manteniment.' },
        { nombre: 'Cotó hidròfil (100 g)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Llibre de Manteniment.' },
        { nombre: 'Esparadrap hipoalergènic (5 cm x 10 m)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Llibre de Manteniment.' },
        { nombre: 'Guants de làtex (Talla 8-9)', tipo: 'Material Quirúrgic', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Protecció sanitària. Llibre de Manteniment.' },
        { nombre: 'Apòsits compressius estèrils', tipo: 'Vendatge', cantidad: '3', caducidad: '', estado: 'Pendent', notas: 'Aturar hemorràgies. Llibre de Manteniment.' },
        { nombre: 'Apòsits de calor', tipo: 'Altres', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Llibre de Manteniment.' },
        { nombre: 'Gases grasses (caixa 20 sobres, 7x9 cm)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Llibre de Manteniment.' },
        { nombre: 'Apòsits adhesius plàstics (rotllo 1 m x 6 cm)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Tirites. Llibre de Manteniment.' },
        { nombre: 'Sutures adhesives (paquet 6 x 100)', tipo: 'Vendatge', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Tancament de ferides petites. Llibre de Manteniment.' },
        { nombre: 'Goma Smarch / Torniquet', tipo: 'Material Quirúrgic', cantidad: '1', caducidad: '', estado: 'Pendent', notas: 'Torniquet per a grans hemorràgies. Llibre de Manteniment.' }
      ];

      // Filtrem per afegir només els que no existeixen ja
      const toAdd = itemsEstandard.filter(item => {
        return !farmaciola.some(f => f.nombre?.toLowerCase().trim() === item.nombre.toLowerCase().trim());
      });

      if (toAdd.length > 0) {
        await addMultipleFarmaciola(toAdd);
        alert(`S'han afegit ${toAdd.length} productes a la farmaciola en estat 'Pendent'!`);
      } else {
        alert("Tots els productes estàndard ja estan registrats a la farmaciola.");
      }
    }
  };

  const toggleEstado = (item) => {
    const nouEstado = item.estado === 'Pendent' ? 'A bord' : 'Pendent';
    updateFarmaciola(item.id, {
      ...item,
      estado: nouEstado,
      caducidad: nouEstado === 'Pendent' ? '' : (item.caducidad || '')
    });
  };

  const totalItems = farmaciola.length;
  const pendingItems = farmaciola.filter(i => i.estado === 'Pendent').length;
  const inStockItems = farmaciola.filter(i => !i.estado || i.estado === 'A bord').length;

  const téDuplicats = farmaciola.some((item, index) => {
    return farmaciola.findIndex(f => f.nombre?.toLowerCase().trim() === item.nombre?.toLowerCase().trim()) !== index;
  });

  return (
    <>
      <div className="page-header">
        <h1>💊 Farmaciola de Seguretat</h1>
        <p>Medicaments, material sanitari i dates de caducitat obligatòries</p>
      </div>

      {/* TARGETES DE RESUM */}
      <div className="summary-cards" style={{ marginBottom: 20 }}>
        <div className="summary-card">
          <div className="summary-card-label">A bord</div>
          <div className="summary-card-value accent">{inStockItems}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Pendents d'adquirir</div>
          <div className="summary-card-value warning">{pendingItems}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Total referències</div>
          <div className="summary-card-value">{totalItems}</div>
        </div>
      </div>

      <div className="toolbar" style={{ justifyContent: 'space-between', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={prepolarFarmaciola} style={{ border: '1px dashed var(--accent)', color: 'var(--accent)' }}>
            📦 Pre-popular Farmaciola Estàndard
          </button>
          {farmaciola.length > 0 && (
            <button 
              className="btn btn-ghost" 
              onClick={() => {
                if (window.confirm("Vols marcar ABSOLUTAMENT TOTS els productes de la farmaciola com a 'Pendents'?")) {
                  setAllFarmaciolaPending();
                }
              }} 
              style={{ border: '1px dashed var(--orange)', color: 'var(--orange)' }}
            >
              ⚠️ Tot Pendent
            </button>
          )}
          {téDuplicats && (
            <button 
              className="btn btn-ghost" 
              onClick={async () => {
                const count = await eliminarDuplicatsFarmaciola();
                if (count > 0) {
                  alert(`🔄 S'han eliminat ${count} productes duplicats correctament!`);
                }
              }} 
              style={{ border: '1px dashed var(--red)', color: 'var(--red)' }}
            >
              ✨ Netejar Duplicats
            </button>
          )}
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou element</button>
      </div>

      {farmaciola.length === 0 ? <EmptyState icon={Icons.heart} message="Farmaciola buida." /> : (
        <div className="item-list">{farmaciola.map(item => {
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
                <div><span className="item-detail-label">Quantitat: </span><span className="item-detail-value accent">{item.cantidad}</span></div>
                <div><span className="item-detail-label">Estat: </span><span className={`item-detail-value ${isPendent ? 'orange' : 'green'}`} style={{ fontWeight: 600 }}>{isPendent ? 'Pendent d\'adquirir' : 'A bord'}</span></div>
                {!isPendent && (
                  <div><span className="item-detail-label">Caducitat: </span><span className={`item-detail-value ${ec === 'expiry-expired' ? 'red' : ec === 'expiry-warning' ? 'orange' : 'green'}`}>{item.caducidad ? getExpiryLabel(item.caducidad) : '—'}</span></div>
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
                  <button className="btn btn-danger btn-sm" onClick={() => deleteFarmaciola(item.id)}>{Icons.trash} Esborrar</button>
                </div>
              </div>
            </AccordionItem>
          );
        })}</div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Farmaciola' : 'Afegir a Farmaciola'}>
        <div className="form-group"><label>Nom del medicament / material</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Ibuprofèn 600mg" /></div>
        <div className="form-row">
          <div className="form-group"><label>Quantitat</label><input type="number" value={form.cantidad||''} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
          <div className="form-group"><label>Estat</label>
            <select value={form.estado || 'Pendent'} onChange={e => setForm({...form, estado: e.target.value})}>
              <option value="A bord">A bord (Disponible)</option>
              <option value="Pendent">Pendent d'adquirir</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Tipus</label><select value={form.tipo||''} onChange={e => setForm({...form, tipo: e.target.value})}>{tipos.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Data de caducitat (si està a bord)</label><input type="date" disabled={form.estado === 'Pendent'} value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Observacions / Posologia a bord</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Per al mal de cap o febre" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar</button>
      </Modal>
    </>
  );
}
