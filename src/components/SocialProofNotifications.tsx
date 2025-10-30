import React, { useState, useEffect } from 'react';
import { useSocialProof } from '../hooks/useSocialProof';
import { TrendingUp, X } from 'lucide-react';

export const SocialProofNotifications: React.FC = () => {
  const notifications = useSocialProof();
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  // Mostrar uma notificação por vez
  useEffect(() => {
    if (notifications.length > 0) {
      const notification = notifications[notificationIndex % notifications.length];
      
      // Mostrar notificação
      setCurrentNotification(notification);
      setIsVisible(true);
      
      // Esconder após 4 segundos
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      
      // Próxima notificação após 6 segundos
      const nextTimer = setTimeout(() => {
        setNotificationIndex(prev => prev + 1);
      }, 6000);
      
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(nextTimer);
      };
    }
  }, [notifications, notificationIndex]);

  if (!currentNotification || !isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-30 pointer-events-none">
      <div 
        className={`glass backdrop-blur-xl rounded-2xl shadow-modern border border-white/20 overflow-hidden max-w-xs w-full transform transition-all duration-500 ${
          isVisible ? 'translate-x-0 opacity-100 scale-100 animate-slide-in-right' : 'translate-x-full opacity-0 scale-95 animate-slide-out-right'
        }`}
      >
        {/* Header com gradiente */}
        <div className="bg-accent p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-2 h-2 text-white" />
              </div>
              <span className="text-white font-bold text-xs">🔥 Recente</span>
            </div>
            <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Conteúdo da notificação */}
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-modern">
              <span className="text-white text-sm">🎯</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs truncate">
                {currentNotification.user}
              </p>
              <p className="text-gray-300 font-medium text-xs truncate">
                {currentNotification.prize.includes('R$') 
                  ? `ganhou ${currentNotification.prize}!` 
                  : currentNotification.prize
                }
              </p>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0 bg-white/10 px-1.5 py-0.5 rounded-full">
              agora
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="h-0.5 bg-white/20">
          <div 
            className="h-full bg-accent transition-all duration-4000 ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
              animation: isVisible ? 'progressBar 4s linear' : 'none'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};