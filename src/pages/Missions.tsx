import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Zap, Target, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { getPlayerData, updatePlayerData, PlayerData, translations } from '@/lib/playerUtils';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward?: string;
  rewardKey?: string;
  progress: number;
  total: number;
  type: 'daily' | 'weekly' | 'special' | 'unique';
  rewardType?: 'avatar' | 'skin' | 'currency';
  rewardValue?: string;
}

const MISSIONS_BASE: Omit<Mission, 'progress'>[] = [
  {
    id: 'DAILY_LOGIN',
    title: 'dailyLogin',
    description: 'Login daily to earn rewards.',
    rewardKey: 'dailyLoginReward',
    total: 1,
    type: 'daily'
  },
  {
    id: '1',
    title: 'Explorador Matinal',
    description: 'Complete 5 labirintos.',
    rewardKey: 'explorerReward',
    total: 5,
    type: 'daily'
  },
  {
    id: '2',
    title: 'Mestre do Tempo',
    description: 'Termine um labirinto médio em menos de 2 minutos.',
    rewardKey: 'timeMasterReward',
    total: 1,
    type: 'daily'
  },
  {
    id: '3',
    title: 'Persistência Blindada',
    description: 'Jogue por 7 dias consecutivos.',
    rewardKey: 'alienSkinReward',
    total: 7,
    type: 'unique',
    rewardType: 'skin',
    rewardValue: '👽'
  },
  {
    id: '7',
    title: 'Mestre do Labirinto',
    description: 'Complete 100 labirintos no total.',
    rewardKey: 'mazeMasterReward',
    total: 100,
    type: 'unique'
  },
  {
    id: '8',
    title: 'Apoiador do Jogo',
    description: 'Assista 50 anúncios para ajudar o projeto.',
    rewardKey: 'supporterReward',
    total: 50,
    type: 'unique'
  },
  {
    id: '9',
    title: 'Grande apoiador',
    description: 'Torne-se um apoiador lendário assistindo 100 anúncios.',
    rewardKey: 'kingSkinReward',
    total: 100,
    type: 'unique',
    rewardType: 'skin',
    rewardValue: '👑'
  },
  {
    id: '5',
    title: 'Colecionador de Estrelas',
    description: 'Colete 50 estrelas nos labirintos.',
    rewardKey: 'starCollectorReward',
    total: 50,
    type: 'weekly'
  },
  {
    id: '6',
    title: 'Maratona do Labirinto',
    description: 'Complete 30 labirintos no total esta semana.',
    rewardKey: 'mazeMasterReward',
    total: 30,
    type: 'weekly'
  },
  {
    id: '4',
    title: 'Velocidade da Luz',
    description: 'Complete 10 labirintos hoje.',
    rewardKey: 'lightSpeedReward',
    total: 10,
    type: 'special'
  }
];

