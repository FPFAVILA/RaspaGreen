import React, { useState, useEffect } from 'react';
import { X, Copy, QrCode, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { useFictionalPix } from '../hooks/useFictionalPix';
import { QRCodeGenerator } from './QRCodeGenerator';
import { trackPurchase } from '../utils/tracking';

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBalance: (amount: number) => void;
  suggestedAmount?: number;
  message?: string;
}

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  isOpen,
  onClose,
  onAddBalance,
  suggestedAmount,
  message
}) => {
  const [amount, setAmount] = useState('');
  const { loading, error, pixData, createPix, checkPixStatus, reset } = useFictionalPix();
  const [copied, setCopied] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckInterval, setPaymentCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && suggestedAmount) {
      setAmount(suggestedAmount.toFixed(2).replace('.', ','));
    }
  }, [isOpen, suggestedAmount]);

  useEffect(() => {
    if (!pixData || !isOpen) return;

    setIsCheckingPayment(true);

    const checkPayment = async () => {
      try {
        const status = await checkPixStatus(pixData.transactionId);

        if (status.status === 'paid') {
          if (paymentCheckInterval) {
            clearInterval(paymentCheckInterval);
            setPaymentCheckInterval(null);
          }

          trackPurchase(status.value);
          onAddBalance(status.value);

          setTimeout(() => {
            reset();
            setAmount('');
            setIsCheckingPayment(false);
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
      }
    };

    checkPayment();

    const interval = setInterval(checkPayment, 3000);
    setPaymentCheckInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [pixData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
        setPaymentCheckInterval(null);
      }
      setIsCheckingPayment(false);
      reset();
      setAmount('');
      setCopied(false);
    }
  }, [isOpen, paymentCheckInterval, reset]);

  // Se modal não está aberto, não renderizar nada
  if (!isOpen) return null;

  const generatePix = async () => {
    const paymentAmount = parseFloat(amount.replace(',', '.'));
    if (paymentAmount < 10) return;

    try {
      await createPix(paymentAmount);
    } catch (err) {
      console.error('Erro ao gerar PIX:', err);
    }
  };

  const copyPixCode = async () => {
    if (!pixData?.qrcode) return;
    
    try {
      await navigator.clipboard.writeText(pixData.qrcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = (parseFloat(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatted === '0,00' ? '' : formatted;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-accent text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Adicionar Saldo</h2>
                <p className="text-sm opacity-90">PIX Instantâneo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Mensagem personalizada se houver */}
          {message && (
            <div className="bg-red-900 border-2 border-red-700 rounded-xl p-4 mb-4 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <div>
                  <h3 className="text-red-200 font-bold text-base">Saldo Insuficiente</h3>
                  <p className="text-red-300 text-sm">Para continuar jogando</p>
                </div>
              </div>
              <p className="text-red-200 text-sm font-medium text-center bg-black/30 rounded-lg p-2">
                {message}
              </p>
            </div>
          )}

          {/* Se não tem PIX gerado ainda, mostrar formulário */}
          {!pixData ? (
            <div className="space-y-4">
              
              {/* Input de Valor */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Valor a adicionar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                    R$
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(formatCurrency(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-accent text-xl font-bold text-center bg-gray-50 hover:bg-white transition-colors text-gray-800 placeholder-gray-500"
                    placeholder="0,00"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Valor mínimo: R$ 10,00
                </p>
              </div>

              {/* Valores Sugeridos */}
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/30">
                <h3 className="font-bold text-accent mb-3 flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  Valores Populares
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: suggestedAmount && suggestedAmount >= 10 ? suggestedAmount.toFixed(2).replace('.', ',') : '24,50', games: suggestedAmount && suggestedAmount >= 10 ? 'Próximo jogo' : '5 jogos', popular: true },
                    { value: '49,00', games: '10 jogos', popular: false },
                    { value: '73,50', games: '15 jogos', popular: false },
                    { value: '98,00', games: '20 jogos', popular: false }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAmount(option.value)}
                      className={`relative bg-white border-2 rounded-lg p-3 hover:bg-purple-50 transition-all duration-200 active:scale-95 ${
                        option.popular 
                          ? 'border-accent shadow-modern' 
                          : 'border-gray-300 hover:border-accent'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {option.popular && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {suggestedAmount && suggestedAmount >= 10 ? 'ESPECIAL' : 'POPULAR'}
                          </span>
                        </div>
                      )}
                      <div className="text-base font-bold text-accent">
                        R$ {option.value}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {option.games}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Gerar PIX */}
              <button
                onClick={generatePix}
                disabled={!amount || parseFloat(amount.replace(',', '.')) < 10 || loading}
                className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-modern hover-lift active:scale-95 relative overflow-hidden"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Animação de loading */}
                {loading && (
                  <div className="absolute inset-0 bg-accent-hover flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Gerando PIX...</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-3">
                  <QrCode className="w-5 h-5" />
                  <span>Gerar PIX Instantâneo</span>
                </div>
              </button>

              {/* Exibir erro se houver */}
              {error && (
                <div className="bg-red-900 border border-red-700 rounded-xl p-3">
                  <p className="text-red-200 text-sm text-center">
                    ❌ {error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Se PIX foi gerado, mostrar resultado */
            <div className="space-y-4">
              
              {/* Success Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 shadow-modern">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">PIX Gerado!</h3>
                <div className="bg-accent text-white rounded-full px-3 py-1 inline-block font-bold text-sm">
                  R$ {pixData.amount.toFixed(2).replace('.', ',')}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-100 rounded-xl p-4 text-center border border-gray-200 shadow-inner">
                <div className="bg-white rounded-lg p-4 shadow-lg inline-block border border-gray-100">
                  <QRCodeGenerator 
                    value={pixData.qrcode}
                    size={160}
                    className="mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 font-medium">
                  📱 Escaneie com o app do seu banco
                </p>
              </div>

              {/* Código Copia e Cola */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  💳 Código PIX (Copia e Cola):
                </label>
                <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
                  <input
                    type="text"
                    value={pixData.qrcode}
                    readOnly
                    className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-xs font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-accent text-gray-800"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={copyPixCode}
                    className={`w-full px-4 py-3 rounded-lg font-bold transition-all duration-300 active:scale-95 ${
                      copied 
                        ? 'bg-accent text-white shadow-modern' 
                        : 'bg-accent text-white hover:bg-accent-hover shadow-modern'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {copied ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Código Copiado!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" />
                        <span>Copiar Código PIX</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-900 border border-blue-700 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">ℹ️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-200 mb-2 text-sm">Como pagar:</h4>
                    <ol className="text-blue-300 text-xs space-y-1 list-decimal list-inside">
                      <li>Abra seu app do banco</li>
                      <li>Escolha PIX e escaneie o código</li>
                      <li>Confirme o pagamento</li>
                      <li>Seu saldo será liberado automaticamente</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Status de verificação */}
              <div className={`border border-blue-200 rounded-xl p-3 ${
                isCheckingPayment ? 'bg-green-900 border-green-700' : 'bg-blue-900 border-blue-700'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {isCheckingPayment && (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <p className={`text-sm text-center font-medium ${
                    isCheckingPayment ? 'text-green-200' : 'text-blue-200'
                  }`}>
                    {isCheckingPayment
                      ? '🔄 Aguardando confirmação do pagamento...'
                      : '💡 Faça o pagamento e aguarde a confirmação automática!'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};