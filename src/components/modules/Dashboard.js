'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Icons, formatDate, formatCurrency } from '@/components/UI';

export default function Dashboard() {
  const { loaded, tasques, despeses, combustible, manteniment, inventari, farmaciola, seguretat, ajustos } = useData();
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

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
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🥫 Despensa i Provisions</h4>
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
    </>
  );
}
