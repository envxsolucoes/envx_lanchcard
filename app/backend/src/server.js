require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger } = require('./config/logger');
const errorHandler = require('./utils/errorHandler');

// Rotas - Descomente à medida que implementar cada arquivo
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const nutritionRoutes = require('./routes/nutritionRoutes');
// const terminalRoutes = require('./routes/terminalRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Definição das rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/nutrition', nutritionRoutes);
// app.use('/api/terminal', terminalRoutes);

// Rota de teste de banco de dados
app.get('/api/test/db', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const client = await pool.connect();
    
    const result = await client.query('SELECT current_database() as db, current_user as user');
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Conexão com banco de dados estabelecida',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Erro ao testar conexão com banco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao conectar ao banco de dados',
      error: error.message
    });
  }
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
  logger.info(`API disponível em: http://localhost:${PORT}/api`);
});

// Lidar com o encerramento gracioso
process.on('SIGTERM', () => {
  logger.info('Sinal SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promessa rejeitada não tratada:', reason);
});

module.exports = app; 