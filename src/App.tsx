import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

// --- CONSTANTS ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 100; // slightly faster for more intensity

const TRACKS = [
  { id: 1, title: '0x01_SYS.OP.CYBER_PUNK.wav', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: '0x02_NEURAL_NET_OVERRIDE.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: '0x03_GLITCH_GHOST_IN_MACHINE.ogg', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function App() {
  // --- STATE: GAME ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // --- STATE: LOGS ---
  const [logs, setLogs] = useState<string[]>([
    '> INITIALIZING NEURAL LINK...',
    '> BYPASSING FIREWALL...',
    '> ACCESS GRANTED.',
    '> LOADING SERPENT PROTOCOL...'
  ]);

  // --- STATE: AUDIO ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- GAME LOGIC ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood());
    setGameStarted(true);
    setLogs(prev => [...prev.slice(-8), '> PROTOCOL ACTIVE.']);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (!gameStarted && e.key === 'Enter') {
        resetGame();
        return;
      }

      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Collision with walls
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return prevSnake;
        }

        // Collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood());
          const hex = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase().padStart(8, '0');
          setLogs(prev => [...prev.slice(-8), `> 0x${hex} : MEM_ALLOC_SUCCESS`]);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, gameStarted, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    if (score > highScore) {
      setHighScore(score);
    }
    setLogs(prev => [...prev.slice(-8), '> CRITICAL FAILURE. ENTITY TERMINATED.']);
  };

  // --- RANDOM LOGS ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStarted && !gameOver) {
        const hex = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase().padStart(8, '0');
        setLogs(prev => {
          const newLogs = [...prev, `> 0x${hex} : SECTOR_SCAN_OK`];
          return newLogs.slice(-9); // Keep last 9
        });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // --- AUDIO LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  const toggleMute = () => setIsMuted(!isMuted);

  const handleTrackEnd = () => {
    nextTrack();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffff] font-mono crt-flicker relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="scanlines"></div>
      <div className="static-noise"></div>
      
      <div className="tear-effect w-full max-w-7xl flex flex-col items-center justify-center relative z-10">
        {/* HEADER */}
        <header className="w-full flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <h1 className="text-5xl font-bold glitch uppercase tracking-widest text-[#ff00ff]" data-text="NEON_SERPENT_OS">
              NEON_SERPENT_OS
            </h1>
            <span className="text-sm opacity-70 mt-1 bg-[#ff00ff] text-black inline-block px-1 w-max">v.9.4.2 // UNAUTHORIZED ACCESS</span>
          </div>
          
          <div className="text-right neon-border-cyan p-2 bg-black/80 backdrop-blur-sm">
            <div className="text-sm opacity-70 glitch" data-text="MEM_ALLOC // SCORE">MEM_ALLOC // SCORE</div>
            <div className="text-2xl">0xCURR: <span className="text-[#ff00ff]">{score.toString(16).toUpperCase().padStart(4, '0')}</span></div>
            <div className="text-xl opacity-80">0xHIGH: {highScore.toString(16).toUpperCase().padStart(4, '0')}</div>
          </div>
        </header>

        {/* MAIN CONTENT GRID */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT PANEL: SYSTEM INFO */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="neon-border-magenta p-4 bg-black/80 h-64 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00ff] animate-pulse"></div>
              <h2 className="text-xl border-b border-[#ff00ff] pb-2 mb-2 flex items-center gap-2 glitch" data-text="SYS.MEM_DUMP">
                <Terminal size={18} /> SYS.MEM_DUMP
              </h2>
              <div className="flex-1 overflow-y-auto text-xs opacity-90 space-y-1 flex flex-col justify-end font-bold">
                {logs.map((log, i) => (
                  <p key={i} className={log.includes('CRITICAL') ? 'text-[#ff00ff] glitch' : log.includes('SUCCESS') ? 'text-white' : 'text-[#00ffff]'}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="neon-border-cyan p-4 bg-black/80 flex-1 relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#00ffff] animate-pulse"></div>
               <h2 className="text-xl border-b border-[#00ffff] pb-2 mb-2 glitch" data-text="I/O_INTERFACE">I/O_INTERFACE</h2>
               <ul className="text-sm space-y-4 opacity-90 mt-4">
                 <li className="flex justify-between border-b border-[#00ffff]/20 pb-1"><span>[W/A/S/D]</span> <span className="text-[#ff00ff]">MOVE_VECTOR</span></li>
                 <li className="flex justify-between border-b border-[#00ffff]/20 pb-1"><span>[ARROWS]</span> <span className="text-[#ff00ff]">MOVE_VECTOR</span></li>
                 <li className="flex justify-between border-b border-[#00ffff]/20 pb-1"><span>[ENTER]</span> <span className="text-[#ff00ff]">EXECUTE</span></li>
               </ul>
            </div>
          </div>

          {/* CENTER PANEL: GAME GRID */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            <div 
              className="relative bg-black neon-border-cyan p-1"
              style={{ 
                width: '100%', 
                maxWidth: '500px', 
                aspectRatio: '1/1',
                boxShadow: gameOver ? '0 0 30px #ff00ff, inset 0 0 30px #ff00ff' : '0 0 20px #00ffff, inset 0 0 20px #00ffff',
                borderColor: gameOver ? '#ff00ff' : '#00ffff',
                transition: 'all 0.1s ease'
              }}
            >
              {/* GAME BOARD */}
              <div 
                className="w-full h-full grid" 
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                  const isHead = snake[0].x === x && snake[0].y === y;
                  const isFood = food.x === x && food.y === y;

                  return (
                    <div 
                      key={i} 
                      className={`
                        ${isHead ? 'bg-[#ff00ff] shadow-[0_0_12px_#ff00ff] z-10 scale-110' : ''}
                        ${isSnake && !isHead ? 'bg-[#00ffff] opacity-90 shadow-[0_0_8px_#00ffff]' : ''}
                        ${isFood ? 'bg-white shadow-[0_0_15px_#ffffff] animate-ping' : ''}
                        ${!isSnake && !isFood ? 'bg-transparent border-[1px] border-[#00ffff]/20' : ''}
                      `}
                    />
                  );
                })}
              </div>

              {/* OVERLAYS */}
              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md z-20">
                  <h2 className="text-5xl mb-6 glitch text-[#00ffff]" data-text="AWAITING_EXECUTION">AWAITING_EXECUTION</h2>
                  <p className="text-3xl animate-pulse opacity-100 glitch bg-[#ff00ff] text-black px-4 py-2" data-text="PRESS [ENTER] TO START">PRESS [ENTER] TO START</p>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md z-20">
                  <h2 className="text-6xl mb-4 text-[#ff00ff] glitch" data-text="KERNEL_PANIC">KERNEL_PANIC</h2>
                  <p className="text-2xl mb-8 text-white">0xFINAL_ALLOC: {score.toString(16).toUpperCase().padStart(4, '0')}</p>
                  <p className="text-3xl animate-pulse opacity-100 glitch bg-[#00ffff] text-black px-4 py-2" data-text="PRESS [ENTER] TO REBOOT">PRESS [ENTER] TO REBOOT</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: AUDIO PLAYER */}
          <div className="flex flex-col gap-4">
            <div className="neon-border-magenta p-4 bg-black/80 flex flex-col relative">
              <div className="absolute top-0 right-0 w-1 h-full bg-[#ff00ff] animate-pulse"></div>
              <h2 className="text-xl border-b border-[#ff00ff] pb-2 mb-4 glitch" data-text="AURAL_STIMULUS">AURAL_STIMULUS</h2>
              
              <div className="mb-6">
                <div className="text-xs opacity-70 mb-1">ACTIVE_STREAM:</div>
                <div className="text-lg truncate text-[#00ffff] animate-pulse font-bold">
                  {isPlaying ? TRACKS[currentTrackIndex].title : 'STREAM_PAUSED'}
                </div>
                
                {/* Fake visualizer */}
                <div className="flex items-end gap-1 h-16 mt-4 border-b border-[#00ffff]/50 pb-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-[#ff00ff] opacity-90"
                      style={{
                        height: isPlaying ? `${Math.random() * 100}%` : '5%',
                        transition: 'height 0.05s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto">
                <button onClick={prevTrack} className="p-2 hover:text-[#ff00ff] hover:bg-[#ff00ff]/20 transition-colors border border-transparent hover:border-[#ff00ff]">
                  <SkipBack size={24} />
                </button>
                <button 
                  onClick={togglePlay} 
                  className="p-3 neon-border-cyan rounded-none hover:bg-[#00ffff]/30 transition-colors bg-[#00ffff]/10"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button onClick={nextTrack} className="p-2 hover:text-[#ff00ff] hover:bg-[#ff00ff]/20 transition-colors border border-transparent hover:border-[#ff00ff]">
                  <SkipForward size={24} />
                </button>
                <button onClick={toggleMute} className="p-2 hover:text-white hover:bg-white/20 transition-colors ml-4 border-l border-[#00ffff]/50 pl-4">
                  {isMuted ? <VolumeX size={20} className="text-[#ff00ff]" /> : <Volume2 size={20} />}
                </button>
              </div>

              <audio 
                ref={audioRef}
                src={TRACKS[currentTrackIndex].url}
                onEnded={handleTrackEnd}
                className="hidden"
              />
            </div>

            <div className="neon-border-cyan p-4 bg-black/80 flex-1 relative">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00ffff] animate-pulse"></div>
              <h2 className="text-xl border-b border-[#00ffff] pb-2 mb-2 glitch" data-text="DATA_STREAMS">DATA_STREAMS</h2>
              <ul className="space-y-3 text-sm mt-4">
                {TRACKS.map((track, idx) => (
                  <li 
                    key={track.id}
                    className={`cursor-pointer truncate p-2 border ${idx === currentTrackIndex ? 'bg-[#ff00ff]/30 text-white border-[#ff00ff]' : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#00ffff]/50'}`}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                  >
                    {track.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="absolute bottom-2 left-0 w-full text-center text-xs opacity-60 z-10 text-[#ff00ff] tracking-widest">
        WARNING: PROLONGED EXPOSURE MAY CAUSE NEURAL DEGRADATION.
      </footer>
    </div>
  );
}
