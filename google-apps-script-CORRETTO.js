// GOOGLE APPS SCRIPT - VERSIONE CORRETTA CON MAPPING COLONNE GIUSTO
// Questa versione gestisce due fogli separati per MUD e Ordinari
// VERSIONE CORRETTA: Mapping colonne allineato con la struttura reale del Google Sheet
//
// 🔄 MODIFICHE PRINCIPALI:
// ✅ Due fogli separati: "MUD" e "Ordinari"
// ✅ CORRETTI mapping colonne per MUD (11 colonne) e Ordinari (9 colonne)
// ✅ Invio dati prima, firma cliente dopo
// ✅ Numerazione sequenziale per utente
// ✅ Creazione cartelle Drive organizzate
//
// ⚠️ SETUP RICHIESTO:
// 1. Crea un Google Sheet chiamato "Registro interventi"
// 2. Crea due fogli: "MUD" e "Ordinari"
// 3. Modifica CONFIG.SHEET_ID con il tuo Google Sheet ID

// 🔧 CONFIGURAZIONE PRINCIPALE - MODIFICA QUESTI VALORI
const CONFIG = {
  SHEET_ID: '1Vs4w2-EcEfhu19--C3lCvf8Pq2YruIr2yA99LKyNYXc', // ✅ CONFIGURATO

  // Nomi dei fogli
  SHEET_NAMES: {
    MUD: 'MUD',
    ORDINARI: 'Ordinari'
  },

  // Mappatura colonne per MUD (11 colonne totali)
  COLUMNS_MUD: {
    TIMESTAMP: 1,        // A - Timestamp
    UTENTE: 2,          // B - Utente
    MUD: 3,             // C - MUD
    RIFERIMENTO: 4,     // D - Riferimento
    LUOGO: 5,           // E - Luogo
    DATA_INIZIO: 6,     // F - Data inizio
    DATA_FINE: 7,       // G - Data fine
    DESCRIZIONE: 8,     // H - Descrizione
    MATERIALI: 9,       // I - Materiali
    FIRMA_COMMITTENTE: 10, // J - Firma Committente
    BUONO_LAVORO: 11    // K - Buono di lavoro
  },

  // Mappatura colonne per Ordinari (9 colonne totali)
  COLUMNS_ORDINARI: {
    TIMESTAMP: 1,        // A - Timestamp
    UTENTE: 2,          // B - Utente
    LUOGO: 3,           // C - Luogo
    DATA_INIZIO: 4,     // D - Data inizio
    DATA_FINE: 5,       // E - Data fine
    DESCRIZIONE: 6,     // F - Descrizione
    MATERIALI: 7,       // G - Materiali
    FIRMA_COMMITTENTE: 8, // H - Firma Committente
    BUONO_LAVORO: 9     // I - Buono di lavoro
  },

  // 🎯 SISTEMA BUONI LAVORO: Mappatura utenti -> codice lettera
  USER_CODE_MAPPING: {
    'admin': 'A',
    'tecnico1': 'T',
    'tecnico2': 'U',
    'valentino': 'V',
    'marco': 'M',
    'giuseppe': 'G',
    'francesco': 'F',
    'antonio': 'N'
    // Aggiungi altri utenti secondo necessità
  }
};

// 🛠️ FUNZIONE DI CONFIGURAZIONE: Imposta il nuovo Google Sheet con due fogli
function configuraGoogleSheetDueFogli(nuovoSheetId) {
  console.log('=== 🛠️ CONFIGURAZIONE GOOGLE SHEET DUE FOGLI ===');
  console.log('📊 Nuovo Sheet ID:', nuovoSheetId);

  try {
    // Test di accesso al sheet
    const ss = SpreadsheetApp.openById(nuovoSheetId);
    console.log('✅ Sheet accessibile:', ss.getName());

    // Verifica/Crea foglio MUD
    let mudSheet;
    try {
      mudSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MUD);
      console.log('✅ Foglio MUD già esistente');
    } catch (e) {
      mudSheet = ss.insertSheet(CONFIG.SHEET_NAMES.MUD);
      console.log('📄 Foglio MUD creato');
    }

    // Verifica/Crea foglio Ordinari
    let ordinariSheet;
    try {
      ordinariSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDINARI);
      console.log('✅ Foglio Ordinari già esistente');
    } catch (e) {
      ordinariSheet = ss.insertSheet(CONFIG.SHEET_NAMES.ORDINARI);
      console.log('📄 Foglio Ordinari creato');
    }

    // Intestazioni per foglio MUD (11 colonne)
    const headerRowMUD = [
      'Timestamp',
      'Utente', 
      'MUD',
      'Riferimento',
      'Luogo',
      'Data inizio',
      'Data fine',
      'Descrizione',
      'Materiali',
      'Firma Committente',
      'Buono di lavoro'
    ];

    // Intestazioni per foglio Ordinari (9 colonne)
    const headerRowOrdinari = [
      'Timestamp',
      'Utente',
      'Luogo',
      'Data inizio',
      'Data fine',
      'Descrizione',
      'Materiali',
      'Firma Committente',
      'Buono di lavoro'
    ];

    // Imposta intestazioni MUD se il foglio è vuoto
    if (mudSheet.getDataRange().getNumRows() === 0) {
      mudSheet.getRange(1, 1, 1, headerRowMUD.length).setValues([headerRowMUD]);
      console.log('🏷️ Intestazioni MUD impostate');
    }

    // Imposta intestazioni Ordinari se il foglio è vuoto
    if (ordinariSheet.getDataRange().getNumRows() === 0) {
      ordinariSheet.getRange(1, 1, 1, headerRowOrdinari.length).setValues([headerRowOrdinari]);
      console.log('🏷️ Intestazioni Ordinari impostate');
    }

    return {
      status: 'success',
      message: 'Google Sheet configurato con successo con due fogli',
      mudSheet: CONFIG.SHEET_NAMES.MUD,
      ordinariSheet: CONFIG.SHEET_NAMES.ORDINARI,
      sheetId: nuovoSheetId
    };

  } catch (error) {
    console.error('❌ Errore configurazione:', error);
    return {
      status: 'error',
      message: 'Impossibile accedere al Google Sheet. Verifica ID e permessi.'
    };
  }
}

