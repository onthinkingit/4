
import { User, UserLevel, Transaction, Match } from '../types';
import { GAME_CONFIG, ADMIN_CREDENTIALS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'ludo_users',
  TRANSACTIONS: 'ludo_transactions',
  MATCHES: 'ludo_matches',
  ADMIN_LOGS: 'ludo_admin_logs',
  CURRENT_USER: 'ludo_current_user'
};

export const getStoredUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getTransactions = (): Transaction[] => {
  const txs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return txs ? JSON.parse(txs) : [];
};

export const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
  const txs = getTransactions();
  const newTx: Transaction = {
    ...tx,
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    status: 'SUCCESS'
  };
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...txs, newTx]));
  return newTx;
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const calculateLevel = (wins: number, played: number): UserLevel => {
  if (played === 0) return UserLevel.SILVER;
  const winRate = (wins / played) * 100;
  if (winRate <= 30) return UserLevel.SILVER;
  if (winRate <= 50) return UserLevel.PLUTONIUM;
  if (winRate <= 80) return UserLevel.GOLDEN;
  return UserLevel.SUPER_MAN;
};

export const registerUser = (phone: string, referralId?: string): User => {
  const users = getStoredUsers();
  const existing = users.find(u => u.phone === phone);
  if (existing) return existing;

  const newUser: User = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    phone,
    username: 'Player_' + phone.slice(-4),
    referralId: Math.random().toString(36).substr(2, 6).toUpperCase(),
    referredBy: referralId,
    wallet: { cash: 0, bonus: 0 },
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    status: 'ACTIVE',
    level: UserLevel.SILVER,
    referredCount: 0,
    totalReferralBonus: 0
  };

  if (referralId) {
    const referrerIndex = users.findIndex(u => u.referralId === referralId);
    if (referrerIndex !== -1) {
      users[referrerIndex].wallet.bonus += GAME_CONFIG.REFERRAL_REWARD;
      users[referrerIndex].referredCount += 1;
      users[referrerIndex].totalReferralBonus += GAME_CONFIG.REFERRAL_REWARD;
      
      // Log referral transaction
      addTransaction({
        userId: users[referrerIndex].id,
        amount: GAME_CONFIG.REFERRAL_REWARD,
        bonusUsed: 0,
        type: 'REFERRAL_BONUS'
      });
    }
  }

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  return newUser;
};

export const depositMoney = (userId: string, amount: number) => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  let bonus = 0;
  for (const tier of [...GAME_CONFIG.DEPOSIT_BONUS_TIERS].reverse()) {
    if (amount >= tier.threshold) {
      bonus = amount * tier.bonus;
      break;
    }
  }

  users[index].wallet.cash += amount;
  users[index].wallet.bonus += bonus;
  saveUsers(users);

  addTransaction({
    userId,
    amount,
    bonusUsed: 0,
    type: 'DEPOSIT'
  });

  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[index]));
  }

  return users[index];
};
