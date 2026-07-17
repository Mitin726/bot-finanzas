const { clasificarMensaje } = require('./clasificar');

async function correrPruebas() {
    const mensaje1 = 'cuantos gastos de 10 mil hice este mes';
    const tipo1 = await clasificarMensaje(mensaje1);
    console.log(`"${mensaje1}" → ${tipo1}`);

    const mensaje2 = 'gaste 25 mil en una hamburguesa ayer';
    const tipo2 = await clasificarMensaje(mensaje2);
    console.log(`"${mensaje2}" → ${tipo2}`);
}

correrPruebas();