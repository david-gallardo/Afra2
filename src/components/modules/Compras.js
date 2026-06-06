'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { EmptyState, Icons } from '@/components/UI';

export default function Compras() {
  const { loaded, compras, addCompra, updateCompra, deleteCompra } = useData();
  const [input, setInput] = useState('');
  if (!loaded) return null;

  const add = () => { if (!input.trim()) return; addCompra({ texto: input.trim(), done: false }); setInput(''); };
  const toggle = (id, done) => updateCompra(id, { done: !done });
  const pending = compras.filter(c => !c.done);
  const done = compras.filter(c => c.done);

  return (
    <>
      <div className="page-header"><h1>🛒 Llista de la Compra</h1><p>Productes o recanvis pendents de comprar per al vaixell</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Afegir producte a comprar..." style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={add}>{Icons.plus}</button>
      </div>
      {compras.length === 0 ? <EmptyState icon={Icons.cart} message="Llista buida. Afegeix coses que necessitis." /> : (
        <>
          <div className="item-list" style={{ marginBottom: 24 }}>
            {pending.map(item => (
              <div key={item.id} className="check-item">
                <input type="checkbox" checked={false} onChange={() => toggle(item.id, item.done)} />
                <span className="check-item-text">{item.texto}</span>
                <button className="check-item-delete" onClick={() => deleteCompra(item.id)}>{Icons.trash}</button>
              </div>
            ))}
          </div>
          {done.length > 0 && (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comprats ({done.length})</p>
              <div className="item-list">
                {done.map(item => (
                  <div key={item.id} className="check-item done">
                    <input type="checkbox" checked onChange={() => toggle(item.id, item.done)} />
                    <span className="check-item-text">{item.texto}</span>
                    <button className="check-item-delete" onClick={() => deleteCompra(item.id)}>{Icons.trash}</button>
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
