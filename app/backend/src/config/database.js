const { Pool } = require('pg');
const { logger } = require('./logger');

// Configuração de conexão com o banco de dados PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'lanchecard',
  password: process.env.DB_PASS || 'lanchecard@2025!',
  database: process.env.DB_NAME || 'lanchecard',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar inativa
  connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer uma conexão
  ssl: process.env.DB_SSL === 'true' ? 
    { rejectUnauthorized: false } : 
    undefined // Configuração para bancos em nuvem com SSL
});

// Testando conexão com o banco de dados
pool.connect()
  .then(() => logger.info('Conectado ao banco de dados PostgreSQL'))
  .catch(err => {
    logger.error('Erro ao conectar ao banco de dados:', err);
    // Em desenvolvimento, continuamos mesmo sem banco
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Continuando sem conexão com banco de dados em modo de desenvolvimento');
    }
  });

// Wrapper para queries SQL
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Erro na execução da query:', err);
    throw err;
  }
};

module.exports = {
  query,
  pool
}; 