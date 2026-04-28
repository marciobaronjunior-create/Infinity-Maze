import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaze } from '@/hooks/useMaze';
import MazeGrid from '@/components/maze/MazeGrid';
import DPad from '@/components/maze/DPad';
import { ArrowLeft, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlayerData, updatePlayerData, translations } from '@/lib/playerUtils';
import { motion } from 'motion/react';

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Game() {
  const navigate = useNavigate();
  const playerData = getPlayerData();
  const t = translations[playerData.language || 'pt'];
  const params = new URLSearchParams(window.location.search);
  const difficulty = params.get('difficulty') || 'easy';
  const { maze, player, elapsed, won, move, config, stars, restart } = useMaze(difficulty);
  const [showVictory, setShowVictory] = useState(false);
  const savedRanking = useRef(false);

  // Swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showVictory) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (showVictory || !touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 20) return;
    if (absDx > absDy) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
    touchStart.current = null;
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showVictory) return;
      if (e.key === 'ArrowUp' || e.key === 'w') move('up');
      if (e.key === 'ArrowDown' || e.key === 's') move('down');
      if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
      if (e.key === 'ArrowRight' || e.key === 'd') move('right');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move, showVictory]);

  // On win — save best time, save ranking to DB, and show internally
  useEffect(() => {
    if (!won || savedRanking.current) return;
    savedRanking.current = true;

    // Save best time locally
    const key = `bestTime_${difficulty}`;
    const prev = localStorage.getItem(key);
    if (!prev || elapsed < parseInt(prev)) {
      localStorage.setItem(key, String(elapsed));
    }

    // Save to global ranking DB (just the entry, rewards handled on collect)
    const pData = getPlayerData();
    base44.entities.RankingEntry.create({
      nickname: pData.nickname || 'Anônimo',
      avatar: pData.avatar || '🧑',
      customAvatar: pData.customAvatar,
      time: elapsed,
      difficulty,
    });

    // Calculate stars based on weighted probability
    const rand = Math.random();
    let earnedStars = 3;
    if (rand < 0.15) earnedStars = 5;
    else if (rand < 0.50) earnedStars = 4;
    else earnedStars = 3;

    setTimeout(() => {
      setShowVictory(true);
      // We can pass the stars to the victory local state if needed, 
      // but for now let's just use it in the UI calculation below.
    }, 600);
  }, [won, difficulty, elapsed, stars]);

  const baseCoins = difficulty === 'easy' ? 10 : 25;
  const baseXp = difficulty === 'easy' ? 20 : 50;

  const isGlobalDoubleActive = playerData.doubleRewardUntil ? playerData.doubleRewardUntil > Date.now() : false;

  // We'll recalculate stars for display in the overlay using a stable method or just show it based on probability logic
  const victoryStars = useMemo(() => {
    if (!showVictory) return 0;
    const rand = Math.random();
    if (rand < 0.15) return 5;
    if (rand < 0.50) return 4;
    return 3;
  }, [showVictory]);

  const collectReward = (multiplier: number = 1) => {
    const pData = getPlayerData();
    const finalMultiplier = isGlobalDoubleActive ? multiplier * 2 : multiplier;

    const coinsReward = baseCoins * finalMultiplier;
    const xpReward = baseXp * finalMultiplier;

    const newXp = pData.xp + xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;

    updatePlayerData({
      coins: (pData.coins || 0) + coinsReward,
      xp: newXp,
      level: newLevel
    });

    // Reset game state
    setShowVictory(false);
    savedRanking.current = false;
    restart();
  };

  // Compute cell size based on viewport
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    if (!maze) return;
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const availH = vh * 0.55;
      const availW = vw - 32;
      const byH = Math.floor(availH / maze.length);
      const byW = Math.floor(availW / maze[0].length);
      setCellSize(Math.max(8, Math.min(byH, byW, 30)));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [maze]);

  const diffLabel = t.difficulty[difficulty as keyof typeof t.difficulty];

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#0D1B2A' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <button onClick={() => navigate('/')} className="p-1" style={{ color: '#7A9BBF' }}>
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7A9BBF' }}>{diffLabel}</div>
          <div className="text-[10px] opacity-70" style={{ color: '#2A4A6B' }}>{t.level} {playerData.level}</div>
        </div>
        <div className="font-mono font-bold text-lg" style={{ color: '#00C896' }}>
          ⏱ {formatTime(elapsed)}
        </div>
      </div>

      {/* Maze */}
      <div className="flex-1 flex items-center justify-center p-4" ref={containerRef}>
        {maze ? (
          <MazeGrid maze={maze} player={player} cellSize={cellSize} skin={playerData.mazeSkin} />
        ) : (
          <div className="animate-pulse" style={{ color: '#7A9BBF' }}>{playerData.language === 'en' ? 'Generating maze...' : 'Gerando labirinto...'}</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center pb-8 pt-4 border-t" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <DPad onMove={move} />
      </div>

      {/* Victory Overlay */}
      {showVictory && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/90 backdrop-blur-sm p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm bg-[#162032] rounded-[2rem] border border-[#2A4A6B] p-8 text-center shadow-2xl"
          >
            <div className="text-6xl mb-2">🏆</div>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < victoryStars ? "text-yellow-400 text-2xl" : "text-gray-600 text-2xl"}>
                  ⭐
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{t.victory}</h2>
            <p className="text-[#7A9BBF] mb-6">
              {playerData.language === 'en' ? 'You completed the maze in ' : 'Você completou o labirinto em '}
              <span className="text-[#00C896] font-bold">{formatTime(elapsed)}</span>
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => collectReward(1)}
                className="w-full py-4 rounded-2xl bg-yellow-500 text-[#0D1B2A] font-black text-sm uppercase tracking-widest shadow-[0_4px_0_#B45309] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
              >
                <span>{t.nextLabyrinth}</span>
                <span className="bg-[#0D1B2A]/10 px-2 py-0.5 rounded-lg text-[10px]">
                  +{isGlobalDoubleActive ? baseCoins * 2 : baseCoins} 💰
                </span>
                {isGlobalDoubleActive && <Zap size={14} className="text-[#0D1B2A]" fill="currentColor" />}
              </button>

              {!isGlobalDoubleActive && (
                <button
                  onClick={() => collectReward(2)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_0_#4C1D95] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                >
                  <span>{t.collectDouble}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">
                    +{baseCoins * 2} 💰
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
