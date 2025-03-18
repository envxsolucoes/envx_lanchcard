const { logger } = require('../config/logger');

/**
 * Middleware de tratamento de erros centralizado para API
 */
const errorHandler = (err, req, res, next) => {
  // Registrar o erro no log
  logger.error('Erro não tratado:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'não autenticado'
  });
  
  // Verificar o tipo de erro
  if (err.name === 'ValidationError') {
    // Erro de validação (ex: Mongoose, Joi)
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors || err.message
    });
  }
  
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // Erro de autenticação JWT
    return res.status(401).json({
      success: false,
      message: 'Erro de autenticação',
      error: 'Token inválido ou expirado'
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    // Erro de autorização
    return res.status(403).json({
      success: false,
      message: 'Acesso negado',
      error: err.message
    });
  }
  
  if (err.code === '23505') {
    // Erro de chave duplicada no PostgreSQL
    return res.status(400).json({
      success: false,
      message: 'Dados duplicados',
      error: 'Um registro com os mesmos dados já existe'
    });
  }
  
  // Tempo esgotado para operações
  if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
    return res.status(408).json({
      success: false,
      message: 'Tempo de operação esgotado',
      error: 'A operação demorou muito para responder'
    });
  }
  
  // Para erros relacionados a bancos de dados
  if (err.code && err.code.startsWith('23') || err.code && err.code.startsWith('42')) {
    return res.status(400).json({
      success: false,
      message: 'Erro de banco de dados',
      error: err.message
    });
  }
  
  // Erros de rede ou de APIs externas
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.name === 'AxiosError') {
    return res.status(503).json({
      success: false,
      message: 'Serviço indisponível',
      error: 'Não foi possível se conectar com um serviço externo'
    });
  }
  
  // Erro padrão para qualquer outro tipo de erro
  const statusCode = err.statusCode || 500;
  
  // Em ambiente de produção, não enviamos detalhes do erro
  const errorResponse = {
    success: false,
    message: 'Erro no servidor',
    error: process.env.NODE_ENV === 'production' ? 'Um erro inesperado ocorreu' : err.message
  };
  
  // Em ambiente de desenvolvimento, incluir o stack trace
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler; 