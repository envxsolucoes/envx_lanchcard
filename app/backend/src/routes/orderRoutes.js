const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const { query, pool } = require('../config/database');

// Obter todos os pedidos (com filtro opcional de usuário)
router.get('/', async (req, res) => {
  try {
    const { user_id, status } = req.query;
    let sql = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    
    // Para cada pedido, buscar os itens
    const orders = [];
    for (const order of result.rows) {
      const itemsResult = await query(
        `SELECT oi.*, p.name as product_name, p.price as product_price, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1`,
        [order.id]
      );
      
      orders.push({
        ...order,
        items: itemsResult.rows
      });
    }
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    logger.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar pedidos',
      error: error.message
    });
  }
});

// Obter um pedido específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Buscar os itens do pedido
    const itemsResult = await query(
      `SELECT oi.*, p.name as product_name, p.price as product_price, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [id]
    );
    
    order.items = itemsResult.rows;
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error(`Erro ao buscar pedido ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar pedido',
      error: error.message
    });
  }
});

// Criar um novo pedido
router.post('/', async (req, res) => {
  // Iniciar uma transação
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      user_id, 
      items, 
      notes 
    } = req.body;
    
    // Validar entrada
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Usuário e itens são obrigatórios. Itens deve ser um array não vazio.'
      });
    }
    
    // Buscar informações dos produtos para calcular o total
    let totalAmount = 0;
    const processedItems = [];
    
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Cada item deve ter product_id e quantity (maior que zero)'
        });
      }
      
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1 AND available = true',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Produto com id ${item.product_id} não está disponível ou não existe`
        });
      }
      
      const product = productResult.rows[0];
      const unitPrice = parseFloat(product.price);
      const totalPrice = unitPrice * item.quantity;
      
      totalAmount += totalPrice;
      
      processedItems.push({
        ...item,
        unit_price: unitPrice,
        total_price: totalPrice
      });
    }
    
    // Criar o pedido
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, notes) 
       VALUES ($1, 'pending', $2, $3) 
       RETURNING *`,
      [user_id, totalAmount, notes]
    );
    
    const newOrder = orderResult.rows[0];
    
    // Inserir os itens do pedido
    for (const item of processedItems) {
      await client.query(
        `INSERT INTO order_items 
          (order_id, product_id, quantity, unit_price, total_price, notes) 
         VALUES 
          ($1, $2, $3, $4, $5, $6)`,
        [
          newOrder.id, 
          item.product_id, 
          item.quantity, 
          item.unit_price, 
          item.total_price,
          item.notes
        ]
      );
    }
    
    // Buscar os itens inseridos para retornar na resposta
    const itemsResult = await client.query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [newOrder.id]
    );
    
    // Commit da transação
    await client.query('COMMIT');
    
    // Montar a resposta
    const completeOrder = {
      ...newOrder,
      items: itemsResult.rows
    };
    
    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: completeOrder
    });
  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    
    logger.error('Erro ao criar pedido:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar pedido',
      error: error.message
    });
  } finally {
    // Liberar o cliente da pool
    client.release();
  }
});

// Atualizar status de um pedido
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar o status
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'canceled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status deve ser um dos seguintes: ${validStatuses.join(', ')}`
      });
    }
    
    // Verificar se o pedido existe
    const orderCheck = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }
    
    // Atualizar o status
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    res.json({
      success: true,
      message: `Status do pedido atualizado para '${status}'`,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error(`Erro ao atualizar status do pedido ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar status do pedido',
      error: error.message
    });
  }
});

// Atualizar status de pagamento de um pedido
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_status, payment_id } = req.body;
    
    // Validar entrada
    if (!payment_method || !payment_status) {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento e status de pagamento são obrigatórios'
      });
    }
    
    // Validar o status de pagamento
    const validPaymentStatuses = ['pending', 'confirmed', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: `Status de pagamento deve ser um dos seguintes: ${validPaymentStatuses.join(', ')}`
      });
    }
    
    // Verificar se o pedido existe
    const orderCheck = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }
    
    // Atualizar o pagamento
    const result = await query(
      `UPDATE orders 
       SET payment_method = $1, payment_status = $2, payment_id = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [payment_method, payment_status, payment_id, id]
    );
    
    res.json({
      success: true,
      message: `Pagamento do pedido atualizado para '${payment_status}'`,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error(`Erro ao atualizar pagamento do pedido ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar pagamento do pedido',
      error: error.message
    });
  }
});

module.exports = router; 