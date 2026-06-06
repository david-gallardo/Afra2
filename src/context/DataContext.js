'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const DataContext = createContext();

const STORAGE_KEYS = {
  manteniment: 'erp_manteniment',
  inventari: 'erp_inventari',
  despensa: 'erp_despensa',
  farmaciola: 'erp_farmaciola',
  seguretat: 'erp_seguretat',
  compras: 'erp_compras',
  bitacola: 'erp_bitacola',
  despeses: 'erp_despeses',
  tasques: 'erp_tasques',
  combustible: 'erp_combustible',
  documents: 'erp_documents',
  veles: 'erp_veles',
  agenda: 'erp_agenda',
  ajustos: 'erp_ajustos',
  projectes: 'erp_projectes',
  recursos: 'erp_recursos',
};

const DEFAULT_AJUSTOS = {
  nom: 'Afra2',
  model: 'Puma 32',
  matricula: '7ª-BA-3-123-95',
  mmsi: '224123456',
  motor: 'Yanmar 3GM30F',
  potencia: '27 CV',
  oliMotor: '15W40 Mineral',
  capacitatOli: '2.6 L',
  filtreOli: '128270-12500',
  filtreGasoil: '104500-55710',
  turbina: '128296-42070',
  horesInicials: '1200',
  capacitatAigua: '150 L',
  capacitatGasoil: '80 L',
};

const DEFAULT_PROJECTES = [
  {
    id: 'p1',
    titulo: 'Instal·lació de Bateries de Liti LiFePO4',
    descripcion: 'Canviar les velles bateries de plom/gel per liti de sota cost. Augmenta la capacitat útil fins a un 90% i redueix el pes a la meitat.',
    enlace: 'https://www.youtube.com/watch?v=vV95iJ4aMco',
    materials: '4 cèl·lules LiFePO4 3.2V 280Ah de la Xina, BMS JBD o Daly 120A, cables de 50mm², fusible ANL de seguretat.',
    prioridad: 'Alta',
    done: false,
  },
  {
    id: 'p2',
    titulo: 'Receptor AIS Casolà amb Raspberry Pi',
    descripcion: 'Veure la posició dels vaixells comercials i de l\'entorn al teu propi plotter OpenCPN mitjançant un dongle de TV USB ultra barat.',
    enlace: 'https://www.youtube.com/watch?v=W5L2pYyB5gI',
    materials: 'Raspberry Pi 4, Receptor USB RTL-SDR, Antena VHF portàtil o splitter d\'antena, programari lliure OpenPlotter.',
    prioridad: 'Alta',
    done: false,
  },
  {
    id: 'p3',
    titulo: 'Aïllament Extrem de la Nevera de Bord',
    descripcion: 'Forrar el cofre de la nevera amb aïllant extruït per reduir fins a un 50% el temps de funcionament del compressor i estalviar molta bateria.',
    enlace: 'https://www.youtube.com/watch?v=mD2bI7d5l1M',
    materials: 'Plaques de poliuretà extruït (XPS) de 30mm, escuma de poliuretà expansiu, cinta d\'alumini adhesiva.',
    prioridad: 'Mitjana',
    done: false,
  },
  {
    id: 'p4',
    titulo: 'Sensor de Dipòsits WiFi amb ESP32',
    descripcion: 'Monitoritzar en temps real el nivell d\'aigua dolça o de combustible des del mòbil mitjançant microcontroladors i sensors de sota cost.',
    enlace: 'https://www.youtube.com/watch?v=b0G25X4lC3U',
    materials: 'Placa microcontrolador ESP32, sensor d\'ultrasons impermeable JSN-SR04T, reductor de voltatge 12V a 5V.',
    prioridad: 'Baixa',
    done: false,
  },
];