// 🎯 FUNZIONE SISTEMA BUONO LAVORO: Genera codice automatico GLOBALE
function generaBuonoLavoro(username, currentSheet) {
  try {
    console.log('🎫 Generazione Buono Lavoro GLOBALE per utente:', username);

    // Ottieni la lettera associata all'utente
    let userLetter = CONFIG.USER_CODE_MAPPING[username.toLowerCase()];
    if (!userLetter) {
      console.warn('⚠️ Utente non trovato nel mapping, uso "X" di default:', username);
      userLetter = 'X';
    }

    console.log('🔤 Lettera utente:', userLetter);

    // 🌍 RICERCA GLOBALE: Cerca il numero massimo in ENTRAMBI i fogli
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let maxNumber = 0;

    // Controlla foglio MUD
    try {
      const mudSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MUD);
      const mudData = mudSheet.getDataRange().getValues();
      
      for (let i = 1; i < mudData.length; i++) { // Skip header
        const buonoLavoro = mudData[i][CONFIG.COLUMNS_MUD.BUONO_LAVORO - 1]; // Colonna Buono Lavoro MUD
        
        if (buonoLavoro && typeof buonoLavoro === 'string' && buonoLavoro.startsWith(userLetter)) {
          const numberPart = buonoLavoro.substring(1);
          const number = parseInt(numberPart, 10);
          
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
            console.log('📋 MUD - Trovato numero maggiore:', number, 'in', buonoLavoro);
          }
        }
      }
    } catch (mudError) {
      console.warn('⚠️ Errore accesso foglio MUD per ricerca globale:', mudError);
    }

    // Controlla foglio Ordinari
    try {
      const ordinariSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDINARI);
      const ordinariData = ordinariSheet.getDataRange().getValues();
      
      for (let i = 1; i < ordinariData.length; i++) { // Skip header
        const buonoLavoro = ordinariData[i][CONFIG.COLUMNS_ORDINARI.BUONO_LAVORO - 1]; // Colonna Buono Lavoro Ordinari
        
        if (buonoLavoro && typeof buonoLavoro === 'string' && buonoLavoro.startsWith(userLetter)) {
          const numberPart = buonoLavoro.substring(1);
          const number = parseInt(numberPart, 10);
          
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
            console.log('📄 ORDINARI - Trovato numero maggiore:', number, 'in', buonoLavoro);
          }
        }
      }
    } catch (ordinariError) {
      console.warn('⚠️ Errore accesso foglio Ordinari per ricerca globale:', ordinariError);
    }

    // Il prossimo numero sarà maxNumber + 1
    const nextNumber = maxNumber + 1;
    
    // Formatta con 4 cifre (padding con zeri)
    const formattedNumber = nextNumber.toString().padStart(4, '0');

    // Crea il codice finale
    const buonoLavoro = userLetter + formattedNumber;

    console.log('✅ Buono Lavoro GLOBALE generato:', buonoLavoro);
    console.log('📊 Dettagli GLOBALI:');
    console.log('  - Numero massimo trovato in MUD+Ordinari:', maxNumber);
    console.log('  - Prossimo numero sequenziale:', nextNumber);
    console.log('  - Foglio corrente:', currentSheet.getName());

    return buonoLavoro;

  } catch (error) {
    console.error('❌ Errore generazione buono lavoro globale:', error);
    // Fallback: genera codice casuale
    const fallbackCode = 'X' + Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    console.log('🔄 Uso codice fallback:', fallbackCode);
    return fallbackCode;
  }
}

