import { supabase } from '@/lib/supabaseClient';

export async function GET(req) {
  // 1. Validació de seguretat del Cron (opcional a local per facilitar les proves)
  const authHeader = req.headers.get('authorization');
  const isDev = process.env.NODE_ENV === 'development';
  const userPassword = req.headers.get('x-user-password');
  
  const isAuthorized = 
    isDev || 
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    userPassword === 'doble2Vi.';
  
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'No autoritzat' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const avui = new Date();
    const límitCaducitat = new Date();
    límitCaducitat.setDate(avui.getDate() + 30); // 30 dies vista

    // 2. Consulta de dades des de Supabase
    const { data: dbManteniment } = await supabase.from('manteniment').select('*');
    const { data: dbDespensa } = await supabase.from('despensa').select('*');
    const { data: dbFarmaciola } = await supabase.from('farmaciola').select('*');
    const { data: dbSeguretat } = await supabase.from('seguretat').select('*');
    const { data: dbInventari } = await supabase.from('inventari').select('*');

    const manteniments = dbManteniment ? dbManteniment.map(row => row.data) : [];
    const despensa = dbDespensa ? dbDespensa.map(row => row.data) : [];
    const farmaciola = dbFarmaciola ? dbFarmaciola.map(row => row.data) : [];
    const seguretat = dbSeguretat ? dbSeguretat.map(row => row.data) : [];
    const inventari = dbInventari ? dbInventari.map(row => row.data) : [];

    // 3. Filtrar elements caducats o propers a caducar (< 30 dies)
    const comprovaCaducitat = (item, dataCamp = 'caducidad') => {
      const dataStr = item[dataCamp];
      if (!dataStr) return null;
      const data = new Date(dataStr);
      const diffDays = Math.ceil((data - avui) / (1000 * 60 * 60 * 24));
      return { item, diffDays, dataStr };
    };

    const caducitatsSeguretat = seguretat
      .map(item => comprovaCaducitat(item, 'caducidad'))
      .filter(res => res !== null && res.diffDays <= 30);

    const caducitatsFarmaciola = farmaciola
      .map(item => comprovaCaducitat(item, 'caducidad'))
      .filter(res => res !== null && res.diffDays <= 30);

    const caducitatsDespensa = despensa
      .map(item => comprovaCaducitat(item, 'caducidad'))
      .filter(res => res !== null && res.diffDays <= 30);

    // 4. Filtrar revisions de manteniment properes o vençudes (< 30 dies)
    const mantenimentsPropers = manteniments
      .map(item => comprovaCaducitat(item, 'proximaRevision'))
      .filter(res => res !== null && res.diffDays <= 30);

    // 5. Filtrar peces de l'inventari sota mínims
    const lowStockInventari = inventari.filter(i => {
      return i.alertaMinima && parseInt(i.stock) <= parseInt(i.alertaMinima);
    });

    // Si no hi ha cap alerta, podem estalviar correus o enviar un missatge simple
    const teAlertes = 
      caducitatsSeguretat.length > 0 || 
      caducitatsFarmaciola.length > 0 || 
      caducitatsDespensa.length > 0 || 
      mantenimentsPropers.length > 0 ||
      lowStockInventari.length > 0;

    // 5. Construir cos del missatge HTML
    let htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A1628; color: #F3F4F6; border-radius: 12px; border: 1px solid #1E3050;">
        <div style="text-align: center; border-bottom: 2px solid #1E3050; padding-bottom: 20px; margin-bottom: 24px;">
          <span style="font-size: 40px;">⛵</span>
          <h1 style="color: #4FC3F7; margin: 10px 0 5px 0; font-size: 24px;">Control Setmanal: S/Y Afra II</h1>
          <p style="color: #8A9BB0; margin: 0; font-size: 14px;">Resum generat automàticament el ${avui.toLocaleDateString('ca-ES')}</p>
        </div>
      `;

    if (!teAlertes) {
      htmlContent += `
        <div style="text-align: center; padding: 30px 20px; background-color: #111D33; border-radius: 8px; border: 1px solid #1E3050;">
          <span style="font-size: 32px;">✅</span>
          <h3 style="color: #4ADE80; margin: 10px 0;">No hi ha cap alerta a bord</h3>
          <p style="color: #8A9BB0; font-size: 14px; margin: 0;">No s'ha detectat cap medicament, provisió del rebost o equip de seguretat caducat (o a punt de caducar d'aquí a 30 dies), ni tampoc revisions de manteniment properes o recanvis sota mínims.</p>
        </div>
      `;
    } else {
      const renderTaula = (titol, icona, llistat, campNom = 'nombre', tipus = 'caducitat') => {
        if (llistat.length === 0) return '';
        let rows = '';
        llistat.forEach(alerta => {
          if (tipus === 'inventari') {
            const ubicacio = alerta.item.ubicacionGeneral || 'Sense assignar';
            const color = '#FB923C'; // Orange
            const estat = `Stock: ${alerta.item.stock} / Mínim: ${alerta.item.alertaMinima}`;
            rows += `
              <tr style="border-bottom: 1px solid #1E3050;">
                <td style="padding: 10px 8px; font-weight: 500;">${alerta.item[campNom]}</td>
                <td style="padding: 10px 8px; text-align: center; color: #8A9BB0; font-size: 13px;">${ubicacio}</td>
                <td style="padding: 10px 8px; text-align: right; color: ${color}; font-weight: bold; font-size: 13px;">${estat}</td>
              </tr>
            `;
          } else {
            const color = alerta.diffDays < 0 ? '#F87171' : (alerta.diffDays <= 7 ? '#FB923C' : '#F3F4F6');
            const estat = alerta.diffDays < 0 
              ? `Caducat fa ${Math.abs(alerta.diffDays)} dies` 
              : (alerta.diffDays === 0 ? 'Caduca avui!' : `Caduca en ${alerta.diffDays} dies`);
            
            const formatData = new Date(alerta.dataStr).toLocaleDateString('ca-ES');
            
            rows += `
              <tr style="border-bottom: 1px solid #1E3050;">
                <td style="padding: 10px 8px; font-weight: 500;">${alerta.item[campNom]}</td>
                <td style="padding: 10px 8px; text-align: center;">${formatData}</td>
                <td style="padding: 10px 8px; text-align: right; color: ${color}; font-weight: bold; font-size: 12px;">${estat}</td>
              </tr>
            `;
          }
        });

        const headerCol2 = tipus === 'inventari' ? 'Ubicació' : 'Data Límit';
        const headerCol3 = tipus === 'inventari' ? 'Estat Stock' : 'Estat';

        return `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #4FC3F7; border-bottom: 1px solid #1E3050; padding-bottom: 6px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>${icona}</span> ${titol}
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="color: #8A9BB0; text-align: left; font-size: 12px; border-bottom: 1px solid #1E3050;">
                  <th style="padding: 6px 8px;">Element / Feina</th>
                  <th style="padding: 6px 8px; text-align: center;">${headerCol2}</th>
                  <th style="padding: 6px 8px; text-align: right;">${headerCol3}</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `;
      };

      htmlContent += renderTaula('Seguretat i Emergències', '🚨', caducitatsSeguretat, 'nombre');
      htmlContent += renderTaula('Farmaciola i Salut', '💊', caducitatsFarmaciola, 'nombre');
      htmlContent += renderTaula('Rebost i Provisions', '🥫', caducitatsDespensa, 'nombre');
      htmlContent += renderTaula('Manteniments i Revisions', '🔧', mantenimentsPropers, 'titulo', 'manteniment');
      htmlContent += renderTaula('Recanvis sota Mínims', '📦', lowStockInventari.map(i => ({ item: i })), 'nombre', 'inventari');
    }

    htmlContent += `
        <div style="text-align: center; border-top: 1px solid #1E3050; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #5A6E85;">
          <p style="margin: 0;">S/Y Afra II ERP — Creat amb ❤️ per al teu vaixell.</p>
          <p style="margin: 5px 0 0 0;"><a href="http://localhost:3000" style="color: #4FC3F7; text-decoration: none;">Obrir ERP en local</a></p>
        </div>
      </div>
    `;

    // 6. Enviar a través de l'API de Brevo
    const brevoKey = process.env.BREVO_API_KEY;
    const destí = process.env.NOTIFICATION_EMAIL_TO;

    if (!brevoKey || !destí) {
      console.warn('Falta BREVO_API_KEY o NOTIFICATION_EMAIL_TO. Enviament de correu saltat.');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Cron executat correctament (mode simulat sense correu, falten credencials)',
        alertes: {
          seguretat: caducitatsSeguretat.length,
          farmaciola: caducitatsFarmaciola.length,
          rebost: caducitatsDespensa.length,
          manteniment: mantenimentsPropers.length,
          inventari: lowStockInventari.length
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const subject = teAlertes 
      ? `📋 Avisos de Control: S/Y Afra II (${avui.toLocaleDateString('ca-ES')})`
      : `✅ S/Y Afra II: No hi ha cap alerta (${avui.toLocaleDateString('ca-ES')})`;

    const resSend = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'S/Y Afra II', email: destí },
        to: [{ email: destí, name: 'David Gallardo' }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!resSend.ok) {
      const errorText = await resSend.text();
      throw new Error(`Brevo API error: ${errorText}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Recordatori de correu setmanal enviat correctament!' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error al Cron de recordatoris:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
