require('dotenv').config();
const { parsearRespuestaJSON, extraerTexto } = require('./utilidades');
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
    const anioActual = new Date().getFullYear();

    const respuesta = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        system: `Hoy es ${hoy}. El año actual es ${anioActual}. El usuario te va a describir un gasto en lenguaje natural, en español, posiblemente colombiano. Extrae la información y responde ÚNICAMENTE con un JSON válido, sin texto adicional, con esta estructura exacta:
{"dias_atras": numero o null, "fecha_exacta": "YYYY-MM-DD" o null, "descripcion": "string corto", "valor": numero, "categoria": "una de: Comida, Transporte, Ocio, Salud, Hogar, Otros"}

Usa SOLO UNO de los dos campos de fecha, dejando el otro en null:
- Usa "dias_atras" para expresiones RELATIVAS al día de hoy: "hoy"=0, "ayer"=1, "antier"/"anteayer"=2, "hace X días"=X (usa el número que diga, generalizando el patrón). Si no menciona nada de tiempo, usa 0.
- Usa "fecha_exacta" cuando el usuario menciona una fecha específica directamente (ej: "el 15 de julio", "el 3 de junio"), convirtiéndola tú mismo a formato YYYY-MM-DD (asumiendo el año actual si no lo menciona). NO hagas restas de días aquí, solo traduce la fecha que ya te dieron al formato correcto.

El valor debe ser solo el número, sin símbolos ni puntos de miles (interpreta "150.000" o "150 mil" como 150000, no como 150).`,
        messages: [
            { role: 'user', content: textoUsuario }
        ]
    });

    const textoRespuesta = extraerTexto(respuesta);
    const datos = parsearRespuestaJSON(textoRespuesta);

    const fechaFinal = datos.fecha_exacta || calcularFecha(datos.dias_atras);

    return {
        fecha: fechaFinal,
        descripcion: datos.descripcion,
        valor: datos.valor,
        categoria: datos.categoria
    };
}

module.exports = { interpretarGasto };