// 📋 FUNZIONE PRINCIPALE: Processa le richieste GET
function doGet(e) {
  console.log('📨 Richiesta GET ricevuta');
  console.log('🔍 Parametri:', JSON.stringify(e.parameter));

  const callback = e.parameter.callback || e.parameter.jsonp;
  let response;

  try {
    const action = e.parameter.action;

    // ✅ VERIFICA CONFIGURAZIONE SHEET PRIMA DI OGNI OPERAZIONE
    if (!CONFIG.SHEET_ID || CONFIG.SHEET_ID === 'undefined') {
      console.error('❌ SHEET_ID non configurato correttamente:', CONFIG.SHEET_ID);
      response = {
        status: 'error',
        message: 'Google Sheet ID non configurato. Verifica CONFIG.SHEET_ID nel codice.'
      };
    } else if (action === 'config') {
      // Setup iniziale del Google Sheet
      const nuovoSheetId = e.parameter.sheetId;
      if (nuovoSheetId) {
        response = configuraGoogleSheetDueFogli(nuovoSheetId);
      } else {
        response = {
          status: 'error',
          message: 'Parametro sheetId mancante per la configurazione'
        };
      }
    } else if (action === 'save') {
      // FASE 1: Salva dati principali SENZA firme
      console.log('💾 Azione SAVE - Sheet ID configurato:', CONFIG.SHEET_ID);
      response = saveDataToCorrectSheet(e.parameter);
    } else if (action === 'upload-client-signature') {
      // FASE 2: Upload solo firma cliente
      console.log('🖊️ Azione UPLOAD - Sheet ID configurato:', CONFIG.SHEET_ID);
      response = uploadClientSignature(e.parameter);
    } else if (action === 'ping') {
      // Test di connettività semplice
      response = {
        status: 'success',
        message: 'Server attivo',
        timestamp: new Date().toISOString(),
        config: {
          sheetId: CONFIG.SHEET_ID,
          sheets: [CONFIG.SHEET_NAMES.MUD, CONFIG.SHEET_NAMES.ORDINARI]
        }
      };
    } else {
      response = {
        status: 'error',
        message: 'Azione non riconosciuta: ' + action
      };
    }

  } catch (error) {
    console.error('❌ Errore globale doGet:', error);
    response = {
      status: 'error',
      message: 'Errore interno del server: ' + error.toString()
    };
  }

  // Risposta JSONP
  const jsonResponse = JSON.stringify(response);
  const output = callback ? `${callback}(${jsonResponse});` : jsonResponse;
  
  console.log('📤 Risposta inviata:', output.substring(0, 200) + '...');
  
  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// 💾 FUNZIONE SALVATAGGIO DATI: Salva nel foglio corretto
function saveDataToCorrectSheet(params) {
  try {
    console.log('💾 FASE 1: Salvataggio dati principali...');

    const data = JSON.parse(decodeURIComponent(params.data || '{}'));
    console.log('📊 Dati ricevuti:', JSON.stringify(data, null, 2));

    // ========== ROUTING LOGIC - DEBUG DETTAGLIATO ==========
    console.log('🔍 === INIZIO ANALISI ROUTING ===');
    console.log('📋 data.tipoIntervento ricevuto:', data.tipoIntervento, '(tipo:', typeof data.tipoIntervento, ')');
    console.log('🏷️ data.mud ricevuto:', data.mud, '(tipo:', typeof data.mud, ')');
    
    // Determina il tipo di intervento e il foglio di destinazione
    // LOGICA PRIORITARIA: 1) tipoIntervento, 2) pattern MUD
    let isMUD = false;
    let routingReason = '';
    
    if (data.tipoIntervento === 'mud') {
      isMUD = true;
      routingReason = 'tipoIntervento === "mud"';
    } else if (data.tipoIntervento === 'ordinario') {
      isMUD = false;
      routingReason = 'tipoIntervento === "ordinario"';
    } else {
      // Fallback: analizza il valore MUD
      if (data.mud && typeof data.mud === 'string') {
        if (data.mud.startsWith('ORD-')) {
          isMUD = false;
          routingReason = 'MUD inizia con "ORD-" -> Ordinario';
        } else if (data.mud.startsWith('MUD-') || data.mud.includes('MUD')) {
          isMUD = true;
          routingReason = 'MUD contiene pattern MUD -> MUD';
        } else {
          // Default: se non è chiaro, considera MUD
          isMUD = true;
          routingReason = 'FALLBACK: valore ambiguo -> MUD (default)';
        }
      } else {
        isMUD = true;
        routingReason = 'FALLBACK: nessun dato chiaro -> MUD (default)';
      }
    }
    
    const sheetName = isMUD ? CONFIG.SHEET_NAMES.MUD : CONFIG.SHEET_NAMES.ORDINARI;
    const columns = isMUD ? CONFIG.COLUMNS_MUD : CONFIG.COLUMNS_ORDINARI;

    console.log('🎯 ROUTING DECISION:');
    console.log('  ✅ isMUD determinato:', isMUD);
    console.log('  📋 Motivo:', routingReason);
    console.log('  📄 Foglio destinazione:', sheetName);
    console.log('  🗃️ Colonne da usare:', Object.keys(columns).length, 'colonne');
    console.log('🔍 === FINE ANALISI ROUTING ===');

    // Apri il Google Sheet
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error('Foglio "' + sheetName + '" non trovato. Esegui prima la configurazione.');
    }
    
    console.log('✅ Foglio aperto:', sheet.getName());

    // CONTROLLO DUPLICATI: Sistema migliorato per identificazione univoca
    const identificativo = data.mud || data.riferimento || (data.luogo + '_' + data.dataInizio + '_' + new Date().getTime());
    const existingData = sheet.getDataRange().getValues();
    let existingRowIndex = -1;

    console.log('🔍 Ricerca record esistente per:', identificativo);
    console.log('📊 Dati ricerca - Utente:', data.user, ', Luogo:', data.luogo, ', Data:', data.dataInizio);

    for (let i = 1; i < existingData.length; i++) { // Skip header
      const existingUtente = existingData[i][columns.UTENTE - 1];
      const existingLuogo = existingData[i][columns.LUOGO - 1]; 
      const existingDataInizio = existingData[i][columns.DATA_INIZIO - 1];
      
      // Confronto preciso: stesso utente, stesso luogo, stessa data inizio
      if (existingUtente === data.user && 
          existingLuogo === data.luogo && 
          existingDataInizio === data.dataInizio) {
        
        // Per MUD, verifica anche il campo MUD se presente
        if (isMUD && data.mud && columns.MUD) {
          const existingMud = existingData[i][columns.MUD - 1];
          if (existingMud && existingMud === data.mud) {
            existingRowIndex = i;
            console.log('🔄 Record MUD esistente trovato alla riga:', i + 1);
            break;
          }
        } else {
          existingRowIndex = i;
          console.log('🔄 Record Ordinario esistente trovato alla riga:', i + 1);
          break;
        }
      }
    }

    // Prepara i dati SENZA la firma (verrà aggiunta dopo)
    const timestamp = new Date();

    // 🎫 GENERA BUONO LAVORO AUTOMATICO
    let buonoLavoro;
    if (existingRowIndex !== -1) {
      // Record esistente - mantieni buono lavoro se presente
      buonoLavoro = existingData[existingRowIndex][columns.BUONO_LAVORO - 1];
      if (!buonoLavoro || buonoLavoro === 'N/A') {
        buonoLavoro = generaBuonoLavoro(data.user, sheet);
      }
      console.log('🔄 Aggiornamento record esistente, buono lavoro:', buonoLavoro);
    } else {
      // Nuovo record
      buonoLavoro = generaBuonoLavoro(data.user, sheet);
      console.log('🎫 Nuovo buono lavoro generato:', buonoLavoro);
    }

    // Crea array con tutti i valori per la riga
    const totalColumns = Object.keys(columns).length;
    const rowData = new Array(totalColumns).fill('N/A');

    // Popola i dati usando la mappatura colonne CORRETTA
    rowData[columns.TIMESTAMP - 1] = timestamp.toLocaleString('it-IT');
    rowData[columns.UTENTE - 1] = data.user || 'N/A';
    
    // Per MUD, aggiungi i campi MUD e Riferimento
    if (isMUD) {
      rowData[columns.MUD - 1] = data.mud || 'N/A';
      rowData[columns.RIFERIMENTO - 1] = data.riferimento || 'N/A';
    }
    
    rowData[columns.LUOGO - 1] = data.luogo || 'N/A';
    rowData[columns.DATA_INIZIO - 1] = data.dataInizio || 'N/A';
    rowData[columns.DATA_FINE - 1] = data.dataFine || 'N/A';
    rowData[columns.DESCRIZIONE - 1] = data.descrizione || 'N/A';
    rowData[columns.MATERIALI - 1] = data.materiali || 'N/A';
    rowData[columns.FIRMA_COMMITTENTE - 1] = 'FIRMA_IN_ATTESA';
    rowData[columns.BUONO_LAVORO - 1] = buonoLavoro;

    // Inserisci o aggiorna i dati
    if (existingRowIndex !== -1) {
      // Aggiorna record esistente
      const existingRow = existingRowIndex + 1;
      for (let col = 1; col <= totalColumns; col++) {
        if (col !== columns.FIRMA_COMMITTENTE) { // Non sovrascrivere firma se già presente
          sheet.getRange(existingRow, col).setValue(rowData[col - 1]);
        }
      }
      console.log('🔄 Record esistente aggiornato alla riga:', existingRow);
    } else {
      // Inserisci nuovo record in ordine cronologico (dopo l'ultimo record con dati)
      const lastRowWithData = sheet.getLastRow();
      const insertRow = Math.max(2, lastRowWithData + 1); // Minimo riga 2, massimo dopo l'ultimo record
      
      console.log('🔍 Ultima riga con dati:', lastRowWithData);
      console.log('📍 Inserimento nuovo record alla riga:', insertRow);
      
      // Inserisci i dati alla riga specifica
      sheet.getRange(insertRow, 1, 1, totalColumns).setValues([rowData]);
      
      console.log('➕ Nuovo record inserito alla riga:', insertRow, '(ordine cronologico)');
    }

    return {
      status: 'success',
      message: 'Dati salvati con successo nel foglio ' + sheetName,
      timestamp: timestamp.toISOString(),
      phase: 'DATA_SAVED',
      sheetType: isMUD ? 'MUD' : 'Ordinari',
      sheetName: sheetName,
      buonoLavoro: buonoLavoro,
      identificativo: identificativo,
      row: existingRowIndex !== -1 ? existingRowIndex + 1 : 'nuovo'
    };

  } catch (error) {
    console.error('❌ Errore salvataggio dati:', error);
    return {
      status: 'error',
      message: 'Errore salvataggio dati: ' + error.toString()
    };
  }
}

