const mysql = require ('mysql2/promise');

async function crearObjetoConexion() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.MYSQLPASS || '123456',
    database: process.env.DB_NAME || 'sistema_planilla',
    port: process.env.MYSQLPORT || 3306,
    multipleStatements: true,
    charset: "utf8mb4"
  });
}

async function ejecutarConsulta(consulta, parametrosDeLaConsulta) {
  const conexion = await crearObjetoConexion();
  let resultados = undefined;
  try {
    resultados = await conexion.query(consulta, parametrosDeLaConsulta);
    return resultados[0];
  } catch (error) {
    console.error(error.message);
  } finally {
    await conexion.end();
  }
};

module.exports = { ejecutarConsulta, crearObjetoConexion };
