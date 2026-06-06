'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Icons, formatDate, formatCurrency } from '@/components/UI';

export default function Dashboard() {
  const { loaded, tasques, despeses, combustible, manteniment, inventari, farmaciola, seguretat, despensa, ajustos } = useData();
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [statusModal, setStatusModal] = useState(false);

  if (!loaded) return null;

  const pendingTasques = tasques.filter(t => !t.done).length;
  const totalDespeses = despeses.reduce((s, g) => s + (parseFloat(g.importe) || 0), 0);
  const totalLitres = combustible.reduce((s, c) => s + (parseFloat(c.litros) || 0), 0);
  const totalCostCombustible = combustible.reduce((s, c) => s + (parseFloat(c.coste) || 0), 0);
  const lowStockItems = inventari.filter(i => i.alertaMinima && parseInt(i.stock) <= parseInt(i.alertaMinima)).length;

  const now = new Date();
  const expiringFarmaciola = farmaciola.filter(b => {
    if (!b.caducidad) return false;
    const d = (new Date(b.caducidad) - now) / (1000*60*60*24);
    return d < 30;
  }).length;
  const expiringSeguretat = seguretat.filter(s => {
    if (!s.caducidad) return false;
    const d = (new Date(s.caducidad) - now) / (1000*60*60*24);
    return d < 30;
  }).length;

  // Calcul d'hores actuals del motor (inicials + hores registrades al combustible o bitàcola)
  const horesInicials = parseFloat(ajustos.horesInicials) || 0;
  const horesCombustible = combustible.reduce((max, c) => Math.max(max, parseFloat(c.horasMotor) || 0), 0);
  const horesManteniment = manteniment.reduce((max, m) => Math.max(max, parseFloat(m.horasMotor) || 0), 0);
  const horesActuals = Math.max(horesInicials, horesCombustible, horesManteniment);

  // 1. Cercar alertes de seguretat, farmaciola, despensa i manteniment (per al visor d'alertes en temps real)
  const avui = new Date();
  
  const comprovaAlerta = (item, dataCamp = 'caducidad') => {
    const dataStr = item[dataCamp];
    if (!dataStr) return null;
    const data = new Date(dataStr);
    const diffDays = Math.ceil((data - avui) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      return { item, diffDays, dataStr };
    }
    return null;
  };

  const alertesSeguretat = seguretat.map(item => comprovaAlerta(item, 'caducidad')).filter(Boolean);
  const alertesFarmaciola = farmaciola.map(item => comprovaAlerta(item, 'caducidad')).filter(Boolean);
  const alertesDespensa = despensa.map(item => comprovaAlerta(item, 'caducidad')).filter(Boolean);
  const alertesManteniment = manteniment.map(item => comprovaAlerta(item, 'proximaRevision')).filter(Boolean);
  const alertesInventari = inventari.filter(i => i.alertaMinima && parseInt(i.stock) <= parseInt(i.alertaMinima));

  const totalAlertesActives = alertesSeguretat.length + alertesFarmaciola.length + alertesDespensa.length + alertesManteniment.length;

  const triggerEmail = async () => {
    setEmailLoading(true);
    setEmailMsg('');
    try {
      const res = await fetch('/api/cron/reminders', {
        method: 'GET',
        headers: {
          'x-user-password': 'doble2Vi.'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailMsg('Correu enviat correctament! 📬');
      } else {
        setEmailMsg(`Error: ${data.error || 'Intenta-ho de nou'} ❌`);
      }
    } catch (err) {
      setEmailMsg('Error de connexió a internet ❌');
    } finally {
      setEmailLoading(false);
      setTimeout(() => setEmailMsg(''), 4000);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Tauler de Control</h1>
        <p>Estat actual del {ajustos.nom} ({ajustos.model})</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-label">Feines pendents</div>
          <div className={`summary-card-value ${pendingTasques > 0 ? 'warning' : 'accent'}`}>{pendingTasques}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Despesa acumulada</div>
          <div className="summary-card-value negative">{formatCurrency(totalDespeses)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Hores Motor</div>
          <div className="summary-card-value accent">{horesActuals.toFixed(1)} h</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Total Combustible</div>
          <div className="summary-card-value accent">{totalLitres.toFixed(0)} L</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* TARGETA DE CONTROL I ALERTES ACTIVES */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Estat de Control i Alertes Actives
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 15 }}>
            Revisió en viu d'elements caducats, a punt de caducar (menys de 30 dies) o revisions preventives de motor a fer.
          </p>

          {totalAlertesActives === 0 ? (
            <div style={{ padding: '16px', background: 'rgba(74, 222, 128, 0.08)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)', color: 'var(--green)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span>✅</span> No hi ha cap alerta de control activa a bord. Tot el material, provisions i revisions estan al dia!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              {alertesSeguretat.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚨 Seguretat i Emergències</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {alertesSeguretat.map(({ item, diffDays }) => (
                      <li key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        • {item.nombre} <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', float: 'right', fontWeight: 'bold' }}>{diffDays < 0 ? `Caducat fa ${Math.abs(diffDays)} dies` : `Caduca en ${diffDays} dies`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {alertesFarmaciola.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--orange)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💊 Farmaciola i Salut</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {alertesFarmaciola.map(({ item, diffDays }) => (
                      <li key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        • {item.nombre} <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', float: 'right', fontWeight: 'bold' }}>{diffDays < 0 ? `Caducat fa ${Math.abs(diffDays)} dies` : `Caduca en ${diffDays} dies`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {alertesDespensa.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🥫 Rebost i Provisions</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {alertesDespensa.map(({ item, diffDays }) => (
                      <li key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        • {item.nombre} <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', float: 'right', fontWeight: 'bold' }}>{diffDays < 0 ? `Caducat fa ${Math.abs(diffDays)} dies` : `Caduca en ${diffDays} dies`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {alertesManteniment.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔧 Revisions de Manteniment</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {alertesManteniment.map(({ item, diffDays }) => (
                      <li key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        • {item.titulo} <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', float: 'right', fontWeight: 'bold' }}>{diffDays < 0 ? `Revisió vençuda fa ${Math.abs(diffDays)} d.` : `Revisió en ${diffDays} d.`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <button 
              className="btn btn-primary" 
              onClick={triggerEmail} 
              disabled={emailLoading}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {emailLoading ? '⏳ S\'està enviant...' : '📧 Enviar Informe per Email (Brevo)'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setStatusModal(true)}
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>📋</span> Veure Estat i Alertes en Viu
            </button>
            {emailMsg && (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                {emailMsg}
              </span>
            )}
          </div>
        </div>

        {pendingTasques > 0 && (
          <div className="dashboard-card">
            <h3>{Icons.check} Properes Tasques</h3>
            <div className="item-list">
              {tasques.filter(t => !t.done).slice(0, 5).map(t => (
                <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  {t.titulo} <span style={{ float: 'right', fontSize: '0.75rem', color: t.prioridad === 'Alta' ? 'var(--red)' : 'var(--text-secondary)' }}>{t.prioridad}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowStockItems > 0 && (
          <div className="dashboard-card">
            <h3>{Icons.box} Stock Sota Mínims</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--orange)' }}>{lowStockItems}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>recanvis que cal reposar al pañol</p>
          </div>
        )}

        <div className="dashboard-card">
          <h3>{Icons.wrench} Últims Manteniments</h3>
          {manteniment.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sense manteniments registrats</p>
          ) : (
            <div className="item-list">
              {manteniment.slice(0, 3).map(m => (
                <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 500 }}>{m.titulo}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{formatDate(m.fecha)} · {m.horasMotor ? `${m.horasMotor} h` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>🔧 Fitxa Ràpida Motor</h3>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div><span className="text-muted">Model:</span> <span className="font-bold">{ajustos.motor}</span></div>
            <div><span className="text-muted">Oli:</span> <span>{ajustos.oliMotor} ({ajustos.capacitatOli})</span></div>
            <div><span className="text-muted">Filtre Oli:</span> <span className="text-accent">{ajustos.filtreOli}</span></div>
            <div><span className="text-muted">Impeller/Turbina:</span> <span className="text-accent">{ajustos.turbina}</span></div>
          </div>
        </div>
      </div>

      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
            <div className="modal-header">
              <h2>📋 Estat de Control i Inventari de Borda</h2>
              <button className="modal-close" onClick={() => setStatusModal(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem' }}>
              <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div><strong>Vaixell:</strong> <span className="text-accent">{ajustos.nom || 'S/Y Afra II'}</span></div>
                <div><strong>Hores Motor:</strong> <span className="text-accent">{horesActuals.toFixed(1)} h</span></div>
                <div><strong>Data:</strong> <span>{formatDate(new Date())}</span></div>
              </div>

              {/* Contenidor de llistes */}
              <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '5px' }}>
                
                {/* 🚨 SEGURETAT */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span>🚨</span> Seguretat i Emergències
                  </h3>
                  {alertesSeguretat.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>✅ Tot al dia (sense elements caducats)</p>
                  ) : (
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {alertesSeguretat.map(({ item, diffDays }) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{item.nombre}</span>
                          <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', fontWeight: 'bold' }}>
                            {diffDays < 0 ? `Caducat fa ${Math.abs(diffDays)} dies` : `Caduca en ${diffDays} dies`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 💊 FARMACIOLA */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span>💊</span> Farmaciola i Salut
                  </h3>
                  {alertesFarmaciola.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>✅ Tot al dia (sense elements caducats)</p>
                  ) : (
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {alertesFarmaciola.map(({ item, diffDays }) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{item.nombre}</span>
                          <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', fontWeight: 'bold' }}>
                            {diffDays < 0 ? `Caducat fa ${Math.abs(diffDays)} dies` : `Caduca en ${diffDays} dies`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 🥫 REBOST */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span>🥫</span> Rebost i Provisions
                  </h3>
                  {alertesDespensa.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>✅ Tot al dia (sense provisions caducades)</p>
                  ) : (
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {alertesDespensa.map(({ item, diffDays }) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{item.nombre}</span>
                          <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', fontWeight: 'bold' }}>
                            {diffDays < 0 ? `Caducat fa ${Math.abs(diffDays)} dies` : `Caduca en ${diffDays} dies`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 🔧 MANTENIMENT */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span>🔧</span> Revisions i Manteniment
                  </h3>
                  {alertesManteniment.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>✅ Tot al dia (sense revisions pendents)</p>
                  ) : (
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {alertesManteniment.map(({ item, diffDays }) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{item.titulo}</span>
                          <span style={{ color: diffDays < 0 ? 'var(--red)' : 'var(--orange)', fontWeight: 'bold' }}>
                            {diffDays < 0 ? `Vencida fa ${Math.abs(diffDays)} dies` : `Toca en ${diffDays} dies`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 📦 INVENTARI SOTA MÍNIMS */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span>📦</span> Inventari i Recanvis sota Mínims
                  </h3>
                  {alertesInventari.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>✅ Stock complet (sense recanvis sota mínims)</p>
                  ) : (
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {alertesInventari.map(item => (
                        <li key={item.id} style={{ display: 'flex', flexDirection: 'column', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 500 }}>{item.nombre}</span>
                            <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>
                              Stock: {item.stock} / Mínim: {item.alertaMinima}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Ubicació: {item.ubicacionGeneral || 'Sense assignar'} {item.ubicacionEspecifica ? `(${item.ubicacionEspecifica})` : ''}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>

              {/* Botons d'acció */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '5px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={triggerEmail} 
                  disabled={emailLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {emailLoading ? '⏳ S\'està enviant...' : '📧 Enviar per Correu (Brevo)'}
                </button>
                <button className="btn btn-secondary" onClick={() => setStatusModal(false)}>
                  Tancar
                </button>
              </div>

              {emailMsg && (
                <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {emailMsg}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