// 🖊️ FUNZIONE UPLOAD FIRMA CLIENTE: Carica solo firma cliente
function uploadClientSignature(params) {
  try {
    console.log('🖊️ FASE 2: Upload firma cliente...');

    const data = JSON.parse(decodeURIComponent(params.data || '{}'));
    const { identificativo, tipoIntervento, mudValue, signatureBase64 } = data;

    if (!identificativo || !signatureBase64) {
      return {
        status: 'error',
        message: 'Parametri mancanti per upload firma cliente: ' + JSON.stringify(data)
      };
    }

    console.log('📤 Upload firma cliente per identificativo:', identificativo);
    console.log('📊 Tipo intervento:', tipoIntervento);
    console.log('🏷️ Valore MUD ricevuto:', mudValue);
    console.log('📐 Dimensione firma Base64:', signatureBase64.length, 'caratteri');
    
    // DEBUG: Verifica che i dati siano validi
    if (signatureBase64.length < 100) {
      console.warn('⚠️ ATTENZIONE: Firma Base64 sembra troppo piccola:', signatureBase64.substring(0, 50));
    }
    
    if (!signatureBase64.startsWith('data:image/')) {
      console.warn('⚠️ ATTENZIONE: Firma Base64 non ha il prefisso corretto:', signatureBase64.substring(0, 50));
    }

    // Determina il foglio corretto
    // CORREZIONE: Usa anche mudValue per determinare il tipo se tipoIntervento non è affidabile
    let isMUD = tipoIntervento === 'mud';
    
    // Se tipoIntervento non è definito, usa mudValue per determinare
    if (!tipoIntervento && mudValue) {
      isMUD = !mudValue.startsWith('ORD-');
      console.log('🔍 Tipo firma determinato dal mudValue:', mudValue, '-> isMUD:', isMUD);
    }
    
    const sheetName = isMUD ? CONFIG.SHEET_NAMES.MUD : CONFIG.SHEET_NAMES.ORDINARI;
    const columns = isMUD ? CONFIG.COLUMNS_MUD : CONFIG.COLUMNS_ORDINARI;

    // Aggiorna il Google Sheets per ottenere il buono lavoro
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error('Foglio ' + sheetName + ' non trovato');
    }

    // Trova la riga da aggiornare e ottieni il buono lavoro
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    let buonoLavoro = null;
    let localMudValue = null;

    for (let i = 1; i < values.length; i++) { // Skip header
      const existingUtente = values[i][columns.UTENTE - 1];
      const existingLuogo = values[i][columns.LUOGO - 1];
      const existingDataInizio = values[i][columns.DATA_INIZIO - 1];
      
      // Usa l'identificativo completo per una ricerca più precisa
      const existingKey = `${existingUtente}_${existingLuogo}_${existingDataInizio}`;
      const searchPattern = identificativo.split('_').slice(0, 3).join('_');
      
      if (existingKey === searchPattern || 
          (existingLuogo && identificativo.includes(existingLuogo) && 
           existingDataInizio && identificativo.includes(existingDataInizio))) {
        console.log('📝 Trovata riga', i + 1, 'per aggiornamento firma cliente');
        console.log('🔍 Match: esistente =', existingKey, ', cercato =', searchPattern);

        // Ottieni il buono lavoro dalla riga
        buonoLavoro = values[i][columns.BUONO_LAVORO - 1];

        // Per MUD, usa il valore ricevuto dall'app
        if (isMUD) {
          localMudValue = mudValue || identificativo; // Usa il MUD dall'app o fallback
        }

        console.log('🎫 Buono lavoro trovato per upload:', buonoLavoro);
        console.log('📋 Valore MUD (se applicabile):', localMudValue);

        // Carica la firma su Google Drive con i parametri corretti
        const driveUrl = uploadImageToDrive(
          signatureBase64,
          'firma_cliente',
          identificativo,
          tipoIntervento,
          buonoLavoro
        );
        console.log('✅ Firma cliente caricata su Drive:', driveUrl);

        // Aggiorna la cella della firma cliente nel foglio
        sheet.getRange(i + 1, columns.FIRMA_COMMITTENTE).setValue(driveUrl);

        return {
          status: 'success',
          message: 'Firma cliente caricata con successo nel foglio ' + sheetName + ' e Drive',
          driveUrl: driveUrl,
          sheetType: isMUD ? 'MUD' : 'Ordinari',
          sheetName: sheetName,
          identificativo: identificativo,
          buonoLavoro: buonoLavoro,
          driveFolder: isMUD ? (localMudValue || buonoLavoro) : buonoLavoro,
          rowUpdated: i + 1
        };
      }
    }

    return {
      status: 'error',
      message: 'Record non trovato per aggiornamento firma cliente'
    };

  } catch (error) {
    console.error('❌ Errore upload firma cliente:', error);
    return {
      status: 'error',
      message: 'Errore upload firma cliente: ' + error.toString()
    };
  }
}

