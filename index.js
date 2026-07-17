require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { interpretarGasto } = require('./interpretar');
const { agregarGasto } = require('./sheets');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡Todo listo! WhatsApp está conectado.');
});

client.on('message_create', async (msg) => {
    const esMiChat = msg.id.remote === process.env.MI_CHAT_PERSONAL;
    const esRespuestaDelBot = msg.body.startsWith('🤖');

    if (esMiChat && !esRespuestaDelBot) {
        try {
            const gasto = await interpretarGasto(msg.body);
            await agregarGasto(gasto);
            const respuesta = `🤖 Anotado Bro:\nFecha: ${gasto.fecha}\nDescripción: ${gasto.descripcion}\nValor: $${gasto.valor}\nCategoría: ${gasto.categoria}`;
            client.sendMessage(msg.from, respuesta);
        } catch (error) {
            console.error('Error procesando el gasto:', error);
            client.sendMessage(msg.from, '🤖 Bro, No pude procesar ese gasto, intenta de nuevo.');
        }
    }
});

client.initialize();