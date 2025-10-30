import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Trophy, Smartphone, Watch, Headphones, DollarSign, Gift } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  value: string;
  emoji?: string;
  image?: string;
  gradient: string;
  type: 'apple' | 'money';
  icon: React.ReactNode;
  description: string;
}

export const PrizesSection: React.FC = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(true); // Sempre expandida

  // Memoizar os prêmios para evitar recriação desnecessária
  const prizes = useMemo<Prize[]>(() => [
    {
      id: 'iphone15',
      name: 'iPhone 15',
      value: 'R$ 7.299',
      image: '/Apple-iPhone-15-Pro-Max-Blue-Titanium-frontimage.webp',
      gradient: 'bg-gray-800',
      type: 'apple',
      icon: <Smartphone className="w-4 h-4" />,
      description: '128GB - Todas as cores'
    },
    {
      id: 'iphone13promax',
      name: 'iPhone 13 Pro Max',
      value: 'R$ 4.899',
      image: '/iphone_13_PNG31.png',
      gradient: 'bg-gray-600',
      type: 'apple',
      icon: <Smartphone className="w-4 h-4" />,
      description: '128GB - Prata'
    },
    {
      id: 'iphone14',
      name: 'iPhone 14',
      value: 'R$ 5.999',
      image: '/pngimg.com - iphone_14_PNG41.png',
      gradient: 'bg-gray-700',
      type: 'apple',
      icon: <Smartphone className="w-4 h-4" />,
      description: '128GB - Preto/Branco'
    },
    {
      id: 'iphone11',
      name: 'iPhone 11',
      value: 'R$ 2.499',
      image: '/iphone_11_PNG20.png',
      gradient: 'bg-blue-600',
      type: 'apple',
      icon: <Smartphone className="w-4 h-4" />,
      description: '128GB - Várias cores'
    },
    {
      id: 'applewatch',
      name: 'Apple Watch',
      value: 'R$ 1.299',
      image: '/Apple-Watch-PNG-High-Quality-Image.png',
      gradient: 'bg-blue-700',
      type: 'apple',
      icon: <Watch className="w-4 h-4" />,
      description: 'Series 9 - 45mm'
    },
    {
      id: 'airpods',
      name: 'AirPods Pro',
      value: 'R$ 1.899',
      image: '/Airpods-Transparent-Images-PNG.png',
      gradient: 'bg-purple-600',
      type: 'apple',
      icon: <Headphones className="w-4 h-4" />,
      description: '2ª Geração - USB-C'
    },
    {
      id: 'money500',
      name: 'R$ 500',
      value: 'R$ 500',
      emoji: '💵',
      gradient: 'bg-green-600',
      type: 'money',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Dinheiro via PIX'
    },
    {
      id: 'money300',
      name: 'R$ 300',
      value: 'R$ 300',
      emoji: '💰',
      gradient: 'bg-green-500',
      type: 'money',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Dinheiro via PIX'
    },
    {
      id: 'money200',
      name: 'R$ 200',
      value: 'R$ 200',
      emoji: '💸',
      gradient: 'bg-green-500',
      type: 'money',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Dinheiro via PIX'
    },
    {
      id: 'money100',
      name: 'R$ 100',
      value: 'R$ 100',
      emoji: '🪙',
      gradient: 'bg-yellow-500',
      type: 'money',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Dinheiro via PIX'
    },
    {
      id: 'money50',
      name: 'R$ 50',
      value: 'R$ 50',
      emoji: '🤑',
      gradient: 'bg-teal-500',
      type: 'money',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Dinheiro via PIX'
    },
    {
      id: 'money30',
      name: 'R$ 30',
      value: 'R$ 30',
      emoji: '💎',
      gradient: 'bg-lime-500',
      type: 'money',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Dinheiro via PIX'
    }
  ], []);

  // Separar prêmios por tipo usando useMemo para otimização
  const { applePrizes, moneyPrizes } = useMemo(() => ({
    applePrizes: prizes.filter(p => p.type === 'apple'),
    moneyPrizes: prizes.filter(p => p.type === 'money')
  }), [prizes]);

  // Usar useCallback para evitar recriação da função
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Componente otimizado para item de prêmio
  const PrizeItem = React.memo<{ prize: Prize; isGrid?: boolean }>(({ prize, isGrid = false }) => (
    <div 
      className={`bg-gray-800 rounded-xl p-3 border border-gray-700 hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer ${
        isGrid ? 'text-center' : 'flex items-center gap-3'
      }`}
    >
      {isGrid ? (
        <>
          <div className={`w-10 h-10 ${prize.gradient} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
            {prize.image ? (
              <img src={prize.image} alt={prize.name} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-lg filter drop-shadow-lg">
                {prize.emoji}
              </span>
            )}
          </div>
          <h5 className="text-white font-bold text-sm mb-1">{prize.name}</h5>
          <p className="text-gray-300 text-xs mb-2">{prize.description}</p>
          <div className="bg-accent text-white px-2 py-1 rounded-full text-xs font-bold">
            {prize.type === 'money' ? 'PIX Instantâneo' : prize.value}
          </div>
        </>
      ) : (
        <>
          <div className={`w-12 h-12 ${prize.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            {prize.image ? (
              <img src={prize.image} alt={prize.name} className="w-10 h-10 object-contain" />
            ) : (
              <span className="text-xl filter drop-shadow-lg">
                {prize.emoji}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-accent rounded-lg flex items-center justify-center text-white">
                {prize.icon}
              </div>
              <h5 className="text-white font-bold text-sm truncate">{prize.name}</h5>
            </div>
            <p className="text-gray-300 text-xs mb-2">{prize.description}</p>
            <div className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold inline-block shadow-lg">
              {prize.value}
            </div>
          </div>
        </>
      )}
    </div>
  ));

  return (
    <div className="mx-4 mb-4">
      <div className="bg-gray-900 backdrop-blur-2xl rounded-3xl shadow-modern border border-gray-800 overflow-hidden">
        {/* Header Clicável Otimizado */}
        <button
          onClick={toggleExpanded}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors duration-200 active:scale-[0.99]"
          style={{ touchAction: 'manipulation' }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Fechar prêmios' : 'Ver prêmios disponíveis'}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-modern">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold text-base">Prêmios Disponíveis</h3>
              <p className="text-gray-300 text-sm">
                {prizes.length} prêmios incríveis te esperando
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-accent text-white px-2 py-1 rounded-full text-xs font-bold">
              🔥 ATIVO
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white transition-transform duration-200" />
            )}
          </div>
        </button>

        {/* Conteúdo Expansível Otimizado */}
        <div className="px-4 pb-4">
          <div className="border-t border-gray-700 pt-4">
            
            {/* Produtos Apple - Sempre Visível */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">🍎</span>
                </div>
                <h4 className="text-white font-bold text-sm">🏆 Produtos Apple Premium</h4>
              </div>
              
              {/* Mostrar apenas os 3 primeiros prêmios Apple */}
              <div className="space-y-2">
                {applePrizes.slice(0, 3).map((prize) => (
                  <PrizeItem key={prize.id} prize={prize} />
                ))}
              </div>
            </div>

            {/* Prêmios em Dinheiro - Sempre Visível */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center shadow-lg">
                  <DollarSign className="w-3 h-3 text-white" />
                </div>
                <h4 className="text-white font-bold text-sm">💰 Prêmios em Dinheiro</h4>
              </div>
              
              {/* Grid 2x2 para os primeiros 4 prêmios em dinheiro */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {moneyPrizes.slice(0, 4).map((prize) => (
                  <PrizeItem key={prize.id} prize={prize} isGrid />
                ))}
              </div>
            </div>

            {/* Área de Scroll para Prêmios Restantes */}
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent touch-pan-y overscroll-contain">
              <div className="border-t border-gray-700 pt-4">
                <h5 className="text-white/80 font-bold text-xs mb-3 text-center">📜 Mais Prêmios Disponíveis</h5>
                
                {/* Produtos Apple Restantes */}
                {applePrizes.length > 3 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/60 text-xs">🍎 Mais Produtos Apple</span>
                    </div>
                    <div className="space-y-2">
                      {applePrizes.slice(3).map((prize) => (
                        <PrizeItem key={prize.id} prize={prize} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Prêmios em Dinheiro Restantes */}
                {moneyPrizes.length > 4 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/60 text-xs">💰 Mais Prêmios em Dinheiro</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {moneyPrizes.slice(4).map((prize) => (
                        <PrizeItem key={prize.id} prize={prize} isGrid />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer da Seção - Sempre Visível */}
            <div className="bg-accent/20 rounded-xl p-3 border border-accent/50 shadow-lg mt-4">
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-bold">
                  ✨ Todos os prêmios são reais e verificados ✨
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-accent">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Entrega garantida</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Produtos originais</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PrizesSection.displayName = 'PrizesSection';