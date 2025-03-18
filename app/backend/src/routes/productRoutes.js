const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const { query } = require('../config/database');

// Obter todos os produtos (com filtro opcional de categoria)
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    const params = [];
    
    if (category_id) {
      sql += ' WHERE p.category_id = $1';
      params.push(category_id);
    }
    
    sql += ' ORDER BY p.name';
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    logger.error('Erro ao buscar produtos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar produtos',
      error: error.message
    });
  }
});

// Obter um produto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error(`Erro ao buscar produto ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar produto',
      error: error.message
    });
  }
});

// Criar um novo produto (apenas administradores)
router.post('/', async (req, res) => {
  try {
    // Aqui teríamos um middleware de verificação de admin
    
    const { 
      name, 
      description, 
      price, 
      image_url, 
      category_id, 
      available = true,
      nutritional_info = {} 
    } = req.body;
    
    // Validar entrada
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Nome, preço e categoria são obrigatórios'
      });
    }
    
    // Verificar se a categoria existe
    const categoryCheck = await query(
      'SELECT * FROM categories WHERE id = $1',
      [category_id]
    );
    
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    const result = await query(
      `INSERT INTO products 
        (name, description, price, image_url, category_id, available, nutritional_info) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description, price, image_url, category_id, available, nutritional_info]
    );
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Erro ao criar produto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar produto',
      error: error.message
    });
  }
});

// Atualizar um produto (apenas administradores)
router.put('/:id', async (req, res) => {
  try {
    // Aqui teríamos um middleware de verificação de admin
    
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      image_url, 
      category_id, 
      available,
      nutritional_info 
    } = req.body;
    
    // Verificar se o produto existe
    const productCheck = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    // Construir a query de atualização
    let sql = 'UPDATE products SET ';
    const params = [];
    const updateFields = [];
    let paramCounter = 1;
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramCounter++}`);
      params.push(name);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`);
      params.push(description);
    }
    
    if (price !== undefined) {
      updateFields.push(`price = $${paramCounter++}`);
      params.push(price);
    }
    
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCounter++}`);
      params.push(image_url);
    }
    
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramCounter++}`);
      params.push(category_id);
    }
    
    if (available !== undefined) {
      updateFields.push(`available = $${paramCounter++}`);
      params.push(available);
    }
    
    if (nutritional_info !== undefined) {
      updateFields.push(`nutritional_info = $${paramCounter++}`);
      params.push(nutritional_info);
    }
    
    // Adicionar campo updated_at
    updateFields.push(`updated_at = NOW()`);
    
    // Se não houver campos para atualizar
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar fornecido'
      });
    }
    
    // Finalizar a query
    sql += updateFields.join(', ');
    sql += ` WHERE id = $${paramCounter} RETURNING *`;
    params.push(id);
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error(`Erro ao atualizar produto ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
});

// Excluir um produto (apenas administradores)
router.delete('/:id', async (req, res) => {
  try {
    // Aqui teríamos um middleware de verificação de admin
    
    const { id } = req.params;
    
    // Verificar se o produto existe
    const productCheck = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    // Verificar se há pedidos com este produto
    const orderCheck = await query(
      'SELECT * FROM order_items WHERE product_id = $1 LIMIT 1',
      [id]
    );
    
    if (orderCheck.rows.length > 0) {
      // Em vez de excluir, marcar como indisponível
      await query(
        'UPDATE products SET available = false, updated_at = NOW() WHERE id = $1',
        [id]
      );
      
      return res.json({
        success: true,
        message: 'Produto marcado como indisponível pois já foi usado em pedidos'
      });
    }
    
    // Excluir o produto
    await query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Produto excluído com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao excluir produto ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir produto',
      error: error.message
    });
  }
});

module.exports = router; 