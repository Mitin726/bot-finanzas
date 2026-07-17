require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

function calcularFecha(diasAtras) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
}

async function interpretarGasto(textoUsuario) {
    const hoy = calcularFecha(0);

    const respuesta = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        system: `Hoy es ${hoy}. El usuario te va a describir un gasto en lenguaje natural, en español, posiblemente colombiano. Extrae la información y responde ÚNICAMENTE con un JSON válido, sin texto adicional, con esta estructura exacta:
{"dias_atras": numero, "descripcion": "string corto", "valor": numero, "categoria": "una de: Comida, Transporte, Ocio, Salud, Hogar, Otros"}
"dias_atras" es CUÁNTOS DÍAS ANTES de hoy ocurrió el gasto: si no menciona cuándo o dice "hoy", usa 0. Si dice "ayer", usa 1. Si dice "antier" o "anteayer", usa 2. NO hagas el cálculo de la fecha final, solo identifica ese número.
El valor debe ser solo el número, sin símbolos ni puntos de miles.`,
        messages: [
            { role: 'user', content: textoUsuario }
        ]
    });

    const textoRespuesta = respuesta.content[0].text;
    const datos = JSON.parse(textoRespuesta);

    return {
        fecha: calcularFecha(datos.dias_atras),
        descripcion: datos.descripcion,
        valor: datos.valor,
        categoria: datos.categoria
    };
}

module.exports = { interpretarGasto };