// 📤 FUNZIONE UPLOAD GOOGLE DRIVE: Carica immagine nella cartella specifica
function uploadImageToDrive(base64Data, fileName, identificativo, tipoIntervento, buonoLavoro) {
  try {
    console.log('📤 Upload su Google Drive nella cartella specifica');
    console.log('📄 File Name:', fileName);
    console.log('🔍 Identificativo:', identificativo);
    console.log('📋 Tipo intervento:', tipoIntervento);
    console.log('🎫 Buono lavoro:', buonoLavoro);

    // Rimuovi il prefisso data:image/...;base64, se presente
    const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    // Determina il tipo di immagine dal prefisso
    let mimeType = 'image/png'; // Default
    if (base64Data.includes('jpeg') || base64Data.includes('jpg')) {
      mimeType = 'image/jpeg';
    }

    console.log('🎨 Tipo MIME determinato:', mimeType);

    // Converti Base64 in Blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      mimeType,
      fileName + '.png'
    );

    console.log('📦 Blob creato, dimensione:', blob.getBytes().length, 'bytes');

    // STEP 1: Trova o crea la cartella principale "Firme rapporti"
    let mainFolder;
    try {
      // ID della cartella: 13vI7aODCn6CT4soLk73Ki5FxRptttS74
      mainFolder = DriveApp.getFolderById('13vI7aODCn6CT4soLk73Ki5FxRptttS74');
      console.log('📁 Cartella "Firme rapporti" trovata tramite ID:', mainFolder.getName());
      console.log('🔐 Permessi cartella principale verificati: OK');
    } catch (folderError) {
      console.error('❌ ERRORE CRITICO: Impossibile accedere alla cartella Drive:', folderError);
      console.log('📋 ID cartella usato: 13vI7aODCn6CT4soLk73Ki5FxRptttS74');
      console.warn('⚠️ Errore accesso cartella specifica, uso fallback:', folderError);
      // Fallback: cerca per nome
      try {
        const mainFolders = DriveApp.getFoldersByName('Firme rapporti');
        if (mainFolders.hasNext()) {
          mainFolder = mainFolders.next();
          console.log('📁 Cartella "Firme rapporti" trovata per nome');
        } else {
          mainFolder = DriveApp.createFolder('Firme rapporti');
          console.log('📁 Cartella "Firme rapporti" creata');
        }
      } catch (fallbackError) {
        console.error('❌ Errore anche nel fallback, uso root:', fallbackError);
        mainFolder = DriveApp.getRootFolder();
      }
    }

    // STEP 2: Determina il nome della sottocartella
    // Per MUD: usa il valore MUD (se disponibile nel parametro identificativo)
    // Per Ordinari: usa il Buono di Lavoro
    let subFolderName;
    if (tipoIntervento === 'mud') {
      // Prova a estrarre il MUD dall'identificativo o usa il buono lavoro
      if (identificativo && identificativo.includes('MUD-')) {
        // Se l'identificativo contiene un pattern MUD, estrailo
        const mudMatch = identificativo.match(/MUD-[A-Za-z0-9-]+/);
        subFolderName = mudMatch ? mudMatch[0] : buonoLavoro;
      } else {
        // Fallback al buono lavoro per MUD
        subFolderName = buonoLavoro;
      }
      console.log('🏷️ MUD - Nome cartella determinato:', subFolderName);
    } else {
      // Per Ordinari usa sempre il Buono di Lavoro
      subFolderName = buonoLavoro;
      console.log('📋 Ordinario - Nome cartella (Buono Lavoro):', subFolderName);
    }

    // Pulisci il nome della cartella da caratteri non validi
    const CARTELLA_NOME = subFolderName.replace(/[^a-zA-Z0-9-_]/g, '_');
    console.log('📂 Nome sottocartella determinato:', CARTELLA_NOME);
    console.log('🎯 Logica usata:', tipoIntervento === 'mud' ? 'MUD → usa valore MUD' : 'Ordinario → usa Buono Lavoro');

    // STEP 3: Crea o trova la sottocartella specifica
    let subFolder;
    try {
      console.log('🔍 Cercando sottocartella:', CARTELLA_NOME);
      const existingFolders = mainFolder.getFoldersByName(CARTELLA_NOME);
      
      if (existingFolders.hasNext()) {
        subFolder = existingFolders.next();
        console.log('📁 Sottocartella esistente trovata:', CARTELLA_NOME);
      } else {
        console.log('🆕 Creando nuova sottocartella:', CARTELLA_NOME);
        subFolder = mainFolder.createFolder(CARTELLA_NOME);
        
        // Imposta permessi sulla nuova cartella
        try {
          subFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          console.log('🔓 Permessi impostati sulla nuova sottocartella');
        } catch (permError) {
          console.warn('⚠️ Impossibile impostare permessi su sottocartella:', permError);
        }
        
        console.log('✅ Sottocartella creata con successo:', CARTELLA_NOME);
      }
    } catch (subFolderError) {
      console.error('❌ Errore gestione sottocartella:', subFolderError);
      console.log('🔄 Fallback: uso cartella principale per upload');
      subFolder = mainFolder; // Fallback: usa cartella principale
    }

    // STEP 4: Crea il file nella sottocartella
    console.log('📝 Tentativo creazione file nella sottocartella:', subFolder.getName());
    const file = subFolder.createFile(blob);
    console.log('📄 File creato con successo:', file.getName());
    console.log('🆔 ID file:', file.getId());
    console.log('📏 Dimensione file salvato:', file.getSize(), 'bytes');
    
    // STEP 5: Imposta permessi di visualizzazione pubblica
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      console.log('🔓 Permessi di visualizzazione impostati correttamente');
    } catch (permissionError) {
      console.warn('⚠️ Impossibile impostare permessi pubblici:', permissionError);
    }

    // STEP 6: Genera URL per visualizzazione diretta
    const viewUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    console.log('🔗 URL generato per visualizzazione:', viewUrl);
    console.log('✅ Upload firma completato con successo');

    return viewUrl;

  } catch (error) {
    console.error('❌ Errore upload Google Drive:', error);
    throw new Error('Upload fallito: ' + error.toString());
  }
}

