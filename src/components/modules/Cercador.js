'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Icons } from '@/components/UI';

export default function Cercador({ onNavigate }) {
  const data = useData();
  const [query, setQuery] = useState('');

  // Noms amigables de les categories i les seves icones per mostrar als resultats
  const MODULE_METADATA = {
    manteniment: { name: 'Manteniment', icon: Icons.wrench, key: 'manteniment' },
    inventari: { name: 'Inventari i Peces', icon: Icons.box, key: 'inventari' },
    despensa: { name: 'Despensa / Celler', icon: Icons.coffee, key: 'despensa' },
    farmaciola: { name: 'Farmaciola', icon: Icons.heart, key: 'farmaciola' },
    seguretat: { name: 'Seguretat i Emerg.', icon: Icons.shield, key: 'seguretat' },
    compras: { name: 'Llista Compra', icon: Icons.cart, key: 'compras' },
    bitacola: { name: 'Bitàcola', icon: Icons.book, key: 'bitacola' },
    despeses: { name: 'Finances', icon: Icons.dollar, key: 'despeses' },
    tasques: { name: 'Tasques', icon: Icons.check, key: 'tasques' },
    combustible: { name: 'Combustible', icon: Icons.fuel, key: 'combustible' },
    documents: { name: 'Documents', icon: Icons.file, key: 'documents' },
    veles: { name: 'Pañol de Veles', icon: Icons.sail, key: 'veles' },
    agenda: { name: 'Agenda', icon: Icons.phone, key: 'agenda' },
    projectes: { name: 'Projectes DIY', icon: Icons.wrench, key: 'projectes' },
    recursos: { name: 'Recursos', icon: Icons.video, key: 'recursos' },
    ajustos: { name: 'Ajustos i Fitxa', icon: Icons.settings, key: 'ajustos' },
  };

  const translateField = (key) => {
    const translations = {
      nom: 'Nom',
      nombre: 'Nom',
      model: 'Model',
      matricula: 'Matrícula',
      mmsi: 'MMSI',
      motor: 'Motor',
      potencia: 'Potència',
      oliMotor: 'Oli de motor',
      capacitatOli: 'Capacitat d\'oli',
      filtreOli: 'Filtre d\'oli',
      filtreGasoil: 'Filtre de gasoil',
      turbina: 'Turbina / Impeller',
      horesInicials: 'Hores inicials',
      capacitatAigua: 'Dipòsit aigua dolça',
      capacitatGasoil: 'Dipòsit gasoil',
      titulo: 'Títol',
      descripcion: 'Descripció',
      materials: 'Materials',
      observaciones: 'Observacions',
      ubicacion: 'Ubicació',
      categoria: 'Categoria',
      cantidad: 'Quantitat',
      concepto: 'Concepte',
      caducidad: 'Data de caducitat',
      estado: 'Estat',
      texto: 'Text de bitàcola',
      viento: 'Vent',
      estadoMar: 'Estat de la mar',
      horasMotor: 'Hores de motor',
      importe: 'Import',
      telefono: 'Telèfon',
      email: 'Correu electrònic',
      notas: 'Notes',
    };
    return translations[key] || key;
  };

  const cleanQuery = query.trim().toLowerCase();

  const getResults = () => {
    if (!cleanQuery) return [];

    const results = [];

    // 1. Cercar en col·leccions (arrays)
    Object.keys(MODULE_METADATA).forEach(moduleKey => {
      if (moduleKey === 'ajustos') return; // ajustos es tracta a part per ser un objecte únic

      const collection = data[moduleKey];
      if (!Array.isArray(collection)) return;

      collection.forEach(item => {
        let match = false;
        const matchedFields = [];

        Object.entries(item).forEach(([key, val]) => {
          if (key === 'id' || key === 'created_at') return;
          if (val !== null && val !== undefined) {
            if (typeof val === 'string' && val.toLowerCase().includes(cleanQuery)) {
              match = true;
              matchedFields.push(`${translateField(key)}: "${val}"`);
            } else if (typeof val === 'number' && val.toString().includes(cleanQuery)) {
              match = true;
              matchedFields.push(`${translateField(key)}: ${val}`);
            }
          }
        });

        if (match) {
          results.push({
            id: item.id,
            moduleKey,
            title: item.nombre || item.titulo || item.concepto || item.fecha || 'Element',
            snippet: matchedFields.join(', '),
            item
          });
        }
      });
    });

    // 2. Cercar als Ajustos (objecte únic de configuració)
    const ajustosObj = data.ajustos;
    if (ajustosObj && typeof ajustosObj === 'object') {
      const matchedAjustosFields = [];
      let ajustosMatch = false;

      Object.entries(ajustosObj).forEach(([key, val]) => {
        if (key === 'id' || key === 'created_at' || key === 'bgImage') return;
        if (val !== null && val !== undefined) {
          const stringVal = String(val).toLowerCase();
          const stringKey = String(key).toLowerCase();
          
          if (stringVal.includes(cleanQuery) || stringKey.includes(cleanQuery)) {
            ajustosMatch = true;
            matchedAjustosFields.push(`${translateField(key)}: "${val || '—'}"`);
          }
        }
      });

      if (ajustosMatch) {
        results.push({
          id: 'single_ajustos',
          moduleKey: 'ajustos',
          title: 'Fitxa Tècnica de l\'Embarcació',
          snippet: matchedAjustosFields.join(', '),
          item: ajustosObj
        });
      }
    }

    return results;
  };

  const results = getResults();

  return (
    <>
      <div className="page-header">
        <h1>🔍 Cercador General</h1>
        <p>Troba ràpidament qualsevol element, aliment, medicament, brico, manual o dada tècnica a bord.</p>
      </div>

      <div className="toolbar" style={{ justifyContent: 'flex-start', gap: '15px' }}>
        <div className="toolbar-search" style={{ maxWidth: '500px', width: '100%' }}>
          {Icons.search}
          <input
            type="text"
            placeholder="Cerca per 'bateria', 'MMSI', 'oli', 'motor', 'veles'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        {cleanQuery && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            S'han trobat {results.length} {results.length === 1 ? 'resultat' : 'resultats'}
          </span>
        )}
      </div>

      <div className="item-list mt-2">
        {cleanQuery === '' ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.3 }}>🔍</span>
            <p style={{ marginTop: '10px', fontSize: '0.95rem' }}>Escriu alguna paraula clau a dalt per fer una cerca global a bord.</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.3 }}>⚠️</span>
            <p style={{ marginTop: '10px', fontSize: '0.95rem' }}>No s'ha trobat cap element que coincideixi amb "{query}".</p>
          </div>
        ) : (
          results.map((res, index) => {
            const meta = MODULE_METADATA[res.moduleKey] || { name: 'Mòdul', icon: Icons.file };
            return (
              <div 
                key={`${res.moduleKey}-${res.id}-${index}`} 
                className="item-card" 
                style={{ 
                  padding: '16px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', height: '18px', width: '18px' }}>
                      {meta.icon}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {meta.name}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                    {res.title}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    {res.snippet}
                  </p>
                </div>
                <div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => onNavigate(meta.key)}
                  >
                    Anar al Mòdul ➔
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
