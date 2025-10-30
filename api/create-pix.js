import fetch from 'node-fetch';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-pushinpay-token',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, x-pushinpay-token')
      .end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { value } = req.body;

    if (!value || typeof value !== 'number' || value <= 0) {
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Valor inválido. Informe um número maior que zero.' });
    }

    const valueInCents = Math.round(value * 100);

    const pushinpayUrl = 'https://api.pushinpay.com.br/api/pix/cashIn';
    const token = process.env.PUSHINPAY_TOKEN;

    if (!token) {
      return res.status(500)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Token PushinPay não configurado' });
    }

    const webhookUrl = `${req.headers.origin || 'https://' + req.headers.host}/api/webhook`;

    const response = await fetch(pushinpayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: valueInCents,
        webhook_url: webhookUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro PushinPay:', errorData);
      return res.status(response.status)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: `Erro ao criar PIX: ${response.statusText}` });
    }

    const data = await response.json();

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json({
        id: data.id,
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        status: data.status || 'created',
        value: valueInCents,
      });

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Erro interno ao criar PIX' });
  }
}
