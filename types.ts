
export type Language = 'en' | 'bn';

export enum UserLevel {
  SILVER = 'Silver',
  PLUTONIUM = 'Plutonium',
  GOLDEN = 'Golden',
  SUPER_MAN = 'Super Man'
}

export interface Wallet {
  cash: number;
  bonus: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  bonusUsed: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'GAME_ENTRY' | 'GAME_WIN' | 'REFERRAL_BONUS';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  date: string;
}

export interface User {
  id: string;
  phone: string;
  username: string;
  referralId: string;
  referredBy?: string;
  wallet: Wallet;
  matchesPlayed: number;
  wins: number;
  losses: number;
  status: 'ACTIVE' | 'BANNED';
  level: UserLevel;
  referredCount: number;
  totalReferralBonus: number;
}

export interface Match {
  id: string;
  players: string[]; // IDs
  winner?: string;
  entryFee: number;
  prizePool: number;
  mode: '2P' | '4P';
  status: 'WAITING' | 'PLAYING' | 'COMPLETED';
  startTime: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    bn: string;
  };
}
