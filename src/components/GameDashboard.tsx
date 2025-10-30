import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useGameState } from '../hooks/useGameState';
import { ScratchCard } from './ScratchCard';
import { AddBalanceModal } from './AddBalanceModal';
import { WinningScreen } from './WinningScreen';
import { WithdrawModal } from './WithdrawModal';
import { SocialProofNotifications } from './SocialProofNotifications';
import { PrizesSection } from './PrizesSection';
import { MoneyPrizeModal } from './MoneyPrizeModal';
import { KYCVerificationModal } from './KYCVerificationModal';
import {
  Play,
  Plus,
  Crown,
  Zap,
  Banknote,
  Gift
} from 'lucide-react';

interface GameDashboardProps {
  user: User | null;
}


export const GameDashboard: React.FC<GameDashboardProps> = ({ user }) => {
  const [hasValidRegistration, setHasValidRegistration] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const [showBonusNotification, setShowBonusNotification] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Verificar se o usuário passou pelo fluxo correto de cadastro
  useEffect(() => {
    const validRegistration = localStorage.getItem('raspadinha_valid_registration');
    const hasUser = localStorage.getItem('raspadinha_user_data');
    const hasGameState = localStorage.getItem('raspadinha_game_state');
    const hasRegistrationBonus = localStorage.getItem('raspadinha_registration_bonus');

    if (validRegistration === 'true' && hasUser && hasGameState) {
      setHasValidRegistration(true);

      // Mostrar notificação de bônus se for novo cadastro
      if (hasRegistrationBonus === 'true') {
        setTimeout(() => {
          setShowBonusNotification(true);
          // Remover flag do localStorage
          localStorage.removeItem('raspadinha_registration_bonus');
          // Esconder após 4 segundos
          setTimeout(() => {
            setShowBonusNotification(false);
          }, 4000);
        }, 1000);
      }
    } else {
      // Se não tem registro válido, limpar tudo e redirecionar
      localStorage.removeItem('raspadinha_user_data');
      localStorage.removeItem('raspadinha_game_state');
      localStorage.removeItem('raspadinha_registration_bonus');
      localStorage.removeItem('raspadinha_valid_registration');
      setHasValidRegistration(false);
    }
    setIsCheckingRegistration(false);

    // Delay para permitir carregamento suave
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 300);
  }, []);

  const { gameState, startNewCard, completeCard, addBalance, updateKYCStatus } = useGameState();
  const CARD_COST = 4.90;
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showWinningScreen, setShowWinningScreen] = useState(false);
  const [showMoneyPrizeModal, setShowMoneyPrizeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [wonAmount, setWonAmount] = useState(0);
  const [isPlayingCard, setIsPlayingCard] = useState(false);

  useEffect(() => {
    const hasRedeemedIphone = localStorage.getItem('iphone_redeemed') === 'true';
    const hasShownWinning = localStorage.getItem('iphone_winning_shown') === 'true';

    if (gameState.hasWonIphone && !hasRedeemedIphone && !hasShownWinning) {
      localStorage.setItem('iphone_winning_shown', 'true');
      setShowWinningScreen(true);
    }
  }, [gameState.hasWonIphone]);

  const canPlay = gameState.balance >= CARD_COST;
  const missingAmount = canPlay ? 0 : CARD_COST - gameState.balance;

  const getSuggestedAmount = () => {
    if (!canPlay) {
      return Math.max(missingAmount, 1);
    }
    return 14.70;
  };

  const handlePlayGame = () => {
    if (isPlayingCard) return;

    if (!canPlay) {
      setShowAddBalanceModal(true);
      return;
    }

    setIsPlayingCard(true);
    const card = startNewCard();
    if (card) {
      setCurrentCard(card);
    } else {
      setIsPlayingCard(false);
    }
  };

  const handleCardComplete = (card: any) => {
    setCurrentCard(null);
    setIsPlayingCard(false);
    completeCard(card);

    if (card.hasWon) {
      if (card.prizeType === 'applewatch') {
        setShowWinningScreen(true);
      } else if (card.prizeType === 'money' && card.prizeAmount && card.prizeAmount > 0) {
        setWonAmount(card.prizeAmount);
        setShowMoneyPrizeModal(true);
      }
    }
  };

  const handleAddBalance = (amount: number) => {
    addBalance(amount);
    setShowAddBalanceModal(false);
  };

  const handleWithdraw = (amount: number) => {
    const currentBalance = gameState.balance;
    const newBalance = parseFloat((currentBalance - amount).toFixed(2));

    const updatedGameState = {
      ...gameState,
      balance: newBalance
    };

    localStorage.setItem('raspadinha_game_state', JSON.stringify(updatedGameState));
    setShowWithdrawModal(false);
    window.location.reload();
  };
  const handleCloseMoneyPrizeModal = () => {
    if (!showMoneyPrizeModal) return;
    setShowMoneyPrizeModal(false);
    setWonAmount(0);
  };

  const handleOpenKYC = () => {
    setShowKYCModal(true);
  };

  const handleUpdateKYC = (kycStatus: any) => {
    updateKYCStatus(kycStatus);
  };

  const handleOpenDepositFromKYC = () => {
    setShowKYCModal(false);
    setShowAddBalanceModal(true);
  };


  // Se está jogando, mostrar raspadinha
  if (currentCard) {
    return <ScratchCard card={currentCard} onComplete={handleCardComplete} />;
  }

  // Se está verificando registro, mostrar loading
  if (isCheckingRegistration) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">Verificando cadastro...</p>
        </div>
      </div>
    );
  }

  // Se não tem registro válido, mostrar mensagem de acesso negado
  if (!hasValidRegistration) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md text-center border border-white/20">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
          <p className="text-white/80">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  // Se ganhou iPhone, mostrar tela de vitória
  if (showWinningScreen) {
    return <WinningScreen user={user} onClose={() => setShowWinningScreen(false)} onAddToBalance={addBalance} />;
  }

  return (
    <div className={`min-h-screen bg-primary safe-area-top safe-area-bottom transition-opacity duration-300 ${isInitialLoad ? 'opacity-0' : 'opacity-100'}`}>
      {/* Notificação de Bônus */}
      {showBonusNotification && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-in-down">
          <div className="bg-gradient-to-r from-accent to-accent-hover rounded-2xl p-4 shadow-2xl border border-white/20 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Bônus Creditado!</p>
                <p className="text-white/90 text-xs">R$ 14,70 + 3 raspadinhas</p>
              </div>
              <button
                onClick={() => setShowBonusNotification(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header com informações do usuário */}
      <div className="bg-gray-900 backdrop-blur-xl p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-modern">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">
                Olá, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-300 text-sm">
                Bem-vindo de volta ao jogo
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-accent/20 rounded-xl px-3 py-1 border border-accent/50">
              <span className="text-accent text-xs font-bold">🔥 ATIVO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 pb-32">
        {/* Saldo Display */}
        <div className="mx-4 mt-6 mb-6">
          <div className="bg-gray-900 backdrop-blur-2xl rounded-3xl shadow-modern p-6 relative overflow-hidden border border-gray-800">
            {/* Background Effects Premium */}
            <div className="absolute inset-0 bg-accent/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-4">
                <p className="text-gray-300 text-sm font-semibold mb-2">
                  Saldo Disponível
                </p>
                <div className="text-4xl font-bold text-white">
                  R$ {gameState.balance.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowAddBalanceModal(true)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-700 transition-all duration-300 active:scale-95 border border-gray-700"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-bold">Adicionar Saldo</span>
                </button>

                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-700 transition-all duration-300 active:scale-95 border border-gray-700 font-bold"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Sacar Saldo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Promocional */}
        <div className="mx-4 mt-6 mb-6">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <img
              src="/1752250181.webp"
              alt="Banner Promocional"
              className="w-full h-auto object-cover"
            />

            {/* Barra inferior verde */}
            <div className="absolute bottom-0 left-0 right-0 bg-accent py-2 px-4">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm uppercase tracking-wide">AO VIVO</span>
                </div>
                <span className="text-white/90 text-sm font-semibold">Jogadores ganhando agora!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Prêmios */}
        <PrizesSection />
      </div>

      {/* Botão de Jogar Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 backdrop-blur-xl border-t border-gray-800 p-4 safe-area-bottom">
        <button
          onClick={handlePlayGame}
          disabled={isPlayingCard}
          className={`w-full font-bold py-5 rounded-2xl transition-all duration-300 shadow-modern text-lg relative overflow-hidden ${
            isPlayingCard
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
              : canPlay
              ? 'bg-accent text-white hover:bg-accent-hover hover-lift active:scale-95'
              : 'bg-orange-600 text-white hover:bg-orange-700 hover-lift active:scale-95'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          {canPlay ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">JOGAR AGORA</div>
                <div className="text-sm opacity-90">R$ {CARD_COST.toFixed(2).replace('.', ',')} por jogo</div>
              </div>
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Plus className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-xl">ADICIONAR SALDO</div>
                <div className="text-sm opacity-90">Faltam R$ {missingAmount.toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Modals */}
      <AddBalanceModal
        isOpen={showAddBalanceModal}
        onClose={() => setShowAddBalanceModal(false)}
        onAddBalance={handleAddBalance}
        suggestedAmount={getSuggestedAmount()}
        message={!canPlay ? (
          `Você precisa de mais R$ ${missingAmount.toFixed(2).replace('.', ',')} para jogar a próxima rodada`
        ) : undefined}
      />

      <MoneyPrizeModal
        isOpen={showMoneyPrizeModal}
        amount={wonAmount}
        onClose={handleCloseMoneyPrizeModal}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        balance={gameState.balance}
        kycStatus={gameState.kycStatus}
        onOpenKYC={handleOpenKYC}
      />

      <KYCVerificationModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        kycStatus={gameState.kycStatus || { isVerified: false, identityVerified: false, depositVerified: false }}
        onUpdateKYC={handleUpdateKYC}
        onOpenDepositModal={handleOpenDepositFromKYC}
      />
      {/* Notificações Sociais */}
      <SocialProofNotifications />
    </div>
  );
};