'use client';
import { useState, useEffect } from 'react';
import { DataProvider } from '@/context/DataContext';
import Login from '@/components/Login';
import { Icons } from '@/components/UI';
import Dashboard from '@/components/modules/Dashboard';
import Tasques from '@/components/modules/Tasques';
import Manteniment from '@/components/modules/Manteniment';
import Inventari from '@/components/modules/Inventari';
import Veles from '@/components/modules/Veles';
import Combustible from '@/components/modules/Combustible';
import Bitacola from '@/components/modules/Bitacola';
import Despeses from '@/components/modules/Despeses';
import Compras from '@/components/modules/Compras';
import Despensa from '@/components/modules/Despensa';
import Farmaciola from '@/components/modules/Farmaciola';
import Seguretat from '@/components/modules/Seguretat';
import Documents from '@/components/modules/Documents';
import Agenda from '@/components/modules/Agenda';
import Ajustos from '@/components/modules/Ajustos';
import Projectes from '@/components/modules/Projectes';
import Recursos from '@/components/modules/Recursos';
import Cercador from '@/components/modules/Cercador';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Tauler (Dashboard)', icon: Icons.home },
  { key: 'cercador', label: 'Cercador General', icon: Icons.search },
  { key: 'tasques', label: 'Tasques', icon: Icons.check },
  { key: 'manteniment', label: 'Manteniment', icon: Icons.wrench },
  { key: 'inventari', label: 'Inventari i Peces', icon: Icons.box },
  { key: 'veles', label: 'Pañol de Veles', icon: Icons.sail },
  { key: 'combustible', label: 'Combustible', icon: Icons.fuel },
  { key: 'bitacola', label: 'Bitàcola', icon: Icons.book },
  { key: 'despeses', label: 'Finances', icon: Icons.dollar },
  { key: 'compras', label: 'Llista Compra', icon: Icons.cart },
  { key: 'despensa', label: 'Rebost / Celler', icon: Icons.coffee },
  { key: 'farmaciola', label: 'Farmaciola', icon: Icons.heart },
  { key: 'seguretat', label: 'Seguretat i Emerg.', icon: Icons.shield },
  { key: 'documents', label: 'Documents i Manuals', icon: Icons.file },
  { key: 'agenda', label: 'Agenda', icon: Icons.phone },
  { key: 'projectes', label: 'Projectes DIY i Bricos', icon: Icons.wrench },
  { key: 'recursos', label: 'Recursos Multimèdia', icon: Icons.video },
  { key: 'ajustos', label: 'Ajustos i Fitxa', icon: Icons.settings },
];

const MODULES = {
  dashboard: Dashboard,
  cercador: Cercador,
  tasques: Tasques,
  manteniment: Manteniment,
  inventari: Inventari,
  veles: Veles,
  combustible: Combustible,
  bitacola: Bitacola,
  despeses: Despeses,
  compras: Compras,
  despensa: Despensa,
  farmaciola: Farmaciola,
  seguretat: Seguretat,
  documents: Documents,
  agenda: Agenda,
  projectes: Projectes,
  recursos: Recursos,
  ajustos: Ajustos,
};

export default function Home() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('erp_session_user');
    if (savedUser && (savedUser === 'gallardopujol@gmail.com' || savedUser === 'lauravinyals@gmail.com')) {
      setUser(savedUser);
    }
    setAuthLoading(false);
  }, []);

  const navigate = (key) => {
    setActiveModule(key);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_session_user');
    window.location.reload();
  };

  const ActiveComponent = MODULES[activeModule] || Dashboard;

  if (authLoading) {
    return <div style={{ background: '#0A1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4FC3F7', fontWeight: 600 }}>Carregant sessió...</div>;
  }

  if (!user) {
    return (
      <Login onSuccess={(email) => {
        localStorage.setItem('erp_session_user', email);
        setUser(email);
      }} />
    );
  }

  return (
    <DataProvider>
      <div className="app-container">
        {/* Sidebar Overlay (mobile) */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer' }}>
            {Icons.anchor}
            <span>S/Y Afra II</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            {Icons.close}
          </button>
          <ul className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <li key={item.key}>
                <button
                  className={activeModule === item.key ? 'active' : ''}
                  onClick={() => navigate(item.key)}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
            {/* Botó de Tancar Sessió */}
            <li style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <button
                onClick={handleLogout}
                style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Tancar Sessió
              </button>
            </li>
          </ul>
        </nav>

        {/* Header */}
        <header className="header">
          <div className="header-brand" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer' }}>
            {Icons.anchor}
            <span>S/Y Afra II</span>
          </div>
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            {Icons.menu}
          </button>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <ActiveComponent onNavigate={navigate} />
        </main>
      </div>
    </DataProvider>
  );
}
