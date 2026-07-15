export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxM46xdggDWONzBtK8MYdh5ci6hIRW74ZGFLymIzc0wHQNOiQesJYADEneIsm8EPsMMJA/exec';

export const syncToGoogleSheets = async (action: string, payload: any) => {
  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        payload
      })
    });
    console.log(`[Google Sheets Sync] Sent ${action} to Google Sheets.`);
  } catch (error) {
    console.error('[Google Sheets Sync] Failed to send data:', error);
  }
};
