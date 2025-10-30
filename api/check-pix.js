import fetch from 'node-fetch';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-pushinpay-token',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, x-pushinpay-token')
      .end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'ID da transação não fornecido' });
    }

    const token = process.env.PUSHINPAY_TOKEN;

    if (!token) {
      return res.status(500)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Token PushinPay não configurado' });
    }

    const pushinpayUrl = `https://api.pushinpay.com.br/api/transactions/${id}`;

    const response = await fetch(pushinpayUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro ao consultar PIX:', errorData);
      return res.status(response.status)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: `Erro ao consultar transação: ${response.statusText}` });
    }

    const data = await response.json();

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json({
        id: data.id,
        status: data.status,
        value: data.value,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Erro interno ao consultar PIX' });
  }
}