const missionTranslations = {
  pt: {
    'DAILY_LOGIN': { title: 'Login Diário', desc: 'Entre no jogo hoje.', reward: '+50 XP e 20 Moedas 💰' },
    '1': { title: 'Explorador Matinal', desc: 'Complete 5 labirintos.', reward: '+50 XP e 15 Moedas 💰' },
    '2': { title: 'Mestre do Tempo', desc: 'Termine um labirinto médio em menos de 2 minutos.', reward: '+150 XP e 15 Moedas 💰' },
    '3': { title: 'Persistência Blindada', desc: 'Jogue por 7 dias consecutivos.', reward: 'Skin Alien 👽' },
    '7': { title: 'Mestre do Labirinto', desc: 'Complete 100 labirintos no total.', reward: '+500 XP e 50 Moedas 💰' },
    '8': { title: 'Apoiador do Jogo', desc: 'Assista 50 anúncios para ajudar o projeto.', reward: '+500 XP e 50 Moedas 💰' },
    '9': { title: 'Grande apoiador', desc: 'Torne-se um apoiador lendário assistindo 100 anúncios.', reward: 'Skin Rei 👑' },
    '5': { title: 'Colecionador de Estrelas', desc: 'Colete 50 estrelas nos labirintos.', reward: '100 Moedas' },
    '6': { title: 'Maratona do Labirinto', desc: 'Complete 30 labirintos no total esta semana.', reward: '+500 XP e 50 Moedas 💰' },
    '4': { title: 'Velocidade da Luz', desc: 'Complete 10 labirintos hoje.', reward: '+300 XP e 15 Moedas 💰' }
  },
  en: {
    'DAILY_LOGIN': { title: 'Daily Login', desc: 'Enter the game today.', reward: '+50 XP and 20 Coins 💰' },
    '1': { title: 'Morning Explorer', desc: 'Complete 5 mazes.', reward: '+50 XP and 15 Coins 💰' },
    '2': { title: 'Time Master', desc: 'Finish a medium maze in under 2 minutes.', reward: '+150 XP and 15 Coins 💰' },
    '3': { title: 'Steady Persistence', desc: 'Play for 7 consecutive days.', reward: 'Alien Skin 👽' },
    '7': { title: 'Maze Master', desc: 'Complete 100 mazes in total.', reward: '+500 XP and 50 Coins 💰' },
    '8': { title: 'Game Supporter', desc: 'Watch 50 ads to help the project.', reward: '+500 XP and 50 Coins 💰' },
    '9': { title: 'Grand Supporter', desc: 'Become a legendary supporter by watching 100 ads.', reward: 'King Skin 👑' },
    '5': { title: 'Star Collector', desc: 'Collect 50 stars in the mazes.', reward: '100 Coins' },
    '6': { title: 'Maze Marathon', desc: 'Complete 30 mazes total this week.', reward: '+500 XP and 50 Coins 💰' },
    '4': { title: 'Light Speed', desc: 'Complete 10 mazes today.', reward: '+300 XP and 15 Coins 💰' }
  }
};

