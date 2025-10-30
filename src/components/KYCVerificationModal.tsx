import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Shield, User, CreditCard, ChevronRight } from 'lucide-react';
import { KYCStatus } from '../types';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycStatus: KYCStatus;
  onUpdateKYC: (status: KYCStatus) => void;
  onOpenDepositModal: () => void;
}

export const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({
  isOpen,
  onClose,
  kycStatus,
  onUpdateKYC,
  onOpenDepositModal
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    cpf: kycStatus.cpf || '',
    fullName: kycStatus.fullName || '',
    birthDate: kycStatus.birthDate || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (kycStatus.identityVerified && !kycStatus.depositVerified) {
        setCurrentStep(2);
      } else if (!kycStatus.identityVerified) {
        setCurrentStep(1);
      }
    }
  }, [isOpen, kycStatus]);

  if (!isOpen) return null;

  const progress = kycStatus.identityVerified && kycStatus.depositVerified ? 100 :
                   kycStatus.identityVerified ? 50 : 0;

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
    if (errors.cpf) setErrors({ ...errors, cpf: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cpf || !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = formData.birthDate.match(dateRegex);

      if (!match) {
        newErrors.birthDate = 'Data inválida (DD/MM/AAAA)';
      } else {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        const currentYear = new Date().getFullYear();

        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > currentYear) {
          newErrors.birthDate = 'Data inválida';
        } else if (currentYear - year < 18) {
          newErrors.birthDate = 'Você deve ter 18 anos ou mais';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Complete = () => {
    if (validateStep1()) {
      const updatedKYC: KYCStatus = {
        ...kycStatus,
        identityVerified: true,
        cpf: formData.cpf,
        fullName: formData.fullName,
        birthDate: formData.birthDate
      };
      onUpdateKYC(updatedKYC);
      setCurrentStep(2);
    }
  };

  const handleOpenDeposit = () => {
    onClose();
    onOpenDepositModal();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md border border-gray-800 animate-slideUp overflow-hidden">
        <div className="bg-gradient-to-r from-accent to-accent-hover p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Verificação KYC</h2>
                <p className="text-white/80 text-sm">Complete para liberar saques</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-semibold">Progresso</span>
                <span className="text-white text-sm font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 mb-6">
            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              currentStep === 1 ? 'bg-accent/10 border-accent' :
              kycStatus.identityVerified ? 'bg-green-500/10 border-green-500' :
              'bg-gray-800 border-gray-700'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                kycStatus.identityVerified ? 'bg-green-500' :
                currentStep === 1 ? 'bg-accent' : 'bg-gray-700'
              }`}>
                {kycStatus.identityVerified ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">Etapa 1 - Identidade</h3>
                <p className="text-gray-400 text-sm">
                  {kycStatus.identityVerified ? 'Verificado ✓' : 'CPF, nome e data de nascimento'}
                </p>
              </div>
              {currentStep === 1 && !kycStatus.identityVerified && (
                <ChevronRight className="w-5 h-5 text-accent" />
              )}
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              currentStep === 2 ? 'bg-accent/10 border-accent' :
              kycStatus.depositVerified ? 'bg-green-500/10 border-green-500' :
              'bg-gray-800 border-gray-700'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                kycStatus.depositVerified ? 'bg-green-500' :
                currentStep === 2 ? 'bg-accent' : 'bg-gray-700'
              }`}>
                {kycStatus.depositVerified ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <CreditCard className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">Etapa 2 - Depósito</h3>
                <p className="text-gray-400 text-sm">
                  {kycStatus.depositVerified ? 'Verificado ✓' : 'Depósito mínimo de verificação'}
                </p>
              </div>
              {currentStep === 2 && !kycStatus.depositVerified && (
                <ChevronRight className="w-5 h-5 text-accent" />
              )}
            </div>
          </div>

          {currentStep === 1 && !kycStatus.identityVerified && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-300 text-sm">
                    Seus dados estão protegidos e serão usados apenas para verificação de identidade.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2 text-sm">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className={`w-full bg-gray-800 border ${errors.cpf ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.cpf && (
                  <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Nome Completo</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Seu nome completo"
                  className={`w-full bg-gray-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Data de Nascimento</label>
                <input
                  type="text"
                  value={formData.birthDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2);
                    }
                    if (value.length >= 5) {
                      value = value.slice(0, 5) + '/' + value.slice(5, 9);
                    }
                    handleInputChange('birthDate', value);
                  }}
                  maxLength={10}
                  placeholder="DD/MM/AAAA"
                  className={`w-full bg-gray-800 border ${errors.birthDate ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.birthDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>
                )}
              </div>

              <button
                onClick={handleStep1Complete}
                className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent-hover transition-all duration-300 active:scale-95"
              >
                Continuar
              </button>
            </div>
          )}

          {currentStep === 2 && kycStatus.identityVerified && !kycStatus.depositVerified && (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 text-sm font-semibold mb-2">
                      Por que preciso fazer um depósito?
                    </p>
                    <p className="text-yellow-300/80 text-xs">
                      O depósito deve ser feito pelo titular da conta. Essa etapa serve para confirmar sua identidade e liberar saques com segurança. É uma medida de proteção contra fraudes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Depósito de Verificação</h3>
                  <p className="text-gray-400 text-sm">
                    Faça um depósito de qualquer valor para verificar sua conta e liberar saques
                  </p>
                </div>

                <button
                  onClick={handleOpenDeposit}
                  className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent-hover transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Fazer Depósito de Verificação
                </button>
              </div>

              <p className="text-center text-gray-500 text-xs">
                Após o depósito, sua conta será verificada automaticamente
              </p>
            </div>
          )}

          {kycStatus.isVerified && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Verificação Completa!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Sua conta está totalmente verificada. Agora você pode realizar saques a qualquer momento.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent-hover transition-all duration-300 active:scale-95"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
