'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate } from '@/components/UI';

export default function Documents() {
  const { loaded, documents, addDocumento, updateDocumento, deleteDocumento } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ nombre: '', descripcion: '', categoria: 'Documentació Barco', fecha: '', caducidad: '', fileData: '', fileName: '', fileType: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.nombre) return; editItem ? updateDocumento(editItem.id, form) : addDocumento(form); setModal(false); };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Alerta si és massa gran (més d'1.5MB de base64 pot alentir localstorage)
    if (file.size > 1.5 * 1024 * 1024) {
      alert("⚠️ Aquest fitxer és massa gran (més d'1.5 MB). Per favor, tria una imatge o PDF més comprimit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm({
        ...form,
        fileData: event.target.result,
        fileName: file.name,
        fileType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const categorias = ['Documentació Barco', 'Assegurança', 'Certificats de Navegabilitat', 'Manuals d\'Equips', 'Títols de Patró', 'Factures / Rebuts', 'Altres'];
  
  const staticDocs = [
    { name: 'Plànols i Dimensions (Dibuixos)', path: '/docs/PUMA32-1.pdf', type: 'PDF' },
    { name: 'Fullet i Característiques Originals', path: '/docs/p32-1.pdf', type: 'PDF' },
    { name: 'Llibre Manteniment SOSUA (Furia)', path: '/docs/Llibre Manteniment Afra II.pdf', type: 'PDF' },
    { name: 'Certificat de Registre Polonès (Anvers)', path: '/docs/Documentació_Afra_II_Anvers(1).jpeg', type: 'Imatge' },
    { name: 'Certificat de Registre Polonès (Revers)', path: '/docs/Documentació_Afra_II_Revers(1).jpeg', type: 'Imatge' },
  ];

  const filtered = documents.filter(d => d.nombre?.toLowerCase().includes(search.toLowerCase()));

  const openBase64File = (item) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${item.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>📄 Documents i Manuals</h1>
        <p>Documentació oficial, manuals dels equips, certificats i assegurances del vaixell</p>
      </div>

      {/* SECCIÓ DE FITXERS DE BORD ORIGINALS */}
      <div className="dashboard-card" style={{ marginBottom: 25 }}>
        <h3>📁 Documents del Vaixell (docs/ de bord)</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Fitxers pre-carregats de la documentació tècnica i registre oficial:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {staticDocs.map((doc, idx) => (
            <a 
              key={idx} 
              href={doc.path} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-ghost" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px 16px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.90rem',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.01)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {doc.type === 'PDF' ? '📕' : '🖼️'} {doc.name}
              </span>
              <span className="badge badge-sm" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--accent)', border: '1px solid var(--border-color)' }}>
                {doc.type}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar document..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou document</button>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Icons.file} message="Sense documents personalitzats registrats." /> : (
        <div className="item-list">{filtered.map(item => (
          <AccordionItem key={item.id} title={item.nombre} subtitle={item.descripcion || 'Sense descripció'} badge={item.categoria} badgeClass="ok">
            <div className="item-details">
              <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.categoria}</span></div>
              {item.fecha && <div><span className="item-detail-label">Data: </span><span className="item-detail-value">{formatDate(item.fecha)}</span></div>}
              {item.caducidad && <div><span className="item-detail-label">Caducitat: </span><span className="item-detail-value orange">{formatDate(item.caducidad)}</span></div>}
              {item.fileName && <div><span className="item-detail-label">Fitxer adjunt: </span><span className="item-detail-value green">📎 {item.fileName}</span></div>}
            </div>
            <div className="item-actions" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {item.fileData && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => openBase64File(item)}>
                    👁️ Visualitzar
                  </button>
                  <a href={item.fileData} download={item.fileName || 'document'} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border-color)' }}>
                    📥 Descarregar
                  </a>
                </>
              )}
              {item.fileUrl && (
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  👁️ Obrir fitxer gran
                </a>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteDocumento(item.id)}>{Icons.trash} Esborrar</button>
            </div>
          </AccordionItem>
        ))}</div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Document' : 'Afegir Document'}>
        <div className="form-group"><label>Nom del document</label><input value={form.nombre||''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ex: Rol de Despatx, Assegurança Obligatòria..." /></div>
        <div className="form-group"><label>Breu descripció</label><input value={form.descripcion||''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ex: Pòlissa vigent fins el 2026..." /></div>
        <div className="form-group"><label>Categoria</label><select value={form.categoria||''} onChange={e => setForm({...form, categoria: e.target.value})}>{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="form-row">
          <div className="form-group"><label>Data document</label><input type="date" value={form.fecha||''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
          <div className="form-group"><label>Data de caducitat / Renovació</label><input type="date" value={form.caducidad||''} onChange={e => setForm({...form, caducidad: e.target.value})} /></div>
        </div>
        <div className="form-group" style={{ border: '1px dashed var(--border-color)', padding: 12, borderRadius: 6, marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Adjuntar fitxer (PDF o Imatge, màx. 1.5MB)</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} style={{ fontSize: '0.85rem' }} disabled={!!form.fileUrl} />
          {form.fileName && form.fileData && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>📎 Fitxer: {form.fileName}</span>
              <button 
                type="button" 
                className="btn btn-danger btn-sm" 
                onClick={() => setForm({ ...form, fileData: '', fileName: '', fileType: '' })}
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              >
                Eliminar
              </button>
            </div>
          )}
          
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>O bé enllaçar fitxer gran a la carpeta docs/</label>
            <input 
              value={form.fileUrl ? form.fileUrl.replace('/docs/', '') : ''} 
              onChange={e => {
                const val = e.target.value;
                const path = val ? `/docs/${val}` : '';
                setForm({ 
                  ...form, 
                  fileUrl: path, 
                  fileName: val || '', 
                  fileData: ''
                });
              }}
              placeholder="Ex: manual_motor.pdf" 
              style={{ fontSize: '0.85rem' }}
              disabled={!!form.fileData}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Per a fitxers grans (com manuals de 90MB), copia el fitxer a la teva carpeta local <code>public/docs/</code>, escriu el nom del fitxer a dalt i fes un <code>git push</code>.
            </p>
          </div>
        </div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Document</button>
      </Modal>
    </>
  );
}
