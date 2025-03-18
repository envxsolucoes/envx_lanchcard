const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const { query } = require('../config/database');
const axios = require('axios');

// Gerar um pagamento via PIX
router.post('/generate', async (req, res) => {
  try {
    const { order_id, method } = req.body;
    
    // Validar entrada
    if (!order_id || !method) {
      return res.status(400).json({
        success: false,
        message: 'ID do pedido e método de pagamento são obrigatórios'
      });
    }
    
    // Verificar se o método é suportado
    if (method !== 'pix') {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento não suportado. Use "pix".'
      });
    }
    
    // Buscar informações do pedido
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1',
      [order_id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Verificar se o pedido já tem um pagamento confirmado
    if (order.payment_status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Este pedido já possui um pagamento confirmado'
      });
    }
    
    // Simular geração de um QR Code PIX
    // Em produção, usaria a API OpenPIX ou similar
    const paymentId = 'PIX_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const pixCode = `00020101021226880014br.gov.bcb.pix2566qrcodes-pix.test.com/v2/${paymentId}5204000053039865802BR5923LancheCard Universitario6009Sao Paulo62150511${paymentId}6304AF5C`;
    
    // Em produção, faria uma chamada real para a API de pagamento
    /*
    const openPixResponse = await axios.post(process.env.OPENPIX_API_URL + '/charge', {
      correlationID: paymentId,
      value: order.total_amount,
      comment: `Pedido #${order.id}`,
      expiresIn: 3600 // 1 hora
    }, {
      headers: {
        'Authorization': process.env.OPENPIX_API_KEY
      }
    });
    
    const pixCode = openPixResponse.data.brCode;
    */
    
    // Atualizar o pedido com as informações de pagamento
    await query(
      `UPDATE orders 
       SET payment_method = $1, payment_status = $2, payment_id = $3, updated_at = NOW() 
       WHERE id = $4`,
      [method, 'pending', paymentId, order_id]
    );
    
    res.json({
      success: true,
      message: 'Pagamento PIX gerado com sucesso',
      data: {
        order_id,
        payment_id: paymentId,
        payment_method: method,
        payment_status: 'pending',
        pix_code: pixCode,
        qrcode_image: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(pixCode)}`,
        expiration: new Date(Date.now() + 3600000).toISOString(), // 1 hora
        total_amount: order.total_amount
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao gerar pagamento',
      error: error.message
    });
  }
});

// Verificar status de um pagamento
router.get('/:payment_id/status', async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    // Buscar o pedido associado ao pagamento
    const orderResult = await query(
      'SELECT * FROM orders WHERE payment_id = $1',
      [payment_id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Em produção, verificaria o status real na API de pagamento
    /*
    const openPixResponse = await axios.get(process.env.OPENPIX_API_URL + `/charge/${payment_id}`, {
      headers: {
        'Authorization': process.env.OPENPIX_API_KEY
      }
    });
    
    const paymentStatus = openPixResponse.data.status;
    */
    
    // Para testes, usamos o status do banco de dados
    // Em um ambiente de demonstração, poderíamos simular uma confirmação aleatória
    
    res.json({
      success: true,
      data: {
        order_id: order.id,
        payment_id,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    logger.error(`Erro ao verificar status do pagamento ${req.params.payment_id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar status do pagamento',
      error: error.message
    });
  }
});

// Simular confirmação de pagamento (apenas para testes)
router.post('/:payment_id/confirm', async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    // Buscar o pedido associado ao pagamento
    const orderResult = await query(
      'SELECT * FROM orders WHERE payment_id = $1',
      [payment_id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Atualizar o status do pagamento para confirmado
    await query(
      `UPDATE orders 
       SET payment_status = 'confirmed', updated_at = NOW() 
       WHERE payment_id = $1 
       RETURNING *`,
      [payment_id]
    );
    
    // Se for um ambiente de produção, atualizaríamos o status do pedido para 'preparing'
    // após confirmação do pagamento
    await query(
      `UPDATE orders 
       SET status = 'preparing', updated_at = NOW() 
       WHERE id = $1`,
      [order.id]
    );
    
    res.json({
      success: true,
      message: 'Pagamento confirmado com sucesso',
      data: {
        order_id: order.id,
        payment_id,
        payment_method: order.payment_method,
        payment_status: 'confirmed',
        order_status: 'preparing'
      }
    });
  } catch (error) {
    logger.error(`Erro ao confirmar pagamento ${req.params.payment_id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao confirmar pagamento',
      error: error.message
    });
  }
});

// Webhook para receber notificações de pagamento (normalmente chamado pela API de pagamento)
router.post('/webhook', async (req, res) => {
  try {
    // Em produção, validaríamos a assinatura do webhook
    const { payment_id, status } = req.body;
    
    if (!payment_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos'
      });
    }
    
    // Mapear status da API para nosso formato
    let paymentStatus;
    switch (status) {
      case 'COMPLETED':
      case 'CONFIRMED':
        paymentStatus = 'confirmed';
        break;
      case 'EXPIRED':
      case 'FAILED':
        paymentStatus = 'failed';
        break;
      case 'REFUNDED':
        paymentStatus = 'refunded';
        break;
      default:
        paymentStatus = 'pending';
    }
    
    // Buscar o pedido associado ao pagamento
    const orderResult = await query(
      'SELECT * FROM orders WHERE payment_id = $1',
      [payment_id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Atualizar o status do pagamento
    await query(
      `UPDATE orders 
       SET payment_status = $1, updated_at = NOW() 
       WHERE payment_id = $2`,
      [paymentStatus, payment_id]
    );
    
    // Se o pagamento foi confirmado, atualizar o status do pedido para 'preparing'
    if (paymentStatus === 'confirmed') {
      await query(
        `UPDATE orders 
         SET status = 'preparing', updated_at = NOW() 
         WHERE id = $1`,
        [order.id]
      );
    }
    
    res.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao processar webhook de pagamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar webhook'
    });
  }
});

module.exports = router; 