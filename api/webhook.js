const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-pushinpay-token',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, x-pushinpay-token')
      .end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const webhookToken = process.env.PUSHINPAY_WEBHOOK_TOKEN;
    const receivedToken = req.headers['x-pushinpay-token'];

    if (!webhookToken) {
      console.error('PUSHINPAY_WEBHOOK_TOKEN não configurado');
      return res.status(500)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Token webhook não configurado' });
    }

    if (receivedToken !== webhookToken) {
      console.error('Token inválido recebido:', receivedToken);
      return res.status(401)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Token inválido' });
    }

    const webhookData = req.body;

    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Dados:', JSON.stringify(webhookData, null, 2));
    console.log('Status:', webhookData.status);
    console.log('ID da transação:', webhookData.id);
    console.log('Valor:', webhookData.value);
    console.log('========================');

    if (webhookData.status === 'paid') {
      console.log(`✓ Pagamento confirmado para transação ${webhookData.id}`);
    }

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Content-Type', 'application/json')
      .json({
        success: true,
        message: 'Webhook processado com sucesso',
        received_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: true,
        message: 'Webhook recebido'
      });
  }
}
