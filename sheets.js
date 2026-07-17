require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

function convertirFechaSerial(numeroSerial) {
    const fechaBase = new Date(Date.UTC(1899, 11, 30));
    const milisegundosPorDia = 24 * 60 * 60 * 1000;
    const fecha = new Date(fechaBase.getTime() + numeroSerial * milisegundosPorDia);

    const año = fecha.getUTCFullYear();
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getUTCDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
}

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

async function leerGastos() {
    const respuesta = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Hoja 1!A2:D',
        valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const filas = respuesta.data.values || [];

    return filas.map(fila => ({
        fecha: convertirFechaSerial(fila[0]),
        descripcion: fila[1],
        categoria: fila[2],
        valor: Number(fila[3])
    }));
}

module.exports = { agregarGasto, leerGastos };