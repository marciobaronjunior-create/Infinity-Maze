import React from 'react';
import { motion } from 'motion/react';

interface MazeGridProps {
  maze: (0 | 1 | 2 | 3)[][];
  player: { x: number; y: number };
  cellSize: number;
  skin: string;
}

export default function MazeGrid({ maze, player, cellSize, skin }: MazeGridProps) {
  return (
    <div
      className="relative shadow-2xl rounded-lg overflow-hidden border"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${maze[0].length}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${maze.length}, ${cellSize}px)`,
        borderColor: '#2A4A6B',
        backgroundColor: '#0D1B2A'
      }}
    >
      {maze.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: cell === 1 ? '#1B263B' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {cell === 3 && (
              <div
                className="w-full h-full animate-pulse"
                style={{ backgroundColor: '#00C896', opacity: 0.4 }}
              />
            )}
            {cell === 3 && (
              <span className="absolute" style={{ fontSize: cellSize * 0.6 }}>🏁</span>
            )}
          </div>
        ))
      )}

      {/* Player */}
      <motion.div
        animate={{
          x: player.x * cellSize,
          y: player.y * cellSize
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          width: cellSize,
          height: cellSize,
          zIndex: 10
        }}
      >
        {skin.startsWith('/') || skin.startsWith('http') ? (
          <img 
            src={skin} 
            alt="skin" 
            className="w-[85%] h-[85%] object-contain" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <span style={{ fontSize: cellSize * 0.8 }}>{skin}</span>
        )}
      </motion.div>
    </div>
  );
}
