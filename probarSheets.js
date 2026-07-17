const { agregarGasto } = require('./sheets');

agregarGasto({
    fecha: '2026-07-16',
    descripcion: 'Prueba desde código',
    categoria: 'Otros',
    valor: 5000
}).then(() => console.log('¡Fila agregada con éxito!'));