import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Lock, Medal, Star, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Primeiros Passos',
    description: 'Complete seu primeiro labirinto.',
    icon: <Medal size={24} />,
    unlocked: true,
    rarity: 'common'
  },
  {
    id: '2',
    title: 'Flash',
    description: 'Termine um labirinto em menos de 30 segundos.',
    icon: <Flame size={24} />,
    unlocked: true,
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Inabalável',
    description: 'Vença 10 vezes seguidas sem errar o caminho.',
    icon: <Lock size={24} />,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: '4',
    title: 'Lenda do Labirinto',
    description: 'Alcance o nível 10.',
    icon: <Trophy size={24} />,
    unlocked: false,
    rarity: 'legendary'
  }
];

export default function Achievements() {
  const navigate = useNavigate();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#A335EE';
      case 'rare': return '#0070DD';
      default: return '#7A9BBF';
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0D1B2A', color: '#E0E1DD' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <button onClick={() => navigate('/profile')} className="p-1" style={{ color: '#7A9BBF' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">Conquistas</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((ach, index) => (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              key={ach.id}
              className={`p-5 rounded-[2rem] border flex flex-col items-center text-center gap-3 transition-all ${
                ach.unlocked 
                ? 'bg-[#1B263B] border-[#2A4A6B]/50' 
                : 'bg-[#1B263B]/30 border-transparent opacity-40 grayscale'
              }`}
            >
              <div 
                className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl ${
                    ach.unlocked ? 'bg-[#0D1B2A]' : 'bg-[#0D1B2A]/50'
                }`}
                style={{ color: ach.unlocked ? getRarityColor(ach.rarity) : '#415A77' }}
              >
                {ach.icon}
              </div>
              <div>
                <h3 className="font-bold text-xs leading-tight mb-1">{ach.title}</h3>
                <p className="text-[9px] text-[#415A77] font-medium leading-tight">{ach.description}</p>
              </div>
              
              {ach.unlocked && (
                  <div className="px-2 py-0.5 rounded-full bg-[#00C896]/10 text-[#00C896] text-[8px] font-black uppercase tracking-tighter">
                      DESBLOQUEADO
                  </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
