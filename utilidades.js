function extraerTexto(respuesta) {
    const bloqueTexto = respuesta.content.find(bloque => bloque.type === 'text');
    return bloqueTexto.text;
}

function parsearRespuestaJSON(texto) {
    const textoLimpio = texto.replace(/```json\s*|```\s*/g, '').trim();
    return JSON.parse(textoLimpio);
}

module.exports = { extraerTexto, parsearRespuestaJSON };