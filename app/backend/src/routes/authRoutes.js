const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const { query } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }
    
    // Buscar usuário no banco de dados
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const user = result.rows[0];
    
    // Verificar se o usuário existe
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    // No ambiente real, validar a senha com bcrypt
    // Aqui estamos fazendo uma validação simplificada para teste
    // const validPassword = await bcrypt.compare(password, user.password);
    const validPassword = password === user.password; // Simplificado para teste
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Remover senha do objeto user
    delete user.password;
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor ao processar login',
      error: error.message
    });
  }
});

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validar entrada
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    // Verificar se o email já está em uso
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este email já está em uso' 
      });
    }
    
    // No ambiente real, fazer hash da senha com bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // Simplificado para teste
    
    // Inserir o novo usuário
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, hashedPassword, 'customer']
    );
    
    const newUser = result.rows[0];
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      token,
      user: newUser
    });
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor ao processar registro',
      error: error.message
    });
  }
});

// Rota para obter perfil do usuário (protegida)
router.get('/profile', async (req, res) => {
  // Normalmente aqui teríamos um middleware de autenticação
  // Simulando para propósitos de teste
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar dados atualizados do usuário
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Erro ao verificar token:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
});

module.exports = router; 