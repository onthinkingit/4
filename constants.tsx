
import { Translation } from './types';

export const TRANSLATIONS: Translation = {
  welcome: { en: 'Welcome to LudoCash', bn: 'লুডো-ক্যাশ এ স্বাগতম' },
  play_now: { en: 'Play Now', bn: 'এখন খেলুন' },
  wallet: { en: 'Wallet', bn: 'ওয়ালেট' },
  profile: { en: 'Profile', bn: 'প্রোফাইল' },
  settings: { en: 'Settings', bn: 'সেটিংস' },
  add_money: { en: 'Add Money', bn: 'টাকা যোগ করুন' },
  withdraw: { en: 'Withdraw', bn: 'টাকা তুলুন' },
  cash_balance: { en: 'Cash Balance', bn: 'ক্যাশ ব্যালেন্স' },
  bonus_balance: { en: 'Bonus Balance', bn: 'বোনাস ব্যালেন্স' },
  entry_fee: { en: 'Entry Fee', bn: 'এন্ট্রি ফি' },
  prize_pool: { en: 'Prize Pool', bn: 'পুরস্কার' },
  refer_earn: { en: 'Refer & Earn', bn: 'রেফার করুন ও ইনকাম করুন' },
  referral_id: { en: 'Your Referral ID', bn: 'আপনার রেফারেল আইডি' },
  admin_panel: { en: 'Admin Panel', bn: 'এডমিন প্যানেল' },
  total_users: { en: 'Total Users', bn: 'মোট ব্যবহারকারী' },
  total_commission: { en: 'Total Commission', bn: 'মোট কমিশন' },
  winner: { en: 'Winner', bn: 'বিজয়ী' },
  matchmaking: { en: 'Finding Opponents...', bn: 'প্রতিপক্ষ খোঁজা হচ্ছে...' },
  language_toggle: { en: 'Change Language', bn: 'ভাষা পরিবর্তন' },
};

export const ADMIN_CREDENTIALS = {
  phone: '01577378394',
  password: 'AnAmFJAaj@1'
};

export const GAME_CONFIG = {
  COMMISSION_RATE: 0.06,
  MIN_ENTRY: 10,
  MIN_WITHDRAWAL: 10,
  REFERRAL_REWARD: 15,
  DEPOSIT_BONUS_TIERS: [
    { threshold: 500, bonus: 0.02 },
    { threshold: 1000, bonus: 0.05 }
  ]
};
