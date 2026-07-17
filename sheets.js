require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function agregarGasto(gasto) {
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Hoja 1!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[gasto.fecha, gasto.descripcion, gasto.categoria, gasto.valor]]
        }
    });
}

module.exports = { agregarGasto };