const DEFAULT_RECURSOS = [
  {
    id: 'r1',
    nombre: 'The Low Cost Sailor (YouTube)',
    descripcion: 'El canal estrella per a bricolatge nàutic, electrònica, liti, domòtica i millores de sota cost per al vaixell.',
    enlace: 'https://www.youtube.com/@TheLowCostSailor',
    categoria: 'YouTube',
  },
  {
    id: 'r2',
    nombre: 'La Taberna del Puerto (Fòrum)',
    descripcion: 'El fòrum més gran en espanyol sobre nàutica de creuer, manteniment de vaixells, trucs, amarradors i xàrter.',
    enlace: 'https://latabernadelpuerto.com',
    categoria: 'Fòrums i Comunitat',
  },
  {
    id: 'r3',
    nombre: 'Allende los Mares (YouTube)',
    descripcion: 'Vídeos de gran qualitat sobre la vida a bord, travesses oceàniques i apunts molt pràctics de manteniment.',
    enlace: 'https://www.youtube.com/@AllendelosMares',
    categoria: 'YouTube',
  },
  {
    id: 'r4',
    nombre: 'Navegar en Conserva (Blog)',
    descripcion: 'Articles tècnics increïbles sobre maniobra, seguretat, meteorologia i històries de navegació recreativa.',
    enlace: 'https://navegarenconserva.com',
    categoria: 'Blog',
  },
  {
    id: 'r5',
    nombre: 'Windy (Meteo)',
    descripcion: 'La millor eina meteorològica visual per a navegants. Models ECMWF i GFS per a vent, onades i rutes.',
    enlace: 'https://windy.com',
    categoria: 'Eines i Meteo',
  },
];

