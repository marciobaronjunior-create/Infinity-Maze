import { useState, useEffect, useCallback, useRef } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type Cell = 0 | 1 | 2 | 3; // 0: path, 1: wall, 2: start, 3: end

interface Point {
  x: number;
  y: number;
}

export function useMaze(difficulty: string) {
  const [maze, setMaze] = useState<Cell[][] | null>(null);
  const [player, setPlayer] = useState<Point>({ x: 1, y: 1 });
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = difficulty === 'easy' ? { width: 15, height: 15 } : { width: 25, height: 25 };

  const generateMaze = useCallback(() => {
    const { width, height } = config;
    const grid: Cell[][] = Array(height).fill(null).map(() => Array(width).fill(1));

    function walk(x: number, y: number) {
      grid[y][x] = 0;
      const dirs = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 1) {
          grid[y + dy / 2][x + dx / 2] = 0;
          walk(nx, ny);
        }
      }
    }

    walk(1, 1);
    grid[1][1] = 2; // Start
    grid[height - 2][width - 2] = 3; // End
    
    setMaze(grid);
    setPlayer({ x: 1, y: 1 });
    setElapsed(0);
    setWon(false);
  }, [config.width, config.height]);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  useEffect(() => {
    if (!won && maze) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [won, maze]);

  const move = useCallback((dir: Direction) => {
    if (won || !maze) return;

    setPlayer(prev => {
      let nx = prev.x;
      let ny = prev.y;

      if (dir === 'up') ny--;
      if (dir === 'down') ny++;
      if (dir === 'left') nx--;
      if (dir === 'right') nx++;

      if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length && maze[ny][nx] !== 1) {
        if (maze[ny][nx] === 3) {
          setWon(true);
        }
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [maze, won]);

  const restart = useCallback(() => {
    generateMaze();
  }, [generateMaze]);

  const stars = elapsed < (difficulty === 'easy' ? 30 : 60) ? 3 : elapsed < (difficulty === 'easy' ? 60 : 120) ? 2 : 1;

  return { maze, player, elapsed, won, move, restart, config, stars };
}
