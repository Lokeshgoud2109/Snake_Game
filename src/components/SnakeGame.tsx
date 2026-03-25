import React, { useEffect, useRef, useState } from 'react';
import { Terminal, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 15, y: 5 },
    lastMove: 0,
    moveInterval: 100,
    particles: [] as Particle[],
    shake: 0,
    isGameOver: false,
    score: 0
  });

  const reqRef = useRef<number>(0);

  const spawnFood = (snake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    return newFood;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      state.current.particles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 0,
        maxLife: Math.random() * 20 + 10,
        color
      });
    }
  };

  const reset = () => {
    state.current = {
      snake: [{ x: 10, y: 10 }],
      dir: { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food: spawnFood([{ x: 10, y: 10 }]),
      lastMove: performance.now(),
      moveInterval: 100,
      particles: [],
      shake: 0,
      isGameOver: false,
      score: 0
    };
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (state.current.isGameOver) {
        if (e.key === 'Enter' || e.key === ' ') reset();
        return;
      }
      const { dir } = state.current;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (dir.y === 0) state.current.nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': case 'S':
          if (dir.y === 0) state.current.nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': case 'A':
          if (dir.x === 0) state.current.nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D':
          if (dir.x === 0) state.current.nextDir = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const update = (time: number) => {
    const s = state.current;
    if (s.isGameOver) {
       s.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
       });
       s.particles = s.particles.filter(p => p.life < p.maxLife);
       if (s.shake > 0) s.shake -= 1;
       return;
    }

    if (time - s.lastMove > s.moveInterval) {
      s.dir = s.nextDir;
      const head = s.snake[0];
      const newHead = { x: head.x + s.dir.x, y: head.y + s.dir.y };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        s.isGameOver = true;
        setGameOver(true);
        s.shake = 30;
        spawnParticles(head.x, head.y, '#0ff');
        return;
      }

      if (s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        s.isGameOver = true;
        setGameOver(true);
        s.shake = 30;
        spawnParticles(head.x, head.y, '#0ff');
        return;
      }

      s.snake.unshift(newHead);

      if (newHead.x === s.food.x && newHead.y === s.food.y) {
        s.score += 10;
        setScore(s.score);
        setHighScore(prev => Math.max(prev, s.score));
        s.food = spawnFood(s.snake);
        s.shake = 8;
        spawnParticles(newHead.x, newHead.y, '#f0f');
        s.moveInterval = Math.max(40, s.moveInterval - 2);
      } else {
        s.snake.pop();
      }

      s.lastMove = time;
    }

    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
    });
    s.particles = s.particles.filter(p => p.life < p.maxLife);

    if (s.shake > 0) s.shake -= 1;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = state.current;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    ctx.save();
    if (s.shake > 0) {
      const dx = (Math.random() - 0.5) * s.shake;
      const dy = (Math.random() - 0.5) * s.shake;
      ctx.translate(dx, dy);
    }

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for(let i=0; i<=BOARD_SIZE; i+=CELL_SIZE) {
       ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, BOARD_SIZE); ctx.stroke();
       ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(BOARD_SIZE, i); ctx.stroke();
    }

    ctx.fillStyle = '#f0f';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f0f';
    ctx.fillRect(s.food.x * CELL_SIZE + 2, s.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    ctx.shadowColor = '#0ff';
    s.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#fff' : '#0ff';
      ctx.shadowBlur = i === 0 ? 20 : 10;
      ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    s.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      const size = Math.max(0, 6 * (1 - p.life / p.maxLife));
      ctx.fillRect(p.x - size/2, p.y - size/2, size, size);
    });

    ctx.restore();
  };

  const loop = (time: number) => {
    update(time);
    draw();
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center bg-black p-6 border-2 border-cyan-glitch shadow-[8px_8px_0px_#0ff] w-full max-w-[460px] relative screen-tear">
      <div className="flex justify-between w-full mb-4 px-2 border-b-2 border-cyan-glitch pb-2">
        <div className="flex items-center gap-2 text-cyan-glitch text-3xl uppercase">
          <span>MEM:{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex items-center gap-2 text-magenta-glitch text-3xl uppercase">
          <Terminal size={28} />
          <span>MAX:{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="relative border-2 border-cyan-glitch p-1 bg-black">
        <canvas
          ref={canvasRef}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          className="block"
          style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10">
            <div className="text-magenta-glitch text-6xl mb-2 glitch-text uppercase" data-text="SYS_FAILURE">
              SYS_FAILURE
            </div>
            <p className="text-cyan-glitch text-2xl mb-8 uppercase">DATA_LOST: {score}</p>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 bg-black text-cyan-glitch border-2 border-cyan-glitch hover:bg-cyan-glitch hover:text-black transition-colors uppercase text-3xl cursor-pointer"
            >
              <RotateCcw size={28} />
              REBOOT
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-cyan-glitch text-lg flex gap-4 uppercase opacity-70">
        <span>[W,A,S,D] INPUT</span>
        <span>[SPACE] OVERRIDE</span>
      </div>
    </div>
  );
}
