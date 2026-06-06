'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, AccordionItem, EmptyState, Icons, formatDate } from '@/components/UI';

export default function Manteniment() {
  const { loaded, manteniment, addManteniment, updateManteniment, deleteManteniment, ajustos, saveAjustos } = useData();
  const [activeTab, setActiveTab] = useState('historial'); // 'historial', 'checklist', 'preventiu'
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('Tots');

  if (!loaded) return null;

  // Càlcul de les hores actuals del motor
  const horesInicials = parseInt(ajustos?.horesInicials || '1200', 10);
  const horesRegistrades = manteniment
    .map(item => parseInt(item.horasMotor, 10))
    .filter(h => !isNaN(h));
  const horesActuals = horesRegistrades.length > 0 ? Math.max(...horesRegistrades, horesInicials) : horesInicials;

  const openNew = () => { setForm({ titulo: '', descripcion: '', fecha: new Date().toISOString().split('T')[0], tipo: 'General', horasMotor: horesActuals.toString(), proximaRevision: '' }); setEditItem(null); setModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setModal(true); };
  const save = () => {
    if (!form.titulo) return;
    if (editItem) updateManteniment(editItem.id, form);
    else addManteniment(form);
    setModal(false);
  };

  const years = Array.from(new Set(manteniment.map(item => {
    if (!item.fecha) return null;
    return new Date(item.fecha).getFullYear().toString();
  }).filter(Boolean))).sort((a, b) => b - a);

  const filtered = manteniment.filter(i => {
    const matchesSearch = i.titulo?.toLowerCase().includes(search.toLowerCase()) || i.descripcion?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedYear === 'Tots') return true;
    if (!i.fecha) return false;
    return new Date(i.fecha).getFullYear().toString() === selectedYear;
  });

  const categories = ['General', 'Motor', 'Casc i Cua', 'Electricitat', 'Veles i Axarcia', 'Electrònica', 'Fondeig', 'Fontaneria', 'Altres'];

  // --- CHECKLIST ANUAL ---
  const checklistCategories = [
    {
      id: 'electricitat',
      title: '⚡ Bateries i Il·luminació',
      items: [
        { id: 'bat_bornes', label: 'Bornes de bateries (vaselina i pressió)', desc: 'Prevenir sulfatació i comprovar cargols.' },
        { id: 'bat_electrolit', label: 'Nivell d\'electròlit en bateries', desc: 'Afegir aigua destil·lada si cal (plom/àcid).' },
        { id: 'llums_nav', label: 'Llums de navegació (tope, costats, popa)', desc: 'Comprovar bombetes o LEDs i connexions.' },
        { id: 'llum_fondeig', label: 'Llum de fondeig i cabina', desc: 'Comprovar estanqueitat al tope de màstil.' }
      ]
    },
    {
      id: 'casc',
      title: '⛵ Casc, Sentina i Aixetes de Fons',
      items: [
        { id: 'casc_gelcoat', label: 'Inspecció de gelcoat / fibra', desc: 'Cercar esquerdes, cops o signes d\'osmosi.' },
        { id: 'casc_oxalic', label: 'Neteja de casc amb àcid oxàlic', desc: 'Eliminar taques grogues d\'òxid a la línia de flotació.' },
        { id: 'sentina_bombes', label: 'Bombes d\'achique (manual i elèctrica)', desc: 'Provar funcionament i netejar filtres de fons.' },
        { id: 'sentina_passacos', label: 'Estanqueitat corredera, sonda i eix', desc: 'Comprovar que no hi hagi goteig al premsaestopes.' },
        { id: 'grifos_seacocks', label: 'Aixetes de fons (cuina, bany, motor)', desc: 'Obrir/tancar per evitar bloqueig. Comprovar abraçadores.' },
        { id: 'desgue_dutxa', label: 'Filtre de desguàs de la dutxa', desc: 'Netejar de cabells i restes per evitar bloqueig.' },
        { id: 'filtre_aigua_dolca', label: 'Filtre de pressió d\'aigua dolça', desc: 'Netejar filtre previ al grup de pressió.' }
      ]
    },
    {
      id: 'axarcia',
      title: '⛓️ Estructura i Axàrcia',
      items: [
        { id: 'rig_fixed', label: 'Estat de l\'axàrcia fixa (stay, obenques)', desc: 'Comprovar cables, terminals d\'arrel i passadors.' },
        { id: 'rig_halyards', label: 'Drisses de major i gènova', desc: 'Revisar desgast per fregament. Rentar amb aigua dolça.' },
        { id: 'rig_sheets', label: 'Escotes de major i gènova', desc: 'Comprovar desgast i costures de mosquetons.' },
        { id: 'rig_reefs', label: 'Rizos i pajaril', desc: 'Comprovar que corrin bé per la botavara.' },
        { id: 'rig_furler', label: 'Enrollador de gènova i lazy jacks', desc: 'Netejar de sal i comprovar gir suau.' },
        { id: 'mast_trim', label: 'Alineació i rectitud del màstil', desc: 'Comprovar la flexió adequada sota tensió.' }
      ]
    },
    {
      id: 'lubricacio',
      title: '🧴 Lubricació i Engrassat',
      items: [
        { id: 'lub_winches', label: 'Engrassat de winches', desc: 'Desmuntar, netejar amb gasoil i greixar engranatges.' },
        { id: 'lub_blocks', label: 'Politges de rizos, contra i escotes', desc: 'Aplicar esprai de silicona seca.' },
        { id: 'lub_deck_hardware', label: 'Carril de major i tancaments', desc: 'Lubricar carros de boles i frontisses de cofres.' },
        { id: 'lub_engine_cables', label: 'Cables d\'accelerador i inversor', desc: 'Greixar ròtules i fundes a la bitàcola.' },
        { id: 'lub_rudder_shaft', label: 'Eix de timó / metxa', desc: 'Comprovar folgança i lubricar el coixinet si cal.' }
      ]
    },
    {
      id: 'varador',
      title: '🏗️ Varador i Botadura',
      items: [
        { id: 'var_grifos', label: 'Tancar aixetes de fons al varar', desc: 'Seguretat per a qualsevol feina de buc.' },
        { id: 'var_log_plug', label: 'Corredera treta i posat el tap', desc: 'Evitar cargolins i brutícia al sensor durant l\'hivern.' },
        { id: 'var_antifouling', label: 'Pintura patente (antifouling)', desc: 'Anual: escatar, netejar i aplicar dues capes.' },
        { id: 'var_shaft_grease', label: 'Greixatge premsaestopes (1 cm³)', desc: 'Afegir greix marí blau de qualitat al goter.' },
        { id: 'var_mast_climb', label: 'Pujada a màstil (veleta, politges)', desc: 'Revisar connexió de veleta, antena i llums de tope.' },
        { id: 'var_anchor_chain', label: 'Volta a la cadena de l\'àncora', desc: 'Invertir la cadena per desgastar per igual els extrems.' }
      ]
    }
  ];

  const handleCheckItem = (itemId) => {
    const currentChecklist = { ...ajustos.checklistAnual };
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Toggle: si ja està signat avui o té data, el netegem. Si no, li posem data d'avui.
    if (currentChecklist[itemId]) {
      delete currentChecklist[itemId];
    } else {
      currentChecklist[itemId] = dateStr;
    }

    saveAjustos({
      ...ajustos,
      checklistAnual: currentChecklist
    });
  };

  // Càlcul del progrés del checklist
  const totalChecklistItems = checklistCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedChecklistItems = Object.keys(ajustos.checklistAnual || {}).length;
  const checklistPercent = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  // --- MOTOR PREVENTIU PER HORES (SOLÉ DIESEL MINI 33) ---
  const findLastEngineJobHours = (searchTerms) => {
    const motorJobs = manteniment
      .filter(item => item.tipo === 'Motor' && item.horasMotor)
      .sort((a, b) => parseInt(b.horasMotor, 10) - parseInt(a.horasMotor, 10));

    for (const job of motorJobs) {
      const textToSearch = `${job.titulo} ${job.descripcion || ''}`.toLowerCase();
      if (searchTerms.some(term => textToSearch.includes(term))) {
        return parseInt(job.horasMotor, 10);
      }
    }
    return null;
  };

  const preventiuPlans = [
    {
      id: 'p50h',
      interval: 50,
      title: 'Control Preventiu 50h',
      search: ['50h', 'control', 'nivells', 'drenar', 'corretja'],
      tasks: 'Drenar filtre gasoil (aigua), comprovar nivells d\'oli, inversor i refrigerant, revisar fuites i corretges.',
      logTitle: 'Manteniment Motor 50h (Nivells i filtres)',
      logDesc: 'Drenar aigua del prefiltre de gasoil. Comprovació de fuites i nivells de motor, inversor i refrigerant.'
    },
    {
      id: 'p150h',
      interval: 150,
      title: 'Canvi d\'Oli i Neteja 150h',
      search: ['150h', 'oli', 'aceite', 'aire'],
      tasks: 'Canvi d\'oli motor (4.2L 15W40) i oli d\'inversor, neteja del filtre d\'aire, estat de l\'electròlit de bateries.',
      logTitle: 'Manteniment Motor 150h (Canvi d\'oli)',
      logDesc: 'Canvi d\'oli de motor (15W40) i oli de la caixa d\'inversor. Netejat filtre d\'aire del motor.'
    },
    {
      id: 'p300h',
      interval: 300,
      title: 'Filtres i Ànodes 300h',
      search: ['300h', 'filtre d\'oli', 'filtre de gasoil', 'ànod', 'anodo', 'corretges', 'escape'],
      tasks: 'Canviar filtre d\'oli (13124051), filtre de gasoil (13114022) i prefiltre decantador, ànode de zinc del bloc de motor, corretges i netejar colze d\'escapament.',
      logTitle: 'Manteniment Motor 300h (Filtres i Ànodes)',
      logDesc: 'Canvi de filtre d\'oli original (13124051), filtre de combustible (13114022), canvi d\'ànode de zinc de refrigeració i ajust de tensió de corretges.'
    },
    {
      id: 'p600h',
      interval: 600,
      title: 'Manteniment Major 600h',
      search: ['600h', 'turbina', 'impeller', 'vàlvules', 'valvulas', 'injectors', 'eix'],
      tasks: 'Canvi de turbina de la bomba d\'aigua (impeller 31211008R), reglatge de joc de vàlvules, revisió d\'injectors i alineació d\'eix.',
      logTitle: 'Manteniment Motor 600h (Major & Impeller)',
      logDesc: 'Canvi de la turbina de bomba d\'aigua dolça/salada (31211008R), comprovació dels injectors, reglatge de vàlvules i alineació de l\'eix amb la inversora.'
    }
  ];

  const logShortcut = (plan) => {
    setForm({
      titulo: plan.logTitle,
      descripcion: plan.logDesc,
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'Motor',
      horasMotor: horesActuals.toString(),
      proximaRevision: ''
    });
    setEditItem(null);
    setModal(true);
  };

  return (
    <>
      <div className="page-header">
        <h1>🛠️ Manteniment i Revisions</h1>
        <p>Registra i controla el manteniment per hores del Solé Mini 33, revisions de temporada i punts de control.</p>
      </div>

      {/* PESTANYES DE SUB-MÒDUL */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
        <button 
          className={`btn ${activeTab === 'historial' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('historial')}
          style={{ borderRadius: '6px 6px 0 0', padding: '10px 16px', fontSize: '0.9rem' }}
        >
          📝 Historial de Revisions
        </button>
        <button 
          className={`btn ${activeTab === 'preventiu' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('preventiu')}
          style={{ borderRadius: '6px 6px 0 0', padding: '10px 16px', fontSize: '0.9rem' }}
        >
          ⚙️ Preventiu Motor ({horesActuals} h)
        </button>
        <button 
          className={`btn ${activeTab === 'checklist' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('checklist')}
          style={{ borderRadius: '6px 6px 0 0', padding: '10px 16px', fontSize: '0.9rem' }}
        >
          📋 Punts de Control Anuals ({checklistPercent}%)
        </button>
      </div>

      {/* VISTA 1: HISTORIAL DE REVISIONS */}
      {activeTab === 'historial' && (
        <>
          <div className="toolbar">
            <div className="toolbar-search">
              {Icons.search}
              <input placeholder="Buscar manteniment..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nou registre</button>
          </div>

          {years.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                className={`btn btn-sm ${selectedYear === 'Tots' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedYear('Tots')}
              >
                Tots els anys
              </button>
              {years.map(y => (
                <button
                  key={y}
                  className={`btn btn-sm ${selectedYear === y ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState icon={Icons.wrench} message="Sense registres de manteniment. Afegeix la primera revisió." />
          ) : (
            <div className="item-list">
              {filtered.map(item => (
                <AccordionItem key={item.id} title={item.titulo} subtitle={formatDate(item.fecha)} badge={item.tipo} badgeClass="ok">
                  <div className="item-details">
                    <div><span className="item-detail-label">Categoria: </span><span className="item-detail-value accent">{item.tipo}</span></div>
                    <div><span className="item-detail-label">Data: </span><span className="item-detail-value">{formatDate(item.fecha)}</span></div>
                    {item.horasMotor && <div><span className="item-detail-label">Hores motor: </span><span className="item-detail-value accent">{item.horasMotor} h</span></div>}
                    {item.proximaRevision && <div><span className="item-detail-label">Proper control: </span><span className="item-detail-value orange">{formatDate(item.proximaRevision)}</span></div>}
                  </div>
                  {item.descripcion && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.descripcion}</p>}
                  <div className="item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{Icons.edit} Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteManteniment(item.id)}>{Icons.trash} Esborrar</button>
                  </div>
                </AccordionItem>
              ))}
            </div>
          )}
        </>
      )}

      {/* VISTA 2: PREVENTIU MOTOR HORES */}
      {activeTab === 'preventiu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dashboard-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: 18 }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>⚙️ Manteniment Preventiu del Motor (Solé Diesel Mini 33)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              L'ERP calcula el manteniment segons la lectura d'hores actual del motor (<strong>{horesActuals} h</strong>) d'acord amb el manual oficial de Solé Diesel.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {preventiuPlans.map(plan => {
                const lastHours = findLastEngineJobHours(plan.search);
                const faHores = lastHours !== null ? (horesActuals - lastHours) : null;
                const calFer = faHores === null || faHores >= plan.interval;
                
                return (
                  <div 
                    key={plan.id} 
                    style={{ 
                      padding: 16, 
                      borderRadius: 8, 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: `1px solid ${calFer ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{plan.title}</h4>
                        <span className={`badge ${calFer ? 'badge-warning' : 'badge-ok'}`} style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
                          {calFer ? '⚠️ Pendents' : '✅ Fet'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>{plan.tasks}</p>
                      <div style={{ fontSize: '0.75rem', marginBottom: 12 }}>
                        {lastHours !== null ? (
                          <span>Darrer cop: <strong>{lastHours} h</strong> (fa {faHores} h). Proxim: <strong>{lastHours + plan.interval} h</strong>.</span>
                        ) : (
                          <span style={{ color: 'var(--orange)' }}>Sense registres en l'historial d'aquest manteniment.</span>
                        )}
                      </div>
                    </div>
                    <button 
                      className={`btn btn-sm ${calFer ? 'btn-primary' : 'btn-ghost'}`} 
                      onClick={() => logShortcut(plan)}
                      style={{ fontSize: '0.8rem', width: '100%', marginTop: 'auto' }}
                    >
                      🛠️ Registrar feina a les {horesActuals} h
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: PUNTS DE CONTROL ANUALS */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dashboard-card">
            <h3 style={{ margin: '0 0 10px 0' }}>📋 Checklist de Temporada / Inspecció Anual</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Punts de control detallats adaptats del llibre de manteniment per a l'Afra II. Marcar-los actualitza la data de la darrera comprovació.
            </p>

            {/* Progrés */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span>Progrés global del Checklist de Temporada</span>
                <strong>{completedChecklistItems} de {totalChecklistItems} ({checklistPercent}%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${checklistPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Categories del checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {checklistCategories.map(cat => (
                <div key={cat.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 14, background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: 6, fontSize: '0.9rem', color: 'var(--accent)' }}>{cat.title}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cat.items.map(item => {
                      const isChecked = !!ajustos.checklistAnual?.[item.id];
                      const checkDate = ajustos.checklistAnual?.[item.id];
                      return (
                        <div 
                          key={item.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            fontSize: '0.85rem', 
                            padding: '6px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.02)'
                          }}
                        >
                          <div style={{ paddingRight: 15 }}>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => handleCheckItem(item.id)} 
                                style={{ width: 16, height: 16, cursor: 'pointer' }}
                              />
                              <span style={{ textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-secondary)' : 'inherit' }}>
                                {item.label}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginLeft: 22 }}>
                              {item.desc}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isChecked && (
                              <span className="badge badge-ok" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                                {checkDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PER AFEGIR/EDITAR HISTORIAL */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Editar Registre' : 'Nou Registre de Manteniment'}>
        <div className="form-group"><label>Títol / Feina</label><input value={form.titulo || ''} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Canvi d'oli de motor i filtre" /></div>
        <div className="form-row">
          <div className="form-group"><label>Data</label><input type="date" value={form.fecha || ''} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
          <div className="form-group"><label>Categoria</label><select value={form.tipo || ''} onChange={e => setForm({...form, tipo: e.target.value})}>{categories.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Hores motor (lectura tauler)</label><input type="number" value={form.horasMotor || ''} onChange={e => setForm({...form, horasMotor: e.target.value})} placeholder="Ex: 1255" /></div>
          <div className="form-group"><label>Propera revisió (data o control)</label><input type="date" value={form.proximaRevision || ''} onChange={e => setForm({...form, proximaRevision: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Descripció detallada / Referències utilitzades</label><textarea value={form.descripcion || ''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ex: Oli 15W40 Mineral. Filtre d'oli Mann-Filter W814/80." /></div>
        <button className="btn btn-primary btn-full mt-2" onClick={save}>Desar Manteniment</button>
      </Modal>
    </>
  );
}
