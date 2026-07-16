const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡Todo listo! WhatsApp está conectado.');
});

client.on('message_create', (msg) => {
    console.log('Mensaje recibido:', msg.body);
    console.log('De:', msg.from);
});

client.on('message_create', (msg) => {
    const esMiChat = msg.from === client.info.wid._serialized;
    const esRespuestaDelBot = msg.body.startsWith('🤖');

    if (esMiChat && !esRespuestaDelBot) {
        console.log('Mensaje recibido:', msg.body);
        client.sendMessage(msg.from, '🤖 Recibido: ' + msg.body);
    }
});

client.initialize();