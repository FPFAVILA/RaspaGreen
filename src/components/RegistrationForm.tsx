import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  Gift,
  Crown,
  Clock,
  Mail,
  User as UserIcon,
  Shield,
  CheckCircle,
  AlertCircle,
  Award
} from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (user: User) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [timeLeft, setTimeLeft] = useState(900);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerUrgency = () => {
    if (timeLeft <= 180) return 'critical';
    if (timeLeft <= 300) return 'high';
    if (timeLeft <= 600) return 'medium';
    return 'low';
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Nome é obrigatório';
        } else if (value.trim().length < 3) {
          newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          newErrors.name = 'Nome deve conter apenas letras';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'Senha é obrigatória';
        } else if (value.length < 6) {
          newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = { name: true, email: true, password: true };
    setTouched(allTouched);

    validateField('name', formData.name);
    validateField('email', formData.email);
    validateField('password', formData.password);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const user: User = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      registeredAt: new Date()
    };

    setShowSuccess(true);

    setTimeout(() => {
      onRegister(user);
    }, 1800);

    setIsSubmitting(false);
  };

  const timerUrgency = getTimerUrgency();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 my-4">
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl mx-2 sm:mx-0">
            <div className="bg-gradient-to-br from-accent to-accent-hover rounded-2xl p-5 sm:p-6 text-center animate-scale-in border border-white/30 shadow-2xl max-w-xs mx-4">
              <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white mx-auto mb-3 animate-bounce" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Cadastro realizado!</h2>

              <div className="bg-white/20 rounded-lg p-2.5 sm:p-3 mb-3">
                <div className="text-white/80 text-xs mb-0.5">Seu bônus</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">R$ 14,70</div>
              </div>

              <p className="text-white/80 text-xs flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Preparando sua conta...
              </p>
            </div>
          </div>
        )}

        <div className={`bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-800 ${showSuccess ? 'opacity-20' : ''} transition-opacity duration-500`}>
          <div className="bg-gradient-to-br from-accent via-accent to-accent-hover p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-2 shadow-2xl border-2 border-white/30">
                <Crown className="w-7 h-7 text-white animate-pulse" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-3 drop-shadow-2xl">
                Raspadinha<span className="text-yellow-300">PRO</span>
              </h1>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border-2 border-white/30 shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-yellow-300 animate-bounce" />
                  <span className="text-white font-bold text-sm drop-shadow-lg">BÔNUS EXCLUSIVO</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1 drop-shadow-2xl">
                  R$ 14,70
                </div>
                <div className="text-white/90 text-sm font-medium drop-shadow-lg">
                  + 3 Raspadinhas Grátis
                </div>
              </div>
            </div>
          </div>

          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800 ${
            timerUrgency === 'critical' ? 'bg-red-500/10' :
            timerUrgency === 'high' ? 'bg-orange-500/10' :
            'bg-gray-800/50'
          }`}>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base flex-wrap">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 flex-shrink-0" />
              <span className="text-white/80 font-medium">Oferta expira em:</span>
              <span className={`font-mono font-bold text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-base sm:text-lg ${
                timerUrgency === 'critical' ? 'bg-red-500/20 animate-pulse' : 'bg-white/10'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                  <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${
                    focusedField === 'name' ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => handleFieldBlur('name')}
                    className={`w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 sm:py-4 bg-gray-800/50 rounded-xl border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg ${
                      errors.name && touched.name
                        ? 'border-red-500 bg-red-500/10'
                        : focusedField === 'name'
                        ? 'border-accent bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="Nome completo"
                    autoComplete="name"
                  />
                  {formData.name && !errors.name && touched.name && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-pulse" />
                  )}
                </div>
                {errors.name && touched.name && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slide-in-right">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${
                    focusedField === 'email' ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => handleFieldBlur('email')}
                    className={`w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 sm:py-4 bg-gray-800/50 rounded-xl border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg ${
                      errors.email && touched.email
                        ? 'border-red-500 bg-red-500/10'
                        : focusedField === 'email'
                        ? 'border-accent bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="seu@email.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                  {formData.email && !errors.email && touched.email && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-pulse" />
                  )}
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slide-in-right">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                  <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${
                    focusedField === 'password' ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => handleFieldBlur('password')}
                    className={`w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 sm:py-4 bg-gray-800/50 rounded-xl border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg ${
                      errors.password && touched.password
                        ? 'border-red-500 bg-red-500/10'
                        : focusedField === 'password'
                        ? 'border-accent bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="Senha (mínimo 6 caracteres)"
                    autoComplete="new-password"
                  />
                  {formData.password && !errors.password && touched.password && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-pulse" />
                  )}
                </div>
                {errors.password && touched.password && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slide-in-right">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || timeLeft === 0}
                className="w-full bg-gradient-to-r from-accent via-accent to-accent-hover text-white font-bold py-4 sm:py-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-accent/50 relative overflow-hidden group mt-6 sm:mt-8 text-base sm:text-lg"
                style={{ touchAction: 'manipulation' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : timeLeft === 0 ? (
                    <span>Oferta Expirada</span>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce flex-shrink-0" />
                      <span className="drop-shadow-lg">
                        {timerUrgency === 'critical' ? 'GARANTIR AGORA!' : 'GARANTIR BÔNUS'}
                      </span>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-accent/50 hover:bg-gray-800/70 transition-all duration-300 cursor-default">
                <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-accent mx-auto mb-1.5 sm:mb-2 transition-transform duration-300 hover:scale-110" />
                <div className="text-white text-xs sm:text-sm font-medium leading-tight">Prêmios Reais</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-accent/50 hover:bg-gray-800/70 transition-all duration-300 cursor-default">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-accent mx-auto mb-1.5 sm:mb-2 transition-transform duration-300 hover:scale-110" />
                <div className="text-white text-xs sm:text-sm font-medium leading-tight">Plataforma Regularizada</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-accent/50 hover:bg-gray-800/70 transition-all duration-300 cursor-default">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-accent mx-auto mb-1.5 sm:mb-2 transition-transform duration-300 hover:scale-110" />
                <div className="text-white text-xs sm:text-sm font-medium leading-tight">Seguro</div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-center">Dados protegidos com criptografia SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
