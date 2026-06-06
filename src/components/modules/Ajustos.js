'use client';
import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';

export default function Ajustos() {
  const { loaded, ajustos, saveAjustos, exportData, importData } = useData();
  const [form, setForm] = useState({});
  const [importInput, setImportInput] = useState('');
  const [msg, setMsg] = useState('');

  // Sincronitza un cop les dades de DataContext estan carregades
  useEffect(() => {
    if (loaded) setForm({ ...ajustos });
  }, [loaded, ajustos]);

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

  const handleLogout = () => {
    localStorage.removeItem('erp_session_user');
    window.location.reload();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Exportem a JPEG comprimit al 70% de qualitat per mantenir la imatge per sota de 150-200KB
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        const updatedAjustos = { ...form, bgImage: compressedBase64 };
        setForm(updatedAjustos);
        saveAjustos(updatedAjustos);
        setMsg('Imatge de fons del login actualitzada correctament! 📸');
        setTimeout(() => setMsg(''), 3000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    const updatedAjustos = { ...form };
    delete updatedAjustos.bgImage;
    setForm(updatedAjustos);
    saveAjustos(updatedAjustos);
    setMsg('S\'ha restaurat la imatge de fons per defecte. ⛵');
    setTimeout(() => setMsg(''), 3000);
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

        {/* IMATGE DE FONS DEL LOGIN */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>📸 Imatge de Fons del Login</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12 }}>
            Personalitza la imatge de fons que es mostra a la pantalla de login.
            La imatge es redimensionarà i comprimirà automàticament per estalviar espai i es sincronitzarà al núvol amb Supabase.
          </p>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px',
              height: '80px',
              borderRadius: '6px',
              backgroundImage: `url(${form.bgImage || '/proa.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid var(--border-color)'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="bg-image-upload"
              />
              <label htmlFor="bg-image-upload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                📷 Selecciona una imatge
              </label>
              {form.bgImage && (
                <button className="btn btn-danger btn-sm" onClick={handleResetImage}>
                  🗑️ Restableix la imatge per defecte
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SEGURETAT DE LES DADES & COPIES DE SEGURETAT */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>💾 Còpies de Seguretat i Núvol (Supabase)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12 }}>
            Les teves dades es sincronitzen de forma segura i automàtica al núvol amb <strong>Supabase</strong>. 
            No has de patir si esborres la memòria cau o neteges el navegador. No obstant, per seguretat addicional, 
            pots seguir baixant còpies locals en format JSON.
          </p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 20 }}>
            <button className="btn btn-ghost" onClick={handleExport}>📥 Baixar Còpia de Seguretat (.json)</button>
            <button className="btn btn-danger" onClick={handleLogout} style={{ background: '#F87171', color: '#0A1628', border: 'none' }}>🚪 Tancar Sessió (Sortir)</button>
          </div>
          
          <div className="form-group">
            <label>Importar i Restaurar dades a Supabase des de JSON (Enganxa el contingut a sota)</label>
            <textarea 
              value={importInput} 
              onChange={e => setImportInput(e.target.value)} 
              placeholder="Enganxa el text del fitxer JSON aquí per restaurar..." 
              style={{ minHeight: 100, fontSize: '0.75rem', fontFamily: 'monospace' }}
            />
          </div>
          <button className="btn btn-danger" onClick={handleImport} style={{ marginTop: 8 }}>🔄 Importar i Sobreescriure dades al Núvol</button>
        </div>
      </div>
    </>
  );
}
