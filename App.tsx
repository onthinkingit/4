
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, User, Transaction, Match, UserLevel } from './types';
import { TRANSLATIONS, GAME_CONFIG, ADMIN_CREDENTIALS } from './constants';
import { 
  getStoredUsers, 
  getCurrentUser, 
  registerUser, 
  depositMoney, 
  getTransactions, 
  logout,
  calculateLevel,
  saveUsers
} from './services/mockDatabase';
import { LanguageToggle } from './components/LanguageToggle';
import { LudoBoard } from './components/LudoBoard';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [view, setView] = useState<'HOME' | 'WALLET' | 'MATCH' | 'ADMIN' | 'AUTH' | 'PROFILE' | 'LOBBY'>('AUTH');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [phoneInput, setPhoneInput] = useState('');
  const [refInput, setRefInput] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Matchmaking & Game State
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState(0); // Index of player in matchData.players

  const t = useCallback((key: string) => TRANSLATIONS[key]?.[lang] || key, [lang]);

  useEffect(() => {
    if (user) {
      if (user.phone === ADMIN_CREDENTIALS.phone) {
        // Wait for explicit admin login check
      } else {
        setView('HOME');
      }
    }
  }, [user]);

  const handleAuth = () => {
    if (phoneInput.length < 10) return alert('Enter valid phone number');
    
    if (phoneInput === ADMIN_CREDENTIALS.phone) {
      if (adminPassword === ADMIN_CREDENTIALS.password) {
        const adminUser = registerUser(phoneInput);
        setUser(adminUser);
        setView('ADMIN');
      } else {
        alert('Invalid admin credentials');
      }
      return;
    }

    const registered = registerUser(phoneInput, authMode === 'REGISTER' ? refInput : undefined);
    setUser(registered);
    setView('HOME');
  };

  const startMatchmaking = (mode: '2P' | '4P', fee: number) => {
    if (!user) return;
    const totalBalance = user.wallet.cash + user.wallet.bonus;
    if (totalBalance < fee) return alert('Insufficient balance');

    setMatchmaking(true);
    // Deduct fee (Bonus first)
    const users = getStoredUsers();
    const uIdx = users.findIndex(u => u.id === user.id);
    let remainingFee = fee;
    let bonusUsed = 0;
    
    if (users[uIdx].wallet.bonus >= remainingFee) {
      users[uIdx].wallet.bonus -= remainingFee;
      bonusUsed = remainingFee;
      remainingFee = 0;
    } else {
      bonusUsed = users[uIdx].wallet.bonus;
      remainingFee -= users[uIdx].wallet.bonus;
      users[uIdx].wallet.bonus = 0;
      users[uIdx].wallet.cash -= remainingFee;
    }
    
    saveUsers(users);
    setUser(users[uIdx]);

    // Simulate matchmaking
    setTimeout(() => {
      const players = mode === '2P' ? [user.id, 'Bot_1'] : [user.id, 'Bot_1', 'Bot_2', 'Bot_3'];
      const prizePool = (fee * players.length) * (1 - GAME_CONFIG.COMMISSION_RATE);
      
      const newMatch: Match = {
        id: 'm_' + Math.random().toString(36).substr(2, 9),
        players,
        entryFee: fee,
        prizePool,
        mode,
        status: 'PLAYING',
        startTime: new Date().toISOString()
      };
      
      setMatchData(newMatch);
      setMatchmaking(false);
      setView('MATCH');
    }, 2000);
  };

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      setIsRolling(false);
      // Simulate turn rotation
      setTurn((prev) => (prev + 1) % (matchData?.players.length || 1));
    }, 600);
  };

  const handleWin = () => {
    if (!user || !matchData) return;
    const users = getStoredUsers();
    const uIdx = users.findIndex(u => u.id === user.id);
    users[uIdx].wallet.cash += matchData.prizePool;
    users[uIdx].wins += 1;
    users[uIdx].matchesPlayed += 1;
    users[uIdx].level = calculateLevel(users[uIdx].wins, users[uIdx].matchesPlayed);
    
    saveUsers(users);
    setUser(users[uIdx]);
    alert(`Congratulations! You won ৳${matchData.prizePool.toFixed(2)}`);
    setView('HOME');
    setMatchData(null);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView('AUTH');
  };

  // Views Components
  if (view === 'AUTH') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-dice text-4xl text-white"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">{t('welcome')}</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Login to play & win real cash prizes</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
              <input 
                type="tel" 
                placeholder="01XXXXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white transition-all"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>
            
            {phoneInput === ADMIN_CREDENTIALS.phone && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Admin Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white transition-all"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            )}

            {authMode === 'REGISTER' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Referral Code (Optional)</label>
                <input 
                  type="text" 
                  placeholder="REF123"
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white transition-all"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                />
              </div>
            )}

            <button 
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 p-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all mt-4"
            >
              {authMode === 'LOGIN' ? 'Login' : 'Register'}
            </button>

            <div className="text-center mt-6">
              <button 
                onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="text-yellow-500 text-sm font-medium"
              >
                {authMode === 'LOGIN' ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <LanguageToggle current={lang} onToggle={setLang} />
        </div>
      </div>
    );
  }

  if (view === 'MATCH' && matchData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4">
        <div className="w-full max-w-md flex justify-between items-center mb-4 text-white">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500 text-slate-900 text-xs px-2 py-1 rounded font-bold">LIVE</span>
            <span className="text-sm opacity-70">Room ID: {matchData.id.slice(-6)}</span>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-60">Prize Pool</div>
            <div className="text-yellow-400 font-bold">৳{matchData.prizePool.toFixed(2)}</div>
          </div>
        </div>

        <LudoBoard playersCount={matchData.mode === '2P' ? 2 : 4} />

        <div className="w-full max-w-md mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center justify-around w-full px-4">
            <div className={`p-2 rounded-xl transition-all ${turn === 0 ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : 'opacity-40'}`}>
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
                <i className="fa-solid fa-user text-white"></i>
              </div>
              <p className="text-[10px] text-center mt-1 text-white">You</p>
            </div>
            
            <div className="relative group">
              <button 
                disabled={turn !== 0 || isRolling}
                onClick={rollDice}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl transition-all active:scale-90 ${
                  turn === 0 ? 'bg-white text-slate-900 cursor-pointer hover:rotate-6' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                } ${isRolling ? 'dice-anim' : ''}`}
              >
                <i className={`fa-solid fa-dice-${['one','two','three','four','five','six'][diceValue-1]}`}></i>
              </button>
              {turn !== 0 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap">Opponent's Turn</div>
              )}
            </div>

            <div className={`p-2 rounded-xl transition-all ${turn !== 0 ? 'bg-red-500/20 ring-2 ring-red-500' : 'opacity-40'}`}>
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
                <i className="fa-solid fa-robot text-white"></i>
              </div>
              <p className="text-[10px] text-center mt-1 text-white">Opponent</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { if(confirm('Exit match? Entry fee will be lost.')) setView('HOME'); }}
              className="px-6 py-2 bg-slate-800 text-white rounded-full text-xs font-bold border border-slate-700"
            >
              QUIT GAME
            </button>
            <button 
              onClick={handleWin}
              className="px-6 py-2 bg-yellow-500 text-slate-900 rounded-full text-xs font-bold shadow-lg"
            >
              DEBUG WIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'ADMIN') {
    const users = getStoredUsers();
    const txs = getTransactions();
    const totalDeposit = txs.filter(t => t.type === 'DEPOSIT').reduce((acc, curr) => acc + curr.amount, 0);
    const totalWithdraw = txs.filter(t => t.type === 'WITHDRAWAL').reduce((acc, curr) => acc + curr.amount, 0);

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Managing LudoCash Pro Platform</p>
            </div>
            <button onClick={handleLogout} className="bg-slate-100 p-2 px-4 rounded-lg text-sm font-bold text-red-600">Logout</button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-blue-600">{users.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Deposits</p>
              <h3 className="text-2xl font-bold text-green-600">৳{totalDeposit}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Withdrawals</p>
              <h3 className="text-2xl font-bold text-red-600">৳{totalWithdraw}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Net Flow</p>
              <h3 className="text-2xl font-bold text-slate-900">৳{totalDeposit - totalWithdraw}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">User List</h3>
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input type="text" placeholder="Search phone..." className="bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Wallet (Cash)</th>
                  <th className="p-4">Wallet (Bonus)</th>
                  <th className="p-4">Stats (W/L)</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">{u.phone}</td>
                    <td className="p-4">৳{u.wallet.cash.toFixed(2)}</td>
                    <td className="p-4 text-slate-400">৳{u.wallet.bonus.toFixed(2)}</td>
                    <td className="p-4">{u.wins}/{u.losses}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{u.level}</span>
                    </td>
                    <td className="p-4">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {u.status}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-red-500 hover:underline">Ban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // User App View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-200">
      {/* Top Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div onClick={() => setView('PROFILE')} className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-sm overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.phone}`} alt="avatar" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">{user?.username}</h4>
            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded font-bold uppercase">{user?.level}</span>
            </div>
          </div>
        </div>
        <div onClick={() => setView('WALLET')} className="flex items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-100 cursor-pointer hover:bg-green-100 transition-all">
          <i className="fa-solid fa-wallet text-green-600 mr-2 text-xs"></i>
          <span className="font-bold text-green-700 text-sm">৳{(user?.wallet.cash || 0).toFixed(2)}</span>
          <i className="fa-solid fa-plus-circle text-green-600 ml-2 text-xs"></i>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {view === 'HOME' && (
          <div className="space-y-6">
            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-1">Refer & Earn ৳15!</h2>
                <p className="text-sm opacity-80 mb-4">Share with friends and get bonus cash.</p>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 inline-flex items-center border border-white/30">
                  <span className="font-mono font-bold mr-4 text-lg">{user?.referralId}</span>
                  <button onClick={() => { navigator.clipboard.writeText(user?.referralId || ''); alert('Copied!'); }} className="text-xs bg-white text-slate-900 px-3 py-1 rounded-lg font-bold">COPY</button>
                </div>
              </div>
              <i className="fa-solid fa-coins absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12"></i>
            </div>

            {/* Game Modes */}
            <h3 className="font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2">
               <i className="fa-solid fa-gamepad text-blue-500"></i> Select Game Mode
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setView('LOBBY')}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-500 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 text-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
                    <i className="fa-solid fa-user-group"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">2 Players</h4>
                    <p className="text-xs text-slate-500">1v1 Quick Match</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-300"></i>
              </button>

              <button 
                onClick={() => setView('LOBBY')}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-500 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800">4 Players</h4>
                    <p className="text-xs text-slate-500">Classic Battle</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-300"></i>
              </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-800 p-4 rounded-3xl text-white">
                <p className="text-[10px] uppercase opacity-60 font-bold tracking-wider">Matches</p>
                <h4 className="text-xl font-bold">{user?.matchesPlayed}</h4>
              </div>
              <div className="bg-emerald-600 p-4 rounded-3xl text-white">
                <p className="text-[10px] uppercase opacity-60 font-bold tracking-wider">Wins</p>
                <h4 className="text-xl font-bold">{user?.wins}</h4>
              </div>
            </div>
          </div>
        )}

        {view === 'LOBBY' && (
          <div className="space-y-6">
            <button onClick={() => setView('HOME')} className="text-slate-500 flex items-center gap-2 mb-4">
               <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <h3 className="text-2xl font-bold text-slate-800">Choose Entry Fee</h3>
            <p className="text-sm text-slate-500">Bonus balance will be used first.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {[10, 20, 50, 100, 500].map(fee => (
                <button 
                  key={fee}
                  onClick={() => startMatchmaking('2P', fee)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-blue-500 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold">৳</div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 font-bold uppercase">Entry</p>
                      <h4 className="font-bold text-slate-800 text-lg">৳{fee}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Prize Pool</p>
                    <p className="text-green-600 font-bold">৳{(fee * 2 * 0.94).toFixed(0)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'WALLET' && (
          <div className="space-y-6">
            <button onClick={() => setView('HOME')} className="text-slate-500 flex items-center gap-2 mb-4">
               <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Balance</p>
              <h2 className="text-5xl font-black text-slate-900 mb-6">৳{((user?.wallet.cash || 0) + (user?.wallet.bonus || 0)).toFixed(2)}</h2>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cash (Withdrawable)</p>
                  <p className="text-lg font-bold text-slate-800">৳{(user?.wallet.cash || 0).toFixed(2)}</p>
                </div>
                <div className="border-l border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Bonus (Play-only)</p>
                  <p className="text-lg font-bold text-slate-800">৳{(user?.wallet.bonus || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => {
                const amount = prompt('Enter deposit amount (min ৳10):');
                if (amount && parseInt(amount) >= 10) {
                  const updated = depositMoney(user!.id, parseInt(amount));
                  if (updated) setUser(updated);
                  alert('Deposit successful!');
                }
              }} className="bg-blue-600 text-white p-4 rounded-2xl font-bold flex flex-col items-center gap-2 shadow-lg shadow-blue-200">
                <i className="fa-solid fa-plus-circle text-xl"></i>
                Deposit
              </button>
              <button onClick={() => {
                alert('Withdrawal request submitted! Minimum withdrawal is ৳10.');
              }} className="bg-slate-800 text-white p-4 rounded-2xl font-bold flex flex-col items-center gap-2 shadow-lg shadow-slate-200">
                <i className="fa-solid fa-money-bill-transfer text-xl"></i>
                Withdraw
              </button>
            </div>

            <h4 className="font-bold text-slate-800 mt-8">Recent Transactions</h4>
            <div className="space-y-3">
              {getTransactions().filter(tx => tx.userId === user?.id).slice(-5).reverse().map(tx => (
                <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <i className={`fa-solid ${tx.type === 'DEPOSIT' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{tx.type}</p>
                      <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}৳{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'PROFILE' && (
          <div className="space-y-6">
            <button onClick={() => setView('HOME')} className="text-slate-500 flex items-center gap-2 mb-4">
               <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            
            <div className="flex flex-col items-center py-6">
              <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-white shadow-xl mb-4 overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.phone}`} alt="avatar" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{user?.username}</h3>
              <p className="text-sm text-slate-500">{user?.phone}</p>
              
              <div className="mt-4 inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full font-bold text-xs uppercase border border-yellow-200">
                <i className="fa-solid fa-crown mr-2"></i> {user?.level} Rank
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-sm text-slate-500">Referred Users</span>
                <span className="font-bold text-slate-800">{user?.referredCount || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-sm text-slate-500">Referral Earnings</span>
                <span className="font-bold text-green-600">৳{user?.totalReferralBonus || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Language</span>
                <LanguageToggle current={lang} onToggle={setLang} />
              </div>
            </div>

            <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-red-100 hover:bg-red-100 transition-all">
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout Account
            </button>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      {['HOME', 'WALLET', 'PROFILE', 'LOBBY'].includes(view) && (
        <nav className="bg-white border-t border-slate-100 p-4 flex justify-around items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-1 ${view === 'HOME' ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className="fa-solid fa-house-chimney text-lg"></i>
            <span className="text-[10px] font-bold">HOME</span>
          </button>
          <button onClick={() => setView('WALLET')} className={`flex flex-col items-center gap-1 ${view === 'WALLET' ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className="fa-solid fa-wallet text-lg"></i>
            <span className="text-[10px] font-bold">WALLET</span>
          </button>
          <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-1 ${view === 'PROFILE' ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className="fa-solid fa-user-circle text-lg"></i>
            <span className="text-[10px] font-bold">PROFILE</span>
          </button>
        </nav>
      )}

      {/* Matchmaking Overlay */}
      {matchmaking && (
        <div className="absolute inset-0 bg-slate-900/90 z-[100] flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-blue-500 border-b-transparent rounded-full animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-dice text-4xl text-white animate-bounce"></i>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('matchmaking')}</h3>
          <p className="text-slate-400 text-sm">Searching for real players in ৳10 bracket...</p>
          <button onClick={() => setMatchmaking(false)} className="mt-12 text-slate-500 underline text-sm">Cancel Matchmaking</button>
        </div>
      )}
    </div>
  );
};

export default App;
