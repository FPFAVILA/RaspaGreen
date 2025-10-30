import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScratchCard as ScratchCardType, ScratchBlock } from '../types';
import { X, Sparkles, Trophy } from 'lucide-react';

interface ScratchCardProps {
  card: ScratchCardType;
  onComplete: (card: ScratchCardType) => void;
}

const WINNING_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
  [0, 4, 8], [2, 4, 6] // Diagonais
];

export const ScratchCard: React.FC<ScratchCardProps> = ({ card, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealedBlocks, setRevealedBlocks] = useState<Set<number>>(new Set());
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winningPattern, setWinningPattern] = useState<number[]>([]);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [showAllRevealed, setShowAllRevealed] = useState(false);
  const [showLoseMessage, setShowLoseMessage] = useState(false);
  const [loseMessage, setLoseMessage] = useState('');
  const [showResultDelay, setShowResultDelay] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const loseMessages = [
    "Você quase conseguiu! Tente novamente!",
    "Não foi dessa vez, continue tentando!",
    "Que pena! Mas não desista, a sorte pode mudar!",
    "Quase lá! A próxima pode ser a sua!",
    "Não desanime! Continue raspando!",
    "Tente mais uma vez, você está perto!",
    "A sorte está chegando! Continue jogando!"
  ];

  // Sair do modo fullscreen
  const exitFullscreen = useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);
    onComplete(card);
  }, [card, onComplete, isCompleting]);

  // Inicializar canvas
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasInitialized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Marcar como inicializado imediatamente para evitar duplicação
    setCanvasInitialized(true);

    // Configurar canvas com alta resolução
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Criar superfície de raspadinha mais atrativa
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(0.3, '#f59e0b');
    gradient.addColorStop(0.7, '#d97706');
    gradient.addColorStop(1, '#b45309');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Adicionar textura dourada
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 3 + 1;
      
      ctx.fillStyle = Math.random() > 0.5 ? '#fef3c7' : '#fbbf24';
      ctx.fillRect(x, y, size, size);
    }

    // Texto principal
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#78350f';
    ctx.font = `bold ${Math.min(rect.width * 0.08, 32)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('RASPE AQUI', rect.width / 2, rect.height / 2 - 10);
    
    ctx.font = `${Math.min(rect.width * 0.045, 18)}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#92400e';
    ctx.fillText('✨ Toque e arraste para revelar ✨', rect.width / 2, rect.height / 2 + 20);

    // Bordas decorativas
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, rect.width - 8, rect.height - 8);
  }, [canvasInitialized]);

  // Inicializar canvas na primeira renderização
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeCanvas();
    }, 100);
    return () => clearTimeout(timer);
  }, [initializeCanvas]);

  // Verificar padrão vencedor
  const checkWinningPattern = useCallback((revealed: Set<number>) => {
    if (revealed.size < 3) return null;
    
    for (const pattern of WINNING_PATTERNS) {
      if (pattern.every(index => revealed.has(index))) {
        const symbols = pattern.map(index => card.grid[index].symbol);
        if (symbols.every(symbol => symbol === symbols[0])) {
          return pattern;
        }
      }
    }
    return null;
  }, [card.grid]);

  // Função de raspar otimizada
  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized || isCompleting) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Verificar se está dentro dos limites
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Raspar área
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const scratchRadius = 35;
    ctx.arc(x, y, scratchRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Calcular porcentagem raspada
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) transparent++;
    }
    
    const percentage = (transparent / (imageData.data.length / 4)) * 100;
    setScratchedPercentage(percentage);

    // Revelar blocos baseado na posição
    const blockSize = rect.width / 3;
    const blockX = Math.floor(x / blockSize);
    const blockY = Math.floor(y / blockSize);
    const blockIndex = blockY * 3 + blockX;

    if (blockIndex >= 0 && blockIndex < 9) {
      setRevealedBlocks(prev => {
        const newRevealed = new Set(prev);
        newRevealed.add(blockIndex);
        
        // Verificar padrão vencedor
        const pattern = checkWinningPattern(newRevealed);
        if (pattern && card.hasWon) {
          setWinningPattern(pattern);
          setShowWinAnimation(true);
          
          // Revelar todos os blocos após delay para visualização
          setTimeout(() => {
            setShowAllRevealed(true);
            setTimeout(() => {
              setRevealedBlocks(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));
              setShowResultDelay(true);
            }, 800);
          }, 2500);
        }
        
        return newRevealed;
      });
    }

    // Auto-completar se mais de 60% foi raspado
    if (percentage > 60 && !showResultDelay) {
      setTimeout(() => {
        setShowAllRevealed(true);
        setTimeout(() => {
          setRevealedBlocks(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));
          setShowResultDelay(true);
        }, 500);
      }, 800);
    }
  }, [card.hasWon, checkWinningPattern, canvasInitialized, showResultDelay]);

  // Completar card quando todos os blocos estão revelados E após delay
  useEffect(() => {
    if (revealedBlocks.size === 9 && showResultDelay && !isCompleting) {
      setIsCompleting(true);
      const updatedCard = { ...card, isCompleted: true };

      if (!card.hasWon) {
        // Mostrar mensagem de incentivo se não ganhou
        const randomMessage = loseMessages[Math.floor(Math.random() * loseMessages.length)];
        setLoseMessage(randomMessage);
        setShowLoseMessage(true);

        setTimeout(() => {
          setShowLoseMessage(false);
          setTimeout(() => {
            onComplete(updatedCard);
          }, 500);
        }, 3000);
      } else {
        // Delay adicional para vitória para apreciar a animação
        setTimeout(() => {
          onComplete(updatedCard);
        }, 2000);
      }
    }
  }, [revealedBlocks.size, showResultDelay, card, onComplete, isCompleting]);

  // Event handlers para touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCompleting) return;
    e.preventDefault();
    e.stopPropagation();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isCompleting) return;
    e.preventDefault();
    e.stopPropagation();
    if (isScratching && e.touches.length === 1) {
      const touch = e.touches[0];
      scratch(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsScratching(false);
  };

  // Event handlers para mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCompleting) return;
    e.preventDefault();
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching && !isCompleting) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  return (
    <div className="fixed inset-0 bg-primary z-50 flex flex-col">
      {/* Header fullscreen melhorado */}
      <div className="bg-gray-900 backdrop-blur-xl p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-modern">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">
              Raspadinha Premium
            </h3>
            <p className="text-gray-300 text-sm">
              Encontre 3 símbolos iguais em sequência
            </p>
          </div>
        </div>
        <button
          onClick={exitFullscreen}
          className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all duration-300"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Área de jogo fullscreen melhorada */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div 
          ref={containerRef}
          className="relative w-full max-w-md aspect-square"
          style={{ touchAction: 'none' }}
        >
          {/* Grid de símbolos melhorado */}
          <div className="absolute inset-0 grid grid-cols-3 gap-3 bg-gray-800 rounded-3xl p-6 shadow-2xl border-2 border-gray-700">
            {card.grid.map((block, index) => (
              <div
                key={block.id}
                className={`flex items-center justify-center rounded-2xl border-2 transition-all duration-1000 ${
                  revealedBlocks.has(index) || showAllRevealed
                    ? 'opacity-100 scale-100 bg-accent border-accent shadow-2xl' 
                    : 'opacity-0 scale-75 bg-gray-900 border-gray-700'
                } ${
                  showWinAnimation && winningPattern.includes(index) 
                    ? 'animate-pulse ring-4 ring-accent shadow-glow-modern' 
                    : ''
                }`}
                style={{
                  boxShadow: (revealedBlocks.has(index) || showAllRevealed)
                    ? '0 0 30px rgba(1, 211, 117, 0.8)'
                    : undefined,
                  transform: showWinAnimation && winningPattern.includes(index)
                    ? 'scale(1.05)'
                    : undefined
                }}
              >
                {(revealedBlocks.has(index) || showAllRevealed) ? (
                  block.symbol.startsWith('/') ? (
                    <img
                      src={block.symbol}
                      alt="Prize"
                      className="w-14 h-14 object-contain drop-shadow-2xl filter brightness-110"
                      style={{ maxWidth: '3.5rem', maxHeight: '3.5rem' }}
                    />
                  ) : (
                    <span className="drop-shadow-2xl text-white filter brightness-110" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                      {block.symbol}
                    </span>
                  )
                ) : (
                  <span className="drop-shadow-2xl text-white filter brightness-110">?</span>
                )}
              </div>
            ))}
          </div>

          {/* Canvas de raspadinha */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full rounded-3xl select-none ${isCompleting ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
            style={{ touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Efeito de vitória melhorado */}
          {showWinAnimation && (
            <div className="absolute inset-0 rounded-3xl bg-accent/30 animate-pulse pointer-events-none">
              <div className="absolute inset-0 rounded-3xl border-4 border-accent animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-accent rounded-2xl px-6 py-3 border border-accent animate-bounce">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-white" />
                    <span className="text-white font-bold text-lg">PADRÃO VENCEDOR!</span>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de incentivo quando perde */}
          {showLoseMessage && (
            <div className="absolute inset-0 rounded-3xl bg-red-900/50 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-2xl px-6 py-4 border-2 border-orange-400 shadow-2xl animate-bounce max-w-xs mx-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">😔</div>
                    <p className="text-gray-800 font-bold text-base mb-1">{loseMessage}</p>
                    <p className="text-gray-600 text-sm">Continue jogando para ganhar!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer com progresso melhorado */}
      <div className="bg-gray-900 backdrop-blur-xl p-6 border-t border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 font-semibold text-lg">Progresso da Raspagem</span>
            <span className="text-white font-bold text-2xl">
              {Math.round(Math.max(scratchedPercentage, (revealedBlocks.size / 9) * 100))}%
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mb-3 border border-gray-600">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500 shadow-lg"
              style={{ 
                width: `${Math.max(scratchedPercentage, (revealedBlocks.size / 9) * 100)}%`,
                boxShadow: '0 0 20px rgba(1, 211, 117, 0.8)'
              }}
            ></div>
          </div>

          <div className="text-center">
            <p className="text-gray-300 text-lg font-medium">
              {revealedBlocks.size < 9 
                ? `${9 - revealedBlocks.size} símbolos restantes` 
                : "Todos os símbolos revelados!"
              }
            </p>
            
            {showWinAnimation && (
              <div className="bg-accent/20 rounded-xl p-3 border border-accent animate-pulse mt-3">
                <p className="text-accent text-lg font-bold">
                  🎉 Padrão vencedor encontrado! 🎉
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};