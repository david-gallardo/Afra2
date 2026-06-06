'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons } from '@/components/UI';

export default function Projectes() {
  const { loaded, projectes, addProjecte, updateProjecte, deleteProjecte } = useData();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  if (!loaded) return null;

  const openNew = () => { setForm({ titulo: '', descripcion: '', enlace: '', materials: '', prioridad: 'Normal', done: false }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => { if (!form.titulo) return; editItem ? updateProjecte(editItem.id, form) : addProjecte(form); setModal(false); };
  const toggle = (id, done) => updateProjecte(id, { done: !done });

  const filtered = projectes.filter(p => p.titulo?.toLowerCase().includes(search.toLowerCase()) || p.descripcion?.toLowerCase().includes(search.toLowerCase()));
  const pending = filtered.filter(p => !p.done);
  const completed = filtered.filter(p => p.done);

  const prioColor = (p) => p === 'Alta' ? 'var(--red)' : p === 'Baixa' ? 'var(--green)' : 'var(--accent)';

  return (
    <>
      <div className="page-header">
        <h1>💡 Projectes DIY i Millores</h1>
        <p>Idees, bricos i millores per al teu vaixell inspirades en els vídeos de <em>"The Low-Cost Sailor"</em></p>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          {Icons.search}
          <input placeholder="Buscar projecte..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou Projecte</button>
      </div>

      {projectes.length === 0 ? <EmptyState icon={Icons.settings} message="Sense projectes a la llista. Afegeix el teu primer projecte." /> : (
        <>
          {pending.length > 0 && (
            <div className="item-list" style={{ marginBottom: 24 }}>
              <h3 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projectes Pendents ({pending.length})</h3>
              {pending.map(item => (
                <AccordionItem 
                  key={item.id} 
                  title={item.titulo} 
                  subtitle={`Prioritat: ${item.prioridad}`} 
                  badge="Pendent" 
                  badgeClass="low"
                >
                  <div className="item-details" style={{ paddingTop: 12 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span className="item-detail-label">Descripció: </span>
                      <p className="item-detail-value" style={{ marginTop: 4, color: 'var(--text-main)' }}>{item.descripcion}</p>
                    </div>
                    {item.materials && (
                      <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
                        <span className="item-detail-label">🔨 Materials i Recanvis: </span>
                        <span className="item-detail-value text-accent" style={{ display: 'block', marginTop: 4 }}>{item.materials}</span>
                      </div>
                    )}
                    {item.enlace && (
                      <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
                        <span className="item-detail-label">🎥 Vídeo / Enllaç: </span>
                        <a href={item.enlace} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--green)', textDecoration: 'underline', marginTop: 4 }}>
                          🌐 Veure vídeo explicatiu
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="item-actions">
                    <button className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--green)', color: '#0A1628' }} onClick={() => toggle(item.id, item.done)}>✓ Fet</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProjecte(item.id)}>{Icons.trash} Esborrar</button>
                  </div>
                </AccordionItem>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="item-list">
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completats ({completed.length})</h3>
              {completed.map(item => (
                <AccordionItem 
                  key={item.id} 
                  title={item.titulo} 
                  subtitle="Projecte finalitzat correctament! 🎉" 
                  badge="Fet" 
                  badgeClass="stock"
                >
                  <div className="item-details" style={{ paddingTop: 12, opacity: 0.6 }}>
                    <div style={{ gridColumn: 'span 2' }}><span className="item-detail-label">Descripció: </span><span className="item-detail-value">{item.descripcion}</span></div>
                    {item.materials && <div style={{ gridColumn: 'span 2', marginTop: 4 }}><span className="item-detail-label">Materials: </span><span className="item-detail-value">{item.materials}</span></div>}
                  </div>

                  <div className="item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle(item.id, item.done)}>🔄 Desfer (Pendent)</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProjecte(item.id)}>{Icons.trash} Esborrar</button>
                  </div>
                </AccordionItem>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Projecte' : 'Afegir Nou Projecte DIY'}>
        <div className="form-group"><label>Títol del Projecte</label><input value={form.titulo||''} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Fabricar dipòsit d'aigua extra" /></div>
        <div className="form-group"><label>Descripció detallada del brico</label><textarea value={form.descripcion||''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="En què consisteix el projecte..." /></div>
        <div className="form-group"><label>🎥 Enllaç al vídeo de YouTube o referències</label><input value={form.enlace||''} onChange={e => setForm({...form, enlace: e.target.value})} placeholder="Ex: https://www.youtube.com/watch?..." /></div>
        <div className="form-group"><label>🔨 Materials, cables, eines i referències</label><textarea value={form.materials||''} onChange={e => setForm({...form, materials: e.target.value})} placeholder="Ex: Cables de 25mm, fusibles de 80A..." /></div>
        <div className="form-group">
          <label>Prioritat</label>
          <select value={form.prioridad||'Normal'} onChange={e => setForm({...form, prioridad: e.target.value})}>
            <option>Alta</option><option>Normal</option><option>Baixa</option>
          </select>
        </div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Projecte</button>
      </Modal>
    </>
  );
}
