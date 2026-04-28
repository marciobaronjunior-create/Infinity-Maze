import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, User, Coins, Zap, Clock, Tv, Globe } from 'lucide-react';
import { getPlayerData, updatePlayerData, PlayerData, translations } from '@/lib/playerUtils';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerData>(getPlayerData());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showLanguageSelect, setShowLanguageSelect] = useState(!player.language);

  const t = translations[player.language || 'pt'];

  useEffect(() => {
    // Initial Login Check - Reset 24h after rescue
    const now = Date.now();
    const lastClaim = player.lastDailyLoginClaimedAt || 0;
    const isRedeemed = player.redeemedMissions.includes('DAILY_LOGIN');
    const hoursSinceClaim = (now - lastClaim) / (1000 * 60 * 60);

    if (isRedeemed && hoursSinceClaim >= 24) {
      // 24h passed, reset mission
      const updated = updatePlayerData({ 
        redeemedMissions: player.redeemedMissions.filter(id => id !== 'DAILY_LOGIN'),
        missionProgress: {
          ...player.missionProgress,
          'DAILY_LOGIN': 1
        }
      });
      setPlayer(updated);
    } else if (!isRedeemed && (player.missionProgress['DAILY_LOGIN'] || 0) === 0) {
      // First login or not yet completed today
      const updated = updatePlayerData({ 
        missionProgress: {
          ...player.missionProgress,
          'DAILY_LOGIN': 1
        }
      });
      setPlayer(updated);
    }

    const timer = setInterval(() => {
      if (player.doubleRewardUntil) {
        const remaining = Math.max(0, player.doubleRewardUntil - Date.now());
        setTimeLeft(remaining);
        if (remaining === 0 && timeLeft > 0) {
            setPlayer(getPlayerData());
        }
      }
    }, 1000);
    return () => {
        clearInterval(timer);
    };
  }, [player.doubleRewardUntil, timeLeft, player.lastDailyLoginClaimedAt, player.missionProgress, player.redeemedMissions]);

  const handleLanguageSelect = (lang: 'pt' | 'en') => {
    const updated = updatePlayerData({ language: lang });
    setPlayer(updated);
    setShowLanguageSelect(false);
  };

  const handleDoubleReward = () => {
    const now = Date.now();
    const currentUntil = player.doubleRewardUntil && player.doubleRewardUntil > now ? player.doubleRewardUntil : now;
    
    // Check if max stack (15 mins = 900000 ms)
    const maxUntil = now + (15 * 60 * 1000);
    const newUntil = Math.min(currentUntil + (5 * 60 * 1000), maxUntil);

    if (newUntil === currentUntil && currentUntil >= maxUntil) {
      alert(player.language === 'en' ? "You reached the 15 min limit!" : "Você já atingiu o tempo máximo de 15 minutos!");
      return;
    }

    const adMsg = player.language === 'en' 
      ? "Watch a short ad to earn 5 minutes of DOUBLE REWARD?" 
      : "Assista a um breve anúncio para ganhar 5 minutos de RECOMPENSA EM DOBRO!";

    const confirmAd = window.confirm(adMsg);
    if (confirmAd) {
      setTimeout(() => {
        const updated = updatePlayerData({ doubleRewardUntil: newUntil });
        setPlayer(updated);
        const successMsg = player.language === 'en' ? "Double reward activated!" : "Recompensa em dobro ativada!";
        alert(successMsg);
      }, 500);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col font-sans" style={{ background: '#0D1B2A', color: '#E0E1DD' }}>
      <AnimatePresence>
        {showLanguageSelect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0D1B2A] flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-12"
            >
              <Globe size={64} className="text-[#00C896] mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Select Language</h2>
              <p className="text-[#7A9BBF] font-bold">Selecione seu Idioma</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
              <button 
                onClick={() => handleLanguageSelect('pt')}
                className="bg-[#1B263B] border-2 border-[#2A4A6B] hover:border-[#00C896] p-6 rounded-3xl transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">Português</span>
                  <span className="text-2xl">🇧🇷</span>
                </div>
              </button>
              <button 
                onClick={() => handleLanguageSelect('en')}
                className="bg-[#1B263B] border-2 border-[#2A4A6B] hover:border-[#00C896] p-6 rounded-3xl transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">English</span>
                  <span className="text-2xl">🇺🇸</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1B263B] flex items-center justify-center bg-[#1B263B] text-2xl relative">
            {player.customAvatar ? (
              <img src={player.customAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              player.avatar
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-[#7A9BBF]">{player.nickname}</h2>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-[#415A77]">{t.level} {player.level}</p>
              <div className="flex items-center gap-1">
                <Coins size={10} className="text-yellow-500" />
                <span className="text-[10px] text-[#7A9BBF] font-bold">{player.coins}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowLanguageSelect(true)}
            className="p-2 rounded-lg bg-[#1B263B] text-[#7A9BBF] active:scale-95 transition-transform"
          >
            <Globe size={20} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg bg-[#1B263B] text-[#7A9BBF] active:scale-95 transition-transform"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 px-6 flex flex-col items-center justify-center text-center gap-8 overflow-y-auto">
        <motion.div
           initial={{ scale: 0.8, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="relative"
        >
          <div className="absolute -inset-8 bg-[#00C896] blur-[60px] opacity-10 rounded-full" />
          <div className="w-20 h-20 bg-[#1B263B] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#2A4A6B] shadow-2xl">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-3 h-3 bg-[#00C896] rounded-sm" />
              <div className="w-3 h-3 bg-transparent border border-[#00C896] rounded-sm" />
              <div className="w-3 h-3 bg-transparent border border-[#00C896] rounded-sm" />
              <div className="w-3 h-3 bg-[#00C896] rounded-sm" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter flex flex-col items-center leading-[0.9]" style={{ color: '#E0E1DD' }}>
            <span>{player.language === 'en' ? 'INFINITY' : 'LABIRINTO'}</span>
            <span className="text-[#00C896]">{player.language === 'en' ? 'MAZE' : 'INFINITO'}</span>
          </h1>
          <p className="text-[#7A9BBF] mt-2 text-xs uppercase tracking-[0.3em] font-bold opacity-80">Android Edition</p>
        </motion.div>

        {/* Double Reward Button */}
        <div className="w-full max-w-xs mb-2">
            <button
                onClick={handleDoubleReward}
                className={`w-full group relative overflow-hidden p-4 rounded-3xl flex items-center justify-between transition-all active:scale-95 border-2 ${timeLeft > 0 ? 'bg-[#00C896]/10 border-[#00C896] shadow-[0_0_20px_rgba(0,200,150,0.2)]' : 'bg-[#1B263B] border-[#2A4A6B]/50'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${timeLeft > 0 ? 'bg-[#00C896] text-[#0D1B2A]' : 'bg-[#0D1B2A] text-[#7A9BBF]'}`}>
                        {timeLeft > 0 ? <Zap size={24} fill="currentColor" /> : <Tv size={24} />}
                    </div>
                    <div className="text-left">
                        <h3 className={`font-bold text-sm ${timeLeft > 0 ? 'text-[#00C896]' : 'text-white'}`}>
                            {timeLeft > 0 ? (player.language === 'en' ? 'Double Reward Active!' : 'Recompensa em Dobro Ativa!') : (player.language === 'en' ? 'Double Reward' : 'Recompensa em Dobro')}
                        </h3>
                        <p className="text-[10px] text-[#7A9BBF] font-bold uppercase tracking-wider">
                            {timeLeft > 0 ? (player.language === 'en' ? `Left ${formatTime(timeLeft)}` : `Restam ${formatTime(timeLeft)}`) : (player.language === 'en' ? 'Watch ad +5 min' : 'Assista anúncio +5 min')}
                        </p>
                    </div>
                </div>
                {timeLeft > 0 && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-[#00C896] font-black italic text-xs mr-2"
                    >
                        2X
                    </motion.div>
                )}
            </button>
        </div>

        {/* Level Select */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/game?difficulty=easy')}
            className="group relative overflow-hidden bg-[#1B263B] p-5 rounded-3xl flex items-center justify-between transition-all hover:bg-[#1e2b42] active:scale-95 border border-[#2A4A6B]/50"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg">{t.difficulty.easy}</h3>
              <p className="text-[10px] text-[#7A9BBF] uppercase tracking-wider">{player.language === 'en' ? '15x15 Maze' : 'Labirinto 15x15'}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0D1B2A] flex items-center justify-center group-hover:bg-[#00C896] group-hover:text-[#0D1B2A] transition-all">
              <Play size={18} fill="currentColor" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/game?difficulty=medium')}
            className="group relative overflow-hidden bg-[#1B263B] p-5 rounded-3xl flex items-center justify-between transition-all hover:bg-[#1e2b42] active:scale-95 border border-[#2A4A6B]/50"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg">{t.difficulty.medium}</h3>
              <p className="text-[10px] text-[#7A9BBF] uppercase tracking-wider">{player.language === 'en' ? '25x25 Maze' : 'Labirinto 25x25'}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0D1B2A] flex items-center justify-center group-hover:bg-[#00C896] group-hover:text-[#0D1B2A] transition-all">
              <Play size={18} fill="currentColor" />
            </div>
          </motion.button>

        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="p-6 flex justify-around border-t border-[#162032] bg-[#162032]">
        <button 
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 text-[#00C896]"
        >
          <Play size={24} />
          <span className="text-[10px] font-bold">{t.play}</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center gap-1 text-[#415A77] active:text-[#7A9BBF]"
        >
          <User size={24} />
          <span className="text-[10px] font-bold">{t.profile.title}</span>
        </button>
      </footer>
    </div>
  );
}
