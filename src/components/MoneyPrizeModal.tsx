import React, { useState, useEffect } from 'react';
import { Play, Coins } from 'lucide-react';

interface MoneyPrizeModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
}

export const MoneyPrizeModal: React.FC<MoneyPrizeModalProps> = ({ isOpen, amount, onClose }) => {
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      const confettiTimeout = setTimeout(() => setConfetti(false), 5000);

      return () => clearTimeout(confettiTimeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-bounce ${
                i % 4 === 0 ? 'w-3 h-3 bg-accent' :
                i % 4 === 1 ? 'w-2 h-2 bg-green-400' :
                i % 4 === 2 ? 'w-4 h-4 bg-yellow-400' : 'w-2 h-2 bg-green-300'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
        <div className="bg-accent p-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/80"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">🎉 PARABÉNS! 🎉</h1>
            <p className="text-white/90 text-base">Você ganhou dinheiro!</p>
          </div>
        </div>

        <div className="p-4 text-center">
          <div className="bg-accent/20 rounded-2xl p-4 mb-4 border border-accent/50">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-3xl font-bold text-accent mb-2">
              R$ {amount.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-gray-600 font-medium">
              Adicionado ao seu saldo!
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Saldo atualizado automaticamente</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Continue jogando para ganhar mais</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Próximo prêmio pode ser o iPhone!</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-accent text-white font-bold py-3 rounded-2xl hover:bg-accent-hover transition-all duration-300 active:scale-95 shadow-modern"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              <span>CONTINUAR JOGANDO</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
