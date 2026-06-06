'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { EmptyState, Icons } from '@/components/UI';

export default function Tasques() {
  const { loaded, tasques, addTarea, updateTarea, deleteTarea } = useData();
  const [input, setInput] = useState('');
  const [prioridad, setPrioridad] = useState('Normal');

  if (!loaded) return null;

  const add = () => { if (!input.trim()) return; addTarea({ titulo: input.trim(), prioridad, done: false }); setInput(''); };
  const toggle = (id, done) => updateTarea(id, { done: !done });
  const pending = tasques.filter(t => !t.done);
  const done = tasques.filter(t => t.done);

  const prioColor = (p) => p === 'Alta' ? 'var(--red)' : p === 'Baixa' ? 'var(--green)' : 'var(--accent)';

  return (
    <>
      <div className="page-header">
        <h1>📋 Tasques Pendents</h1>
        <p>Llista de feines, reparacions i millores a bord</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Ex: Netejar filtre d'aigua de mar..." style={{ flex: 1, minWidth: 200 }} />
        <select value={prioridad} onChange={e => setPrioridad(e.target.value)} style={{ width: 120 }}>
          <option>Baixa</option>
          <option>Normal</option>
          <option>Alta</option>
        </select>
        <button className="btn btn-primary" onClick={add}>{Icons.plus}</button>
      </div>
      {tasques.length === 0 ? <EmptyState icon={Icons.check} message="Sense tasques pendents. Tot al dia!" /> : (
        <>
          <div className="item-list" style={{ marginBottom: 24 }}>
            {pending.map(item => (
              <div key={item.id} className="check-item">
                <input type="checkbox" checked={false} onChange={() => toggle(item.id, item.done)} />
                <span className="check-item-text">{item.titulo}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: prioColor(item.prioridad), marginRight: 4 }}>{item.prioridad}</span>
                <button className="check-item-delete" onClick={() => deleteTarea(item.id)}>{Icons.trash}</button>
              </div>
            ))}
          </div>
          {done.length > 0 && (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completades ({done.length})</p>
              <div className="item-list">
                {done.map(item => (
                  <div key={item.id} className="check-item done">
                    <input type="checkbox" checked onChange={() => toggle(item.id, item.done)} />
                    <span className="check-item-text">{item.titulo}</span>
                    <button className="check-item-delete" onClick={() => deleteTarea(item.id)}>{Icons.trash}</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