// ===============================================
// 🌐 FUNZIONE PRINCIPALE WEB ENDPOINT
// ===============================================

function doGet(e) {
  try {
    console.log('Richiesta ricevuta:', e.parameter);
    
    // Se è una richiesta JSONP (con callback)
    if (e.parameter.callback) {
      return handleJsonpRequest(e);
    }
    
    // Richiesta GET normale
    const response = {
      status: 'ok',
      message: 'Script JSONP funzionante - Due fogli MUD/Ordinari',
      timestamp: new Date().toISOString(),
      version: 'JSONP-V4-DUE-FOGLI',
      supportedMethods: ['GET-JSONP', 'POST-via-GET'],
      sheets: ['MUD', 'Ordinari']
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Errore:', error);
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleJsonpRequest(e) {
  try {
    const callback = e.parameter.callback;
    const action = e.parameter.action;
    
    console.log('JSONP Request - Action:', action);
    
    let response;
    
    if (action === 'test') {
      // Test di connessione
      response = {
        status: 'success',
        message: 'JSONP test successful - Due fogli pronti',
        timestamp: new Date().toISOString(),
        method: 'JSONP',
        sheets: CONFIG.SHEET_NAMES
      };
    } else if (action === 'save') {
      // FASE 1: Salva dati principali SENZA firme
      response = saveDataToCorrectSheet(e.parameter);
    } else if (action === 'upload-client-signature') {
      // FASE 2: Upload solo firma cliente
      response = uploadClientSignature(e.parameter);
    } else if (action === 'ping') {
      // Test di connettività semplice
      response = {
        status: 'pong',
        timestamp: new Date().toISOString(),
        message: 'Server raggiungibile - Due fogli attivi'
      };
    } else {
      response = {
        status: 'error',
        message: 'Azione non riconosciuta: ' + action
      };
    }
    
    // Crea risposta JSONP
    const jsonpResponse = callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    console.error('Errore JSONP:', error);
    const errorResponse = callback + '(' + JSON.stringify({
      status: 'error',
      message: error.toString()
    }) + ');';
    
    return ContentService
      .createTextOutput(errorResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// 🖊️ FUNZIONE UPLOAD FIRMA CLIENTE: Carica solo firma cliente
function uploadClientSignature(params) {
  try {
    console.log('🖊️ FASE 2: Upload firma cliente...');
    
    const data = JSON.parse(decodeURIComponent(params.data || '{}'));
    const { buonoLavoro, tipoIntervento, signatureBase64, luogo, dataInizio } = data;
    
    if (!signatureBase64) {
      return {
        status: 'error',
        message: 'Dati firma mancanti'
      };
    }
    
    if (!buonoLavoro) {
      return {
        status: 'error',
        message: 'Buono lavoro mancante'
      };
    }
    
    console.log('📤 Upload firma cliente per buono lavoro:', buonoLavoro);
    console.log('📊 Tipo intervento:', tipoIntervento);
    console.log('📐 Dimensione firma Base64:', signatureBase64.length, 'caratteri');
    
    // Determina il foglio corretto
    const isMUD = tipoIntervento === 'mud';
    const sheetName = isMUD ? CONFIG.SHEET_NAMES.MUD : CONFIG.SHEET_NAMES.ORDINARI;
    const columns = isMUD ? CONFIG.COLUMNS_MUD : CONFIG.COLUMNS_ORDINARI;
    
    // Upload su Google Drive
    const driveUrl = uploadImageToDrive(
      signatureBase64,
      'firma_cliente_' + buonoLavoro + '.png',
      buonoLavoro,
      tipoIntervento || 'ordinario'
    );
    
    console.log('🔗 URL Drive generato:', driveUrl);
    
    // Aggiorna il foglio con l'URL della firma
    updateSignatureInSheet(buonoLavoro, driveUrl, tipoIntervento);
    
    return {
      status: 'success',
      message: 'Firma cliente caricata con successo',
      driveUrl: driveUrl,
      buonoLavoro: buonoLavoro,
      sheetType: isMUD ? 'MUD' : 'Ordinari',
      sheetName: sheetName
    };
    
  } catch (error) {
    console.error('❌ Errore upload firma cliente:', error);
    return {
      status: 'error',
      message: 'Errore upload firma: ' + error.toString()
    };
  }
}

// 📝 FUNZIONE AGGIORNAMENTO FIRMA NEL FOGLIO
function updateSignatureInSheet(buonoLavoro, driveUrl, tipoIntervento) {
  console.log('📝 Aggiornamento firma nel foglio...');
  console.log('🎫 Buono Lavoro:', buonoLavoro);
  console.log('🔗 URL Firma:', driveUrl);
  console.log('📋 Tipo:', tipoIntervento);
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheetName = tipoIntervento === 'mud' ? CONFIG.SHEET_NAMES.MUD : CONFIG.SHEET_NAMES.ORDINARI;
    const sheet = ss.getSheetByName(sheetName);
    
    console.log('📊 Foglio selezionato:', sheetName);
    
    // Cerca la riga con il buono lavoro corrispondente
    const data = sheet.getDataRange().getValues();
    const columns = tipoIntervento === 'mud' ? CONFIG.COLUMNS_MUD : CONFIG.COLUMNS_ORDINARI;
    
    for (let i = 1; i < data.length; i++) { // Skip header
      const buonoLavoroColIndex = tipoIntervento === 'mud' ? 
        CONFIG.COLUMNS_MUD.BUONO_LAVORO - 1 : 
        CONFIG.COLUMNS_ORDINARI.BUONO_LAVORO - 1;
        
      const rowBuonoLavoro = data[i][buonoLavoroColIndex];
      
      if (rowBuonoLavoro === buonoLavoro) {
        console.log('✅ Riga trovata:', i + 1);
        
        // Aggiorna la colonna firma
        const firmaColIndex = tipoIntervento === 'mud' ? 
          CONFIG.COLUMNS_MUD.FIRMA_COMMITTENTE : 
          CONFIG.COLUMNS_ORDINARI.FIRMA_COMMITTENTE;
          
        sheet.getRange(i + 1, firmaColIndex).setValue(driveUrl);
        console.log('📝 Firma aggiornata in colonna:', firmaColIndex);
        
        return true;
      }
    }
    
    console.warn('⚠️ Buono lavoro non trovato nel foglio:', buonoLavoro);
    return false;
    
  } catch (error) {
    console.error('❌ Errore aggiornamento firma nel foglio:', error);
    throw error;
  }
}