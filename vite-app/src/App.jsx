import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('water'); // 'water' or 'food'
  // ...existing code...

  // Store interaction state without triggering full React re-renders on every frame
  const gameState = useRef({
    food: [],
    waves: [],
    pointerActive: false,
    lastX: 0,
    lastY: 0
  });

  // ...existing code...

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // ...existing code...

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ...existing code...

    // Generate floating organic particles (marine snow/bubbles)
    const numParticles = 150;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      offset: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.3 + 0.05
    }));

    // ...existing code...

    // Main animation loop
    const render = (time) => {
      const { width, height } = canvas;
      // ...existing code...
    };

    // ...existing code...

    // Start Animation Loop
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []); // End of useEffect

  // --- Interactive Input Handlers ---
  const handlePointerDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gameState.current.pointerActive = true;
    gameState.current.lastX = x;
    gameState.current.lastY = y;
    if (mode === 'food') {
      gameState.current.food.push({ x, y, size: 0, targetSize: 15, rot: Math.random() * Math.PI * 2 });
      gameState.current.waves.push({ x, y, age: 0, life: 60, speed: 1.5 });
    } else {
      gameState.current.waves.push({ x, y, age: 0, life: 100, speed: 2.5 });
    }
  };

  const handlePointerMove = (e) => {
    if (!gameState.current.pointerActive || mode !== 'water') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - gameState.current.lastX;
    const dy = y - gameState.current.lastY;
    if (Math.hypot(dx, dy) > 25) {
      gameState.current.waves.push({ x, y, age: 0, life: 80, speed: 2 });
      gameState.current.lastX = x;
      gameState.current.lastY = y;
    }
  };

  const handlePointerUp = () => {
    gameState.current.pointerActive = false;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#000714]">
      {/* Interactive Mode Toggle UI */}
      <div className="absolute top-8 right-8 flex flex-col gap-4 z-20 pointer-events-auto">
        <button
          onClick={() => setMode('water')}
          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${mode === 'water' ? 'bg-cyan-500/30 border border-cyan-200 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110' : 'bg-slate-900/50 border border-slate-600 text-cyan-200 hover:bg-slate-800/60 shadow-lg'}`}
          title="Water Interaction Mode"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 12C4 12 5 14 8 14C11 14 13 10 16 10C19 10 20 12 22 12M2 16C4 16 5 18 8 18C11 18 13 14 16 14C19 14 20 16 22 16" />
          </svg>
        </button>
        <button
          onClick={() => setMode('food')}
          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${mode === 'food' ? 'bg-green-500/30 border border-green-200 text-white shadow-[0_0_15px_rgba(74,222,128,0.5)] scale-110' : 'bg-slate-900/50 border border-slate-600 text-green-300 hover:bg-slate-800/60 shadow-lg'}`}
          title="Feeding Mode"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <circle cx="12" cy="12" r="10" fill="#134d24" stroke="#0a2e12" strokeWidth="0.5"/>
            <circle cx="12" cy="12" r="8.5" fill="#7dce94" />
            <circle cx="12" cy="12" r="7" fill="#e2f5e6" />
            <path d="M12 12 Q 15 8 16 12 Q 15 16 12 12" fill="#b6e3c4" transform="rotate(0 12 12)"/>
            <path d="M12 12 Q 15 8 16 12 Q 15 16 12 12" fill="#b6e3c4" transform="rotate(120 12 12)"/>
            <path d="M12 12 Q 15 8 16 12 Q 15 16 12 12" fill="#b6e3c4" transform="rotate(240 12 12)"/>
            <ellipse cx="14" cy="11.5" rx="0.8" ry="0.4" fill="#fff" transform="rotate(30 14 11.5)"/>
            <ellipse cx="14" cy="12.5" rx="0.8" ry="0.4" fill="#fff" transform="rotate(-30 14 12.5)"/>
            <ellipse cx="10" cy="10" rx="0.8" ry="0.4" fill="#fff" transform="rotate(150 10 10)"/>
            <ellipse cx="11" cy="9" rx="0.8" ry="0.4" fill="#fff" transform="rotate(90 11 9)"/>
            <ellipse cx="10" cy="14" rx="0.8" ry="0.4" fill="#fff" transform="rotate(210 10 14)"/>
            <ellipse cx="11" cy="15" rx="0.8" ry="0.4" fill="#fff" transform="rotate(270 11 15)"/>
          </svg>
        </button>
      </div>
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="block w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
};

export default App;