export default function Missions() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [activeTab, setActiveTab] = React.useState<'daily' | 'weekly' | 'unique'>('daily');

  useEffect(() => {
    setPlayer(getPlayerData());
  }, []);

  if (!player) return null;

  const lang = player.language || 'pt';
  const t = translations[lang];
  const mt = missionTranslations[lang];

  const missions: Mission[] = MISSIONS_BASE.map(m => {
    const translation = mt[m.id as keyof typeof mt];
    return {
      ...m,
      title: translation?.title || m.id,
      description: translation?.desc || '',
      reward: translation?.reward || '',
      progress: player.missionProgress[m.id] || 0
    };
  });

  const filteredMissions = missions.filter(m => {
    if (activeTab === 'daily') return m.type === 'daily' || m.type === 'special';
    if (activeTab === 'weekly') return m.type === 'weekly';
    return m.type === 'unique';
  });

  const handleRedeem = (mission: Mission) => {
    if (player.redeemedMissions.includes(mission.id)) return;

    let updates: Partial<PlayerData> = {
      redeemedMissions: [...player.redeemedMissions, mission.id]
    };

    // Apply specific rewards
    if (mission.rewardType === 'avatar' && mission.rewardValue) {
      updates.unlockedAvatars = Array.from(new Set([...player.unlockedAvatars, mission.rewardValue]));
    } else if (mission.rewardType === 'skin' && mission.rewardValue) {
      updates.unlockedSkins = Array.from(new Set([...player.unlockedSkins, mission.rewardValue]));
    }

    // Generic XP/Coins (Simulation based on text since we don't have perfect structured data for all)
    if (mission.id === '8' || mission.id === '7' || mission.id === '6') {
      updates.xp = (player.xp || 0) + 500;
      updates.coins = (player.coins || 0) + 50;
    } else if (mission.id === '1') {
      updates.xp = (player.xp || 0) + 50;
      updates.coins = (player.coins || 0) + 15;
    } else if (mission.id === '4') {
      updates.xp = (player.xp || 0) + 300;
      updates.coins = (player.coins || 0) + 15;
    } else if (mission.id === 'DAILY_LOGIN') {
      updates.xp = (player.xp || 0) + 50;
      updates.coins = (player.coins || 0) + 20;
      updates.lastDailyLoginClaimedAt = Date.now();
      updates.missionProgress = {
        ...player.missionProgress,
        'DAILY_LOGIN': 0
      };
    }

    const updated = updatePlayerData(updates);
    setPlayer(updated);
    const alertMsg = lang === 'en' ? `Reward from "${mission.title}" claimed successfully!` : `Recompensa de "${mission.title}" resgatada com sucesso!`;
    alert(alertMsg);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0D1B2A', color: '#E0E1DD' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <button onClick={() => navigate('/profile')} className="p-1" style={{ color: '#7A9BBF' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">{t.missionsTitle}</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Category Badge */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${activeTab === 'daily' ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20' : 'bg-[#1B263B] text-[#415A77] border-[#2A4A6B]/30'}`}
            >
              {t.tabs.daily}
            </button>
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${activeTab === 'weekly' ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20' : 'bg-[#1B263B] text-[#415A77] border-[#2A4A6B]/30'}`}
            >
              {t.tabs.weekly}
            </button>
            <button 
              onClick={() => setActiveTab('unique')}
              className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${activeTab === 'unique' ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20' : 'bg-[#1B263B] text-[#415A77] border-[#2A4A6B]/30'}`}
            >
              {t.tabs.unique}
            </button>
        </div>

        {filteredMissions.map((mission, index) => {
          const isCompleted = mission.progress === mission.total;
          const isRedeemed = player.redeemedMissions.includes(mission.id);

          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={mission.id}
              className={`p-5 rounded-3xl border relative overflow-hidden group transition-all ${isRedeemed ? 'bg-[#1B263B]/50 border-[#2A4A6B]/10 grayscale opacity-60' : 'bg-[#1B263B] border-[#2A4A6B]/30 shadow-xl'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${isRedeemed ? 'text-[#7A9BBF]' : ''}`}>
                    {isCompleted ? <CheckCircle2 size={16} className="text-[#00C896]" /> : <Target size={16} className="text-[#7A9BBF]" />}
                    {mission.title}
                  </h3>
                  <p className="text-[11px] text-[#7A9BBF] mt-1">{mission.description}</p>
                </div>
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 ml-2 ${isRedeemed ? 'bg-[#415A77]/10 text-[#415A77]' : 'bg-[#00C896]/5 text-[#00C896]'}`}>
                  {(mission.id === '3' || (mission.rewardType === 'skin' && mission.rewardValue === '👽')) && <span className="text-sm">👽</span>}
                  {(mission.id === '9' || (mission.rewardType === 'skin' && mission.rewardValue === '👑')) && <span className="text-sm">👑</span>}
                  {mission.reward}
                </div>
              </div>

              {/* Progress or Redeem Button */}
              {isCompleted && !isRedeemed ? (
                <button
                  onClick={() => handleRedeem(mission)}
                  className="w-full mt-4 bg-[#00C896] text-[#0D1B2A] py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_4px_0_#008F6B] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#008F6B] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Gift size={14} />
                  {t.redeem}
                </button>
              ) : (
                <div className="mt-4">
                  <div className="flex justify-between text-[9px] font-bold text-[#415A77] mb-1 uppercase tracking-tighter">
                    <span>{isRedeemed ? t.completed : t.progress}</span>
                    <span>{mission.progress} / {mission.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0D1B2A] rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(mission.progress / mission.total) * 100}%` }}
                       className={`h-full ${isRedeemed ? 'bg-[#415A77]' : 'bg-[#00C896] shadow-[0_0_10px_rgba(0,200,150,0.5)]'}`} 
                    />
                  </div>
                </div>
              )}
              
              {mission.type === 'daily' && !isRedeemed && (
                  <div className="absolute top-0 right-0 p-1">
                      <Clock size={10} className="text-[#415A77] opacity-20" />
                  </div>
              )}

              {isRedeemed && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={12} className="text-[#00C896]/30" />
                </div>
              )}
            </motion.div>
          );
        })}

        <div className="pt-4 text-center">
            <p className="text-[10px] text-[#415A77] font-bold tracking-widest uppercase">{t.newMissionsIn} 14h 22m</p>
        </div>
      </div>
    </div>
  );
}
