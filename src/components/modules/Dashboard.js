'use client';
import { useData } from '@/context/DataContext';
import { Icons, formatDate, formatCurrency } from '@/components/UI';

export default function Dashboard() {
  const { loaded, tasques, despeses, combustible, manteniment, inventari, farmaciola, seguretat, ajustos } = useData();
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

        {(expiringFarmaciola + expiringSeguretat) > 0 && (
          <div className="dashboard-card">
            <h3>{Icons.shield} Alertes de Caducitat</h3>
            {expiringFarmaciola > 0 && <p style={{ color: 'var(--red)', fontSize: '0.9rem', marginBottom: 6 }}>🏥 {expiringFarmaciola} medicament(s) a punt de caducar</p>}
            {expiringSeguretat > 0 && <p style={{ color: 'var(--red)', fontSize: '0.9rem' }}>🦺 {expiringSeguretat} element(s) de seguretat caducats o propers</p>}
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

        <div className="dashboard-card" style={{ gridColumn: 'span 1' }}>
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
