const rutasDelServicio1 = require('./Servicio1.js');
const rutasDelServicioDep = require('./ServicioDepartamento.js');


function asignarRutasAExpress(app) {
  app.use('/Servicio1', rutasDelServicio1);
  app.use('/ServicioDepartamento', rutasDelServicioDep);

}

module.exports = asignarRutasAExpress;
