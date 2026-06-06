'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, getExpiryClass, getExpiryLabel } from '@/components/UI';

export default function Farmaciola() {
  const { loaded, farmaciola, addFarmaciola, updateFarmaciola, deleteFarmaciola } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', cantidad: '1', caducidad: '', tipo: 'Medicament', notas: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateFarmaciola(editItem.id, form) : addFarmaciola(form); setModal(false); };
  const tipos = ['Medicament', 'Vendatge', 'Antisèptic', 'Material Quirúrgic', 'Altres'];

  const prepolarFarmaciola = () => {
    if (window.confirm("Vols afegir els 24 medicaments i materials de la farmaciola de seguretat estàndard (segons el llibre de manteniment del vaixell)?")) {
      const itemsEstandard = [
        { nombre: 'Topionic', tipo: 'Antisèptic', cantidad: '1', caducidad: '', notas: 'Antisèptic general. Llibre de Manteniment.' },
        { nombre: 'Azol (gotes col·liri / sulfamida 0,25 mg/ml, 10 ml)', tipo: 'Antisèptic', cantidad: '1', caducidad: '', notas: 'Sulfamida desinfectant ocular. Llibre de Manteniment.' },
        { nombre: 'Silvaderma (tub crema)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Crema per a cremades. Llibre de Manteniment.' },
        { nombre: 'Linitul (apòsits)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Apòsit impregnat per a cremades. Llibre de Manteniment.' },
        { nombre: 'Paracetamol', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Analgèsic general. Llibre de Manteniment.' },
        { nombre: 'Biodramina (20 comp.)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Antimareig. Llibre de Manteniment.' },
        { nombre: 'Fortasec (càpsules)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Antidiarreic. Llibre de Manteniment.' },
        { nombre: 'Epixtasol (ampolles)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Antihemorràgic. Llibre de Manteniment.' },
        { nombre: 'Optrex (col·liri)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Neteja ocular. Llibre de Manteniment.' },
        { nombre: 'Buscapina (12 comp. 50 mg)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Antiespasmòdic / dolor abdominal. Llibre de Manteniment.' },
        { nombre: 'AAS 500 (Aspirina)', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Antiinflamatori / analgèsic. Llibre de Manteniment.' },
        { nombre: 'Cafinitrina', tipo: 'Medicament', cantidad: '1', caducidad: '', notas: 'Problemes cardíacs aguts. Llibre de Manteniment.' },
        { nombre: 'Fèrula de fixació', tipo: 'Material Quirúrgic', cantidad: '1', caducidad: '', notas: 'Inmobilització de fractures. Llibre de Manteniment.' },
        { nombre: 'Vendes elàstiques adhesives (7,5 cm)', tipo: 'Vendatge', cantidad: '2', caducidad: '', notas: 'Llibre de Manteniment.' },
        { nombre: 'Compreses de gasa estèrils (20 x 20 cm, 40 unit.)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Llibre de Manteniment.' },
        { nombre: 'Cotó hidròfil (100 g)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Llibre de Manteniment.' },
        { nombre: 'Esparadrap hipoalergènic (5 cm x 10 m)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Llibre de Manteniment.' },
        { nombre: 'Guants de làtex (Talla 8-9)', tipo: 'Material Quirúrgic', cantidad: '1', caducidad: '', notas: 'Protecció sanitària. Llibre de Manteniment.' },
        { nombre: 'Apòsits compressius estèrils', tipo: 'Vendatge', cantidad: '3', caducidad: '', notas: 'Aturar hemorràgies. Llibre de Manteniment.' },
        { nombre: 'Apòsits de calor', tipo: 'Altres', cantidad: '1', caducidad: '', notas: 'Llibre de Manteniment.' },
        { nombre: 'Gases grasses (caixa 20 sobres, 7x9 cm)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Llibre de Manteniment.' },
        { nombre: 'Apòsits adhesius plàstics (rotllo 1 m x 6 cm)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Tirites. Llibre de Manteniment.' },
        { nombre: 'Sutures adhesives (paquet 6 x 100)', tipo: 'Vendatge', cantidad: '1', caducidad: '', notas: 'Tancament de ferides petites. Llibre de Manteniment.' },
        { nombre: 'Goma Smarch / Torniquet', tipo: 'Material Quirúrgic', cantidad: '1', caducidad: '', notas: 'Torniquet per a grans hemorràgies. Llibre de Manteniment.' }
      ];

      let afegits = 0;
      itemsEstandard.forEach(item => {
        const existeix = farmaciola.some(f => f.nombre?.toLowerCase().trim() === item.nombre.toLowerCase().trim());
        if (!existeix) {
          addFarmaciola(item);
          afegits++;
        }
      });
      alert(`S'han afegit ${afegits} productes a la farmaciola! Recorda revisar i introduir les dates de caducitat reals.`);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>💊 Farmaciola de Seguretat</h1>
        <p>Medicaments, material sanitari i dates de caducitat obligatòries</p>
      </div>
      <div className="toolbar" style={{ justifyContent: 'space-between', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={prepolarFarmaciola} style={{ border: '1px dashed var(--accent)', color: 'var(--accent)' }}>
          📦 Pre-popular Farmaciola Estàndard
        </button>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou element</button>
      </div>
      {farmaciola.length === 0 ? <EmptyState icon={Icons.heart} message="Farmaciola buida." /> : (
        <div className="item-list">{farmaciola.map(item => {
          const ec = getExpiryClass(item.caducidad);
          return (
            <AccordionItem key={item.id} title={item.nombre} subtitle={item.tipo} badge={item.caducidad ? getExpiryLabel(item.caducidad) : ''} badgeClass={ec === 'expiry-expired' ? 'expired' : ec === 'expiry-warning' ? 'low' : 'ok'}>
              <div className="item-details">
                <div><span className="item-detail-label">Quantitat: </span><span className="item-detail-value accent">{item.cantidad}</span></div>
                <div><span className="item-detail-label">Caducitat: </span><span className={`item-detail-value ${ec === 'expiry-expired' ? 'red' : ec === 'expiry-warning' ? 'orange' : 'green'}`}>{item.caducidad ? getExpiryLabel(item.caducidad) : '—'}</span></div>
              </div>
              {item.notas && <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--text-secondary)'}}>{item.notas}</p>}
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteFarmaciola(item.id)}>{Icons.trash} Esborrar</button>
              </div>
            </AccordionItem>
          );
        })}</div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Farmaciola' : 'Afegir a Farmaciola'}>
        <div className="form-group"><label>Nom del medicament / material</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Ibuprofèn 600mg" /></div>
        <div className="form-row">
          <div className="form-group"><label>Quantitat</label><input type="number" value={form.cantidad||''} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
          <div className="form-group"><label>Data de caducitat</label><input type="date" value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Tipus</label><select value={form.tipo||''} onChange={e => setForm({...form, tipo: e.target.value})}>{tipos.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label>Observacions / Posologia a bord</label><textarea value={form.notas||''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Ex: Per al mal de cap o febre" /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar</button>
      </Modal>
    </>
  );
}
