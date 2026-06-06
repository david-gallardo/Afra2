'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';

export default function Ajustos() {
  const { loaded, ajustos, saveAjustos, exportData, importData } = useData();
  const [form, setForm] = useState({});
  const [importInput, setImportInput] = useState('');
  const [msg, setMsg] = useState('');

  // Sincronitza un cop les dades de DataContext estan carregades
  useState(() => {
    if (loaded) setForm({ ...ajustos });
  }, [loaded]);

  if (!loaded) return null;

  const save = () => {
    saveAjustos(form);
    setMsg('Configuració desada correctament! ✅');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `erp_puma_copia_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    if (!importInput.trim()) return;
    const res = importData(importInput);
    if (res.success) {
      setMsg('Dades importades correctament! 🔄');
      setImportInput('');
    } else {
      setMsg(`Error en la importació: ${res.error} ❌`);
    }
    setTimeout(() => setMsg(''), 5000);
  };

  return (
    <>
      <div className="page-header">
        <h1>⚙️ Ajustos i Fitxa Tècnica</h1>
        <p>Especificacions de l'embarcació, control de motor i còpies de seguretat de les dades.</p>
      </div>

      {msg && <div style={{ padding: 12, background: 'var(--card-bg)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem', fontWeight: 600 }}>{msg}</div>}

      <div className="dashboard-grid">
        {/* FITXA TÈCNICA DEL VAIXELL */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>⛵ Fitxa Tècnica de l'Embarcació</h3>
          <div className="form-row">
            <div className="form-group"><label>Nom del Vaixell</label><input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="form-group"><label>Model / Drassana</label><input value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Matrícula / Patente</label><input value={form.matricula || ''} onChange={e => setForm({ ...form, matricula: e.target.value })} /></div>
            <div className="form-group"><label>MMSI (Ràdio)</label><input value={form.mmsi || ''} onChange={e => setForm({ ...form, mmsi: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Dipòsit d'Aigua Dolça (L)</label><input type="number" value={form.capacitatAigua || ''} onChange={e => setForm({ ...form, capacitatAigua: e.target.value })} /></div>
            <div className="form-group"><label>Dipòsit de Gasoil (L)</label><input type="number" value={form.capacitatGasoil || ''} onChange={e => setForm({ ...form, capacitatGasoil: e.target.value })} /></div>
          </div>
        </div>

        {/* DETALLS RÀPIDS DEL MOTOR */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>⚙️ Especificacions i Recanvis Motor</h3>
          <div className="form-row">
            <div className="form-group"><label>Model del Motor</label><input value={form.motor || ''} onChange={e => setForm({ ...form, motor: e.target.value })} /></div>
            <div className="form-group"><label>Potència (CV)</label><input value={form.potencia || ''} onChange={e => setForm({ ...form, potencia: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Tipus d'Oli recomanat</label><input value={form.oliMotor || ''} onChange={e => setForm({ ...form, oliMotor: e.target.value })} placeholder="Ex: 15W40 Mineral" /></div>
            <div className="form-group"><label>Capacitat d'Oli (L)</label><input value={form.capacitatOli || ''} onChange={e => setForm({ ...form, capacitatOli: e.target.value })} placeholder="Ex: 2.6 Litres" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Referència Filtre d'Oli</label><input value={form.filtreOli || ''} onChange={e => setForm({ ...form, filtreOli: e.target.value })} /></div>
            <div className="form-group"><label>Referència Filtre de Gasoil</label><input value={form.filtreGasoil || ''} onChange={e => setForm({ ...form, filtreGasoil: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Referència Turbina / Impeller</label><input value={form.turbina || ''} onChange={e => setForm({ ...form, turbina: e.target.value })} /></div>
            <div className="form-group"><label>Hores de Motor Inicials</label><input type="number" value={form.horesInicials || ''} onChange={e => setForm({ ...form, horesInicials: e.target.value })} placeholder="Ex: Hores en comprar el vaixell" /></div>
          </div>
          <button className="btn btn-primary" onClick={save} style={{ marginTop: 12 }}>Desar Configuració</button>
        </div>

        {/* SEGURETAT DE LES DADES & EXPORTACIONS */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>💾 Importació i Còpies de Seguretat (JSON)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12 }}>Com que aquesta aplicació desa les dades directament al teu navegador (localStorage), et recomanem exportar una còpia de seguretat periòdicament per no perdre res en netejar el navegador.</p>
          
          <button className="btn btn-ghost" onClick={handleExport} style={{ marginBottom: 20 }}>📥 Baixar Còpia de Seguretat (.json)</button>
          
          <div className="form-group">
            <label>Importar Dades (Enganxa el contingut del fitxer JSON exportat a sota)</label>
            <textarea 
              value={importInput} 
              onChange={e => setImportInput(e.target.value)} 
              placeholder="Enganxa el text del fitxer JSON aquí per restaurar..." 
              style={{ minHeight: 100, fontSize: '0.75rem', fontFamily: 'monospace' }}
            />
          </div>
          <button className="btn btn-danger" onClick={handleImport} style={{ marginTop: 8 }}>🔄 Importar i Sobreescriure Dades</button>
        </div>
      </div>
    </>
  );
}
