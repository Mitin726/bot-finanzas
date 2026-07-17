require('dotenv').config();
const { parsearRespuestaJSON, extraerTexto } = require('./utilidades');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

function calcularMesAnio(mesesAtras) {
    const hoy = new Date();
    const fechaObjetivo = new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, 1);
    return {
        mes: fechaObjetivo.getMonth() + 1,
        anio: fechaObjetivo.getFullYear()
    };
}

async function interpretarConsulta(textoUsuario) {
    const hoy = new Date().toISOString().split('T')[0];

    const respuesta = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 200,
        system: `Hoy es ${hoy}. El usuario pregunta sobre sus gastos. Responde ÚNICAMENTE con un JSON con esta estructura exacta:
{"meses_atras": numero, "categoria": "string o null"}
"meses_atras": 0 si pregunta por "este mes", "el mes actual" o no especifica ningún período. 1 si dice "el mes pasado". Para meses nombrados directamente (ej: "en julio"), calcula cuántos meses atrás está ese mes respecto a hoy.
"categoria": una de Comida, Transporte, Ocio, Salud, Hogar, Otros si menciona una categoría específica, o null si pregunta por el total de todas.`,
        messages: [
            { role: 'user', content: textoUsuario }
        ]
    });

    const datos = parsearRespuestaJSON(extraerTexto(respuesta))
    const { mes, anio } = calcularMesAnio(datos.meses_atras);

    return { mes, anio, categoria: datos.categoria };
}

function calcularResumen(gastos, filtros) {
    const filtrados = gastos.filter(g => {
        const [anioGasto, mesGasto] = g.fecha.split('-').map(Number);
        const coincideMes = mesGasto === filtros.mes && anioGasto === filtros.anio;
        const coincideCategoria = !filtros.categoria || g.categoria === filtros.categoria;
        return coincideMes && coincideCategoria;
    });

    const total = filtrados.reduce((suma, g) => suma + g.valor, 0);

    return { total, cantidad: filtrados.length };
}

const NOMBRES_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatearRespuesta(resumen, filtros) {
    const nombreMes = NOMBRES_MESES[filtros.mes - 1];
    const parteCategoria = filtros.categoria ? ` en ${filtros.categoria}` : '';

    if (resumen.cantidad === 0) {
        return `🤖 No encontré gastos${parteCategoria} en ${nombreMes} de ${filtros.anio}.`;
    }

    return `🤖 En ${nombreMes} de ${filtros.anio} gastaste $${resumen.total}${parteCategoria}, repartidos en ${resumen.cantidad} gasto(s).`;
}

module.exports = { interpretarConsulta, calcularResumen, formatearRespuesta };