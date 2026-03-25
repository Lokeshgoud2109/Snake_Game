import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-glitch font-digital flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="noise"></div>
      <div className="scanlines"></div>

      <header className="mb-8 text-center z-10 screen-tear">
         <h1 className="text-6xl md:text-8xl font-black tracking-tighter glitch-text uppercase" data-text="SYS.SNAKE_PROTOCOL">SYS.SNAKE_PROTOCOL</h1>
         <p className="text-magenta-glitch mt-2 tracking-widest uppercase text-2xl">STATUS: CORRUPTED</p>
      </header>

      <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center w-full max-w-6xl z-10">
         <div className="flex-1 flex justify-center w-full">
            <SnakeGame />
         </div>
         <div className="w-full max-w-md xl:w-80 flex-shrink-0">
            <MusicPlayer />
         </div>
      </div>
    </div>
  );
}