function loadFromStorage(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function DataProvider({ children }) {
  const [manteniment, setManteniment] = useState([]);
  const [inventari, setInventari] = useState([]);
  const [despensa, setDespensa] = useState([]);
  const [farmaciola, setFarmaciola] = useState([]);
  const [seguretat, setSeguretat] = useState([]);
  const [compras, setCompras] = useState([]);
  const [bitacola, setBitacola] = useState([]);
  const [despeses, setDespeses] = useState([]);
  const [tasques, setTasques] = useState([]);
  const [combustible, setCombustible] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [veles, setVeles] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [projectes, setProjectes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [ajustos, setAjustos] = useState(DEFAULT_AJUSTOS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. Carregar dades locals (instantani offline)
    const localManteniment = loadFromStorage(STORAGE_KEYS.manteniment);
    setManteniment(localManteniment);
    const localInventari = loadFromStorage(STORAGE_KEYS.inventari);
    setInventari(localInventari);
    const localDespensa = loadFromStorage(STORAGE_KEYS.despensa);
    setDespensa(localDespensa);
    const localFarmaciola = loadFromStorage(STORAGE_KEYS.farmaciola);
    setFarmaciola(localFarmaciola);
    const localSeguretat = loadFromStorage(STORAGE_KEYS.seguretat);
    setSeguretat(localSeguretat);
    const localCompras = loadFromStorage(STORAGE_KEYS.compras);
    setCompras(localCompras);
    const localBitacola = loadFromStorage(STORAGE_KEYS.bitacola);
    setBitacola(localBitacola);
    const localDespeses = loadFromStorage(STORAGE_KEYS.despeses);
    setDespeses(localDespeses);
    const localTasques = loadFromStorage(STORAGE_KEYS.tasques);
    setTasques(localTasques);
    const localCombustible = loadFromStorage(STORAGE_KEYS.combustible);
    setCombustible(localCombustible);
    const localDocuments = loadFromStorage(STORAGE_KEYS.documents);
    setDocuments(localDocuments);
    const localVeles = loadFromStorage(STORAGE_KEYS.veles);
    setVeles(localVeles);
    const localAgenda = loadFromStorage(STORAGE_KEYS.agenda);
    setAgenda(localAgenda);
    const localProjectes = loadFromStorage(STORAGE_KEYS.projectes, DEFAULT_PROJECTES);
    setProjectes(localProjectes);
    const localRecursos = loadFromStorage(STORAGE_KEYS.recursos, DEFAULT_RECURSOS);
    setRecursos(localRecursos);
    
    const loadedAjustos = loadFromStorage(STORAGE_KEYS.ajustos, null);
    const localAjustos = loadedAjustos ? { ...DEFAULT_AJUSTOS, ...loadedAjustos } : DEFAULT_AJUSTOS;
    setAjustos(localAjustos);
    
    setLoaded(true);

    // 2. Sincronitzar asíncronament amb Supabase en segon pla
    const syncData = async () => {
      try {
        const fetchTable = async (tableName, storageKey, setCollection, fallback = []) => {
          const { data, error } = await supabase.from(tableName).select('*');
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Hi ha dades a Supabase: les utilitzem i sobreescrivim local per actualitzar
            const parsed = data.map(row => row.data);
            setCollection(parsed);
            saveToStorage(storageKey, parsed);
          } else {
            // Supabase està buida: pugem les dades locals (primera sincronització)
            const localData = loadFromStorage(storageKey, fallback);
            if (localData && localData.length > 0) {
              for (const item of localData) {
                await supabase.from(tableName).upsert({ id: item.id, data: item });
              }
            }
          }
        };

        await fetchTable('manteniment', STORAGE_KEYS.manteniment, setManteniment);
        await fetchTable('inventari', STORAGE_KEYS.inventari, setInventari);
        await fetchTable('despensa', STORAGE_KEYS.despensa, setDespensa);
        await fetchTable('farmaciola', STORAGE_KEYS.farmaciola, setFarmaciola);
        await fetchTable('seguretat', STORAGE_KEYS.seguretat, setSeguretat);
        await fetchTable('compras', STORAGE_KEYS.compras, setCompras);
        await fetchTable('bitacola', STORAGE_KEYS.bitacola, setBitacola);
        await fetchTable('despeses', STORAGE_KEYS.despeses, setDespeses);
        await fetchTable('tasques', STORAGE_KEYS.tasques, setTasques);
        await fetchTable('combustible', STORAGE_KEYS.combustible, setCombustible);
        await fetchTable('documents', STORAGE_KEYS.documents, setDocuments);
        await fetchTable('veles', STORAGE_KEYS.veles, setVeles);
        await fetchTable('agenda', STORAGE_KEYS.agenda, setAgenda);
        await fetchTable('projectes', STORAGE_KEYS.projectes, setProjectes, DEFAULT_PROJECTES);
        await fetchTable('recursos', STORAGE_KEYS.recursos, setRecursos, DEFAULT_RECURSOS);

        // Sincronització de la taula única d'ajustos
        const { data: ajustosData, error: ajustosErr } = await supabase.from('ajustos').select('*').eq('id', 'single_ajustos');
        if (ajustosErr) throw ajustosErr;
        
        if (ajustosData && ajustosData.length > 0) {
          const parsedAjustos = { ...DEFAULT_AJUSTOS, ...ajustosData[0].data };
          setAjustos(parsedAjustos);
          saveToStorage(STORAGE_KEYS.ajustos, parsedAjustos);
        } else {
          const localA = loadFromStorage(STORAGE_KEYS.ajustos, DEFAULT_AJUSTOS);
          await supabase.from('ajustos').upsert({ id: 'single_ajustos', data: localA });
        }
      } catch (err) {
        console.warn('Sincronització de fons no disponible:', err.message);
      }
    };

    syncData();
  }, []);

  // Helpers de sincronització asíncrona client-servidor
  const addItem = useCallback((tableName, collection, setCollection, storageKey) => async (item) => {
    const newItem = { ...item, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) };
    const updated = [newItem, ...collection];
    setCollection(updated);
    saveToStorage(storageKey, updated);
    
    try {
      await supabase.from(tableName).upsert({ id: newItem.id, data: newItem });
    } catch (err) {
      console.error(`Error de sincronització insert a ${tableName}:`, err);
    }
    return newItem;
  }, []);

  const updateItem = useCallback((tableName, collection, setCollection, storageKey) => async (id, updates) => {
    const originalItem = collection.find(item => item.id === id);
    const updatedItem = { ...originalItem, ...updates };
    const updated = collection.map(item => item.id === id ? updatedItem : item);
    setCollection(updated);
    saveToStorage(storageKey, updated);
    
    try {
      await supabase.from(tableName).upsert({ id: id, data: updatedItem });
    } catch (err) {
      console.error(`Error de sincronització update a ${tableName}:`, err);
    }
  }, []);

  const deleteItem = useCallback((tableName, collection, setCollection, storageKey) => async (id) => {
    const updated = collection.filter(item => item.id !== id);
    setCollection(updated);
    saveToStorage(storageKey, updated);
    
    try {
      await supabase.from(tableName).delete().eq('id', id);
    } catch (err) {
      console.error(`Error de sincronització delete a ${tableName}:`, err);
    }
  }, []);

  const saveAjustos = useCallback(async (newAjustos) => {
    setAjustos(newAjustos);
    saveToStorage(STORAGE_KEYS.ajustos, newAjustos);
    
    try {
      await supabase.from('ajustos').upsert({ id: 'single_ajustos', data: newAjustos });
    } catch (err) {
      console.error('Error de sincronització dels ajustos:', err);
    }
  }, []);

  const importData = useCallback(async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      const importTable = async (tableName, storageKey, setCollection, tableData) => {
        if (!tableData) return;
        setCollection(tableData);
        saveToStorage(storageKey, tableData);
        for (const item of tableData) {
          await supabase.from(tableName).upsert({ id: item.id, data: item });
        }
      };

      await importTable('manteniment', STORAGE_KEYS.manteniment, setManteniment, data.manteniment);
      await importTable('inventari', STORAGE_KEYS.inventari, setInventari, data.inventari);
      await importTable('despensa', STORAGE_KEYS.despensa, setDespensa, data.despensa);
      await importTable('farmaciola', STORAGE_KEYS.farmaciola, setFarmaciola, data.farmaciola);
      await importTable('seguretat', STORAGE_KEYS.seguretat, setSeguretat, data.seguretat);
      await importTable('compras', STORAGE_KEYS.compras, setCompras, data.compras);
      await importTable('bitacola', STORAGE_KEYS.bitacola, setBitacola, data.bitacola);
      await importTable('despeses', STORAGE_KEYS.despeses, setDespeses, data.despeses);
      await importTable('tasques', STORAGE_KEYS.tasques, setTasques, data.tasques);
      await importTable('combustible', STORAGE_KEYS.combustible, setCombustible, data.combustible);
      await importTable('documents', STORAGE_KEYS.documents, setDocuments, data.documents);
      await importTable('veles', STORAGE_KEYS.veles, setVeles, data.veles);
      await importTable('agenda', STORAGE_KEYS.agenda, setAgenda, data.agenda);
      await importTable('projectes', STORAGE_KEYS.projectes, setProjectes, data.projectes);
      await importTable('recursos', STORAGE_KEYS.recursos, setRecursos, data.recursos);
      
      if (data.ajustos) {
        setAjustos(data.ajustos);
        saveToStorage(STORAGE_KEYS.ajustos, data.ajustos);
        await supabase.from('ajustos').upsert({ id: 'single_ajustos', data: data.ajustos });
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify({
      manteniment,
      inventari,
      despensa,
      farmaciola,
      seguretat,
      compras,
      bitacola,
      despeses,
      tasques,
      combustible,
      documents,
      veles,
      agenda,
      projectes,
      recursos,
      ajustos,
    }, null, 2);
  }, [manteniment, inventari, despensa, farmaciola, seguretat, compras, bitacola, despeses, tasques, combustible, documents, veles, agenda, projectes, recursos, ajustos]);

  const value = {
    loaded,
    ajustos,
    saveAjustos,
    importData,
    exportData,

    manteniment,
    addManteniment: addItem('manteniment', manteniment, setManteniment, STORAGE_KEYS.manteniment),
    updateManteniment: updateItem('manteniment', manteniment, setManteniment, STORAGE_KEYS.manteniment),
    deleteManteniment: deleteItem('manteniment', manteniment, setManteniment, STORAGE_KEYS.manteniment),

    inventari,
    addInventari: addItem('inventari', inventari, setInventari, STORAGE_KEYS.inventari),
    updateInventari: updateItem('inventari', inventari, setInventari, STORAGE_KEYS.inventari),
    deleteInventari: deleteItem('inventari', inventari, setInventari, STORAGE_KEYS.inventari),

    despensa,
    addDespensa: addItem('despensa', despensa, setDespensa, STORAGE_KEYS.despensa),
    updateDespensa: updateItem('despensa', despensa, setDespensa, STORAGE_KEYS.despensa),
    deleteDespensa: deleteItem('despensa', despensa, setDespensa, STORAGE_KEYS.despensa),

    farmaciola,
    addFarmaciola: addItem('farmaciola', farmaciola, setFarmaciola, STORAGE_KEYS.farmaciola),
    updateFarmaciola: updateItem('farmaciola', farmaciola, setFarmaciola, STORAGE_KEYS.farmaciola),
    deleteFarmaciola: deleteItem('farmaciola', farmaciola, setFarmaciola, STORAGE_KEYS.farmaciola),

    seguretat,
    addSeguretat: addItem('seguretat', seguretat, setSeguretat, STORAGE_KEYS.seguretat),
    updateSeguretat: updateItem('seguretat', seguretat, setSeguretat, STORAGE_KEYS.seguretat),
    deleteSeguretat: deleteItem('seguretat', seguretat, setSeguretat, STORAGE_KEYS.seguretat),

    compras,
    addCompra: addItem('compras', compras, setCompras, STORAGE_KEYS.compras),
    updateCompra: updateItem('compras', compras, setCompras, STORAGE_KEYS.compras),
    deleteCompra: deleteItem('compras', compras, setCompras, STORAGE_KEYS.compras),

    bitacola,
    addBitacola: addItem('bitacola', bitacola, setBitacola, STORAGE_KEYS.bitacola),
    updateBitacola: updateItem('bitacola', bitacola, setBitacola, STORAGE_KEYS.bitacola),
    deleteBitacola: deleteItem('bitacola', bitacola, setBitacola, STORAGE_KEYS.bitacola),

    despeses,
    addDespesa: addItem('despeses', despeses, setDespeses, STORAGE_KEYS.despeses),
    updateDespesa: updateItem('despeses', despeses, setDespeses, STORAGE_KEYS.despeses),
    deleteDespesa: deleteItem('despeses', despeses, setDespeses, STORAGE_KEYS.despeses),

    tasques,
    addTarea: addItem('tasques', tasques, setTasques, STORAGE_KEYS.tasques),
    updateTarea: updateItem('tasques', tasques, setTasques, STORAGE_KEYS.tasques),
    deleteTarea: deleteItem('tasques', tasques, setTasques, STORAGE_KEYS.tasques),

    combustible,
    addCombustible: addItem('combustible', combustible, setCombustible, STORAGE_KEYS.combustible),
    updateCombustible: updateItem('combustible', combustible, setCombustible, STORAGE_KEYS.combustible),
    deleteCombustible: deleteItem('combustible', combustible, setCombustible, STORAGE_KEYS.combustible),

    documents,
    addDocumento: addItem('documents', documents, setDocuments, STORAGE_KEYS.documents),
    updateDocumento: updateItem('documents', documents, setDocuments, STORAGE_KEYS.documents),
    deleteDocumento: deleteItem('documents', documents, setDocuments, STORAGE_KEYS.documents),

    veles,
    addVela: addItem('veles', veles, setVeles, STORAGE_KEYS.veles),
    updateVela: updateItem('veles', veles, setVeles, STORAGE_KEYS.veles),
    deleteVela: deleteItem('veles', veles, setVeles, STORAGE_KEYS.veles),

    agenda,
    addContacto: addItem('agenda', agenda, setAgenda, STORAGE_KEYS.agenda),
    updateContacto: updateItem('agenda', agenda, setAgenda, STORAGE_KEYS.agenda),
    deleteContacto: deleteItem('agenda', agenda, setAgenda, STORAGE_KEYS.agenda),

    projectes,
    addProjecte: addItem('projectes', projectes, setProjectes, STORAGE_KEYS.projectes),
    updateProjecte: updateItem('projectes', projectes, setProjectes, STORAGE_KEYS.projectes),
    deleteProjecte: deleteItem('projectes', projectes, setProjectes, STORAGE_KEYS.projectes),

    recursos,
    addRecurs: addItem('recursos', recursos, setRecursos, STORAGE_KEYS.recursos),
    updateRecurs: updateItem('recursos', recursos, setRecursos, STORAGE_KEYS.recursos),
    deleteRecurs: deleteItem('recursos', recursos, setRecursos, STORAGE_KEYS.recursos),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
