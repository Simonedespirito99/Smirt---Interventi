/**
 * SMIRT Signatures Client - JSONP per Google Apps Script
 * Compatibile con lo script GAS fornito per salvataggio firme in Google Drive
 * Cartella target: https://drive.google.com/drive/u/2/folders/13vI7aODCn6CT4soLk73Ki5FxRptttS74
 */

// ⚠️ IMPORTANTE: Sostituisci questo URL con l'URL del tuo Web App dopo il deploy
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SOSTITUISCI_CON_TUO_URL/exec';

// Timeout per chiamate JSONP (millisecondi)
const JSONP_TIMEOUT = 20000;

// ID della cartella Drive target (dalla tua richiesta)
const DRIVE_FOLDER_ID = '13vI7aODCn6CT4soLk73Ki5FxRptttS74';

/**
 * Esegue una chiamata JSONP al Google Apps Script
 * @param {string} action - Azione da eseguire ('test', 'save', 'upload-signature', etc.)
 * @param {object} data - Dati da inviare
 * @returns {Promise<object>} Risposta del server
 */
function jsonpRequest(action, data = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = 'smirt_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);

    // Registra callback globale
    window[callbackName] = function(response) {
      clearTimeout(timer);
      cleanup();
      resolve(response);
    };

    function cleanup() {
      try { delete window[callbackName]; } catch(e) { window[callbackName] = undefined; }
      const script = document.getElementById(callbackName);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    // Costruisci URL con parametri
    const payload = encodeURIComponent(JSON.stringify(data));
    const url = `${APPS_SCRIPT_URL}?callback=${callbackName}&action=${encodeURIComponent(action)}&data=${payload}`;

    // Crea script tag
    const script = document.createElement('script');
    script.src = url;
    script.id = callbackName;
    script.async = true;
    script.onerror = function() {
      clearTimeout(timer);
      cleanup();
      reject(new Error('Errore caricamento script JSONP'));
    };

    // Timer di timeout
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout chiamata JSONP'));
    }, JSONP_TIMEOUT);

    document.head.appendChild(script);
  });
}

/**
 * Test di connessione al Google Apps Script
 * @returns {Promise<object>} Risultato del test
 */
async function testConnection() {
  try {
    console.log('🔄 Test connessione Google Apps Script...');
    const result = await jsonpRequest('test');
    console.log('✅ Test connessione riuscito:', result);
    return result;
  } catch (error) {
    console.error('❌ Test connessione fallito:', error);
    throw error;
  }
}

/**
 * Salva i dati del rapporto (FASE 1 - senza firme)
 * @param {object} reportData - Dati del rapporto
 * @returns {Promise<object>} Risultato salvataggio
 */
async function saveReportData(reportData) {
  try {
    console.log('💾 Salvataggio dati rapporto...', reportData.mud);
    const result = await jsonpRequest('save', reportData);
    console.log('✅ Dati salvati:', result);
    return result;
  } catch (error) {
    console.error('❌ Errore salvataggio dati:', error);
    throw error;
  }
}

/**
 * Carica una firma su Google Drive (FASE 2)
 * @param {string} mud - Codice MUD
 * @param {string} signatureType - Tipo firma ('committente' o 'tecnico')
 * @param {string} signatureBase64 - Firma in base64 (con o senza prefisso data:)
 * @returns {Promise<object>} Risultato upload
 */
async function uploadSignature(mud, signatureType, signatureBase64) {
  if (!mud || !signatureType || !signatureBase64) {
    throw new Error('Parametri mancanti: mud, signatureType o signatureBase64');
  }

  try {
    console.log(`🖊️ Upload firma ${signatureType} per MUD: ${mud}`);
    console.log(`📊 Dimensione firma: ${signatureBase64.length} caratteri`);
    
    const signatureData = {
      mud: mud,
      signatureType: signatureType,
      signatureBase64: signatureBase64
    };

    const result = await jsonpRequest('upload-signature', signatureData);
    console.log('✅ Firma caricata:', result);
    return result;
  } catch (error) {
    console.error('❌ Errore upload firma:', error);
    throw error;
  }
}

/**
 * Converte un canvas in base64 (per acquisizione firme)
 * @param {HTMLCanvasElement} canvas - Canvas con la firma
 * @param {string} format - Formato immagine ('png' o 'jpeg')
 * @param {number} quality - Qualità JPEG (0-1)
 * @returns {string} Data URL base64
 */
function canvasToBase64(canvas, format = 'png', quality = 0.8) {
  if (!canvas || !canvas.toDataURL) {
    throw new Error('Canvas non valido');
  }
  
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Workflow completo: salva rapporto + upload firma
 * @param {object} reportData - Dati rapporto
 * @param {HTMLCanvasElement} signatureCanvas - Canvas con firma
 * @param {string} signatureType - Tipo firma
 * @returns {Promise<object>} Risultato completo
 */
async function saveReportWithSignature(reportData, signatureCanvas, signatureType = 'committente') {
  try {
    console.log('🔄 Workflow completo: dati + firma...');
    
    // FASE 1: Salva dati principali
    const saveResult = await saveReportData(reportData);
    console.log('✅ FASE 1 completata');
    
    // FASE 2: Upload firma se canvas fornito
    if (signatureCanvas) {
      const signatureBase64 = canvasToBase64(signatureCanvas, 'png', 0.8);
      const uploadResult = await uploadSignature(reportData.mud, signatureType, signatureBase64);
      console.log('✅ FASE 2 completata');
      
      return {
        success: true,
        saveResult: saveResult,
        uploadResult: uploadResult,
        buonoLavoro: saveResult.buonoLavoro
      };
    }
    
    return {
      success: true,
      saveResult: saveResult,
      buonoLavoro: saveResult.buonoLavoro
    };
    
  } catch (error) {
    console.error('❌ Errore workflow completo:', error);
    throw error;
  }
}

/**
 * Forza pulizia cartelle duplicate (manutenzione)
 * @returns {Promise<object>} Risultato pulizia
 */
async function forceCleanupFolders() {
  try {
    console.log('🧹 Pulizia cartelle duplicate...');
    const result = await jsonpRequest('force-cleanup');
    console.log('✅ Pulizia completata:', result);
    return result;
  } catch (error) {
    console.error('❌ Errore pulizia:', error);
    throw error;
  }
}

// Esporta funzioni per uso globale
window.smirtSignatures = {
  testConnection,
  saveReportData,
  uploadSignature,
  saveReportWithSignature,
  canvasToBase64,
  forceCleanupFolders,
  jsonpRequest,
  
  // Costanti utili
  APPS_SCRIPT_URL,
  DRIVE_FOLDER_ID
};

// Log inizializzazione
console.log('📝 SMIRT Signatures Client inizializzato');
console.log('🔗 GAS URL:', APPS_SCRIPT_URL);
console.log('📁 Drive Folder ID:', DRIVE_FOLDER_ID);

// Test automatico se richiesto
if (window.location.search.includes('test-signatures')) {
  setTimeout(async () => {
    try {
      await testConnection();
      console.log('🎉 Test automatico connessione riuscito!');
    } catch (e) {
      console.warn('⚠️ Test automatico fallito:', e.message);
    }
  }, 1000);
}