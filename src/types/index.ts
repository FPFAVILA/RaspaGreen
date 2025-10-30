export interface User {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
}

export interface GameState {
  balance: number;
  scratchCardsUsed: number;
  hasWonIphone: boolean;
  kycStatus?: KYCStatus;
}

export interface KYCStatus {
  isVerified: boolean;
  identityVerified: boolean;
  depositVerified: boolean;
  cpf?: string;
  fullName?: string;
  birthDate?: string;
}

export interface ScratchCard {
  id: string;
  cost: number;
  grid: ScratchBlock[];
  isCompleted: boolean;
  hasWon: boolean;
  prizeAmount?: number;
  prizeType?: 'money' | 'iphone' | 'applewatch';
}

export interface ScratchBlock {
  id: number;
  isRevealed: boolean;
  symbol: string;
  position: { x: number; y: number };
}

export interface SocialProofNotification {
  id: string;
  user: string;
  prize: string;
  timestamp: Date;
}