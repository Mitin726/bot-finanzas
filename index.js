require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { clasificarMensaje } = require('./clasificar');
const { interpretarGasto } = require('./interpretar');
const { agregarGasto, leerGastos } = require('./sheets');
const { interpretarConsulta, calcularResumen, formatearRespuesta } = require('./consultas');

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
            const tipo = await clasificarMensaje(msg.body);

            if (tipo === 'consulta') {
                const filtros = await interpretarConsulta(msg.body);
                const gastos = await leerGastos();
                const resumen = calcularResumen(gastos, filtros);
                const respuesta = formatearRespuesta(resumen, filtros);
                client.sendMessage(msg.from, respuesta);
            } else {
                const gasto = await interpretarGasto(msg.body);
                await agregarGasto(gasto);
                const respuesta = `🤖 Anotado:\nFecha: ${gasto.fecha}\nDescripción: ${gasto.descripcion}\nValor: $${gasto.valor}\nCategoría: ${gasto.categoria}`;
                client.sendMessage(msg.from, respuesta);
            }
        } catch (error) {
            console.error('Error procesando el mensaje:', error);
            client.sendMessage(msg.from, '🤖 No pude procesar eso, intenta de nuevo.');
        }
    }
});

client.initialize();