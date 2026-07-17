require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function clasificarMensaje(textoUsuario) {
    const respuesta = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 20,
        system: `Clasifica el mensaje del usuario en una de dos categorías EXACTAS, respondiendo ÚNICAMENTE con la palabra, sin nada más:
- "registro" si el usuario está contando un gasto que hizo (ej: "gasté 20 mil en el almuerzo", "pagué el arriendo").
- "consulta" si el usuario está preguntando sobre gastos pasados (ej: "cuánto gasté en comida", "cuánto llevo este mes").`,
        messages: [
            { role: 'user', content: textoUsuario }
        ]
    });

    return respuesta.content[0].text.trim();
}

module.exports = { clasificarMensaje };