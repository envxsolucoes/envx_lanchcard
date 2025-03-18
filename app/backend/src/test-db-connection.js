require('dotenv').config();
const { pool, query } = require('./config/database');
const { logger } = require('./config/logger');

// Função para testar a conexão com o banco de dados
async function testDatabaseConnection() {
  logger.info('Testando conexão com o banco de dados PostgreSQL...');
  
  try {
    // Tentar estabelecer uma conexão
    const client = await pool.connect();
    logger.info('✅ Conexão estabelecida com sucesso!');
    
    // Exibe informações da conexão
    logger.info(`📊 Conectado ao banco: ${process.env.DB_NAME}`);
    logger.info(`🖥️ Host: ${process.env.DB_HOST}`);
    logger.info(`👤 Usuário: ${process.env.DB_USER}`);
    
    // Fazer uma consulta simples
    const result = await client.query('SELECT current_database() as db, current_user as user, version() as version');
    logger.info('📋 Informações do servidor:');
    logger.info(`   - Banco conectado: ${result.rows[0].db}`);
    logger.info(`   - Usuário do banco: ${result.rows[0].user}`);
    logger.info(`   - Versão: ${result.rows[0].version}`);
    
    // Tentar contar as tabelas no schema público
    const tablesResult = await client.query(`
      SELECT count(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableCount = parseInt(tablesResult.rows[0].table_count);
    
    if (tableCount > 0) {
      logger.info(`📑 Número de tabelas encontradas: ${tableCount}`);
      
      // Listar todas as tabelas
      const tableListResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      logger.info('📝 Tabelas encontradas:');
      tableListResult.rows.forEach(row => {
        logger.info(`   - ${row.table_name}`);
      });
      
      // Verificar se existem as tabelas principais
      const mainTables = ['users', 'categories', 'products', 'orders', 'order_items'];
      const missingTables = mainTables.filter(table => 
        !tableListResult.rows.some(row => row.table_name === table)
      );
      
      if (missingTables.length > 0) {
        logger.warn(`⚠️ Tabelas não encontradas: ${missingTables.join(', ')}`);
      } else {
        logger.info('✅ Todas as tabelas principais estão presentes');
      }
    } else {
      logger.warn('⚠️ Nenhuma tabela encontrada no banco de dados');
    }
    
    // Liberar a conexão
    client.release();
    
  } catch (err) {
    logger.error('❌ Erro ao conectar ao banco de dados:', err);
    logger.error(`Detalhes de conexão: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  } finally {
    // Fechar o pool
    await pool.end();
  }
}

// Executar o teste
testDatabaseConnection(); 