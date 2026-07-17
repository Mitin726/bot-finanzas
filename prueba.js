const { interpretarGasto } = require('./interpretar');

interpretarGasto('ayer gaste 20 mil en el almuerzo')
    .then(resultado => console.log(resultado));