import React, { useState, useEffect, useRef } from 'react';

export default function RelativisticSimulator() {
  const canvasRef = useRef(null);
  const [velocity, setVelocity] = useState(0.5); // Fracción de c (v/c)
  const [isRunning, setIsRunning] = useState(true);
  
  // Constantes físicas
  const c = 1.0; 
  const gamma = 1.0 / Math.sqrt(1.0 - (velocity * velocity));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 500);

    // Inicializar campo de estrellas
    const numStars = 600;
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        baseColor: Math.random() > 0.5 ? '#61dafb' : '#ffffff'
      });
    }

    const render = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      const speedFactor = velocity * 15;

      stars.forEach(star => {
        if (isRunning) {
          star.z -= speedFactor;
          if (star.z <= 0) star.z = width;
        }

        // Proyección perspectiva con aberración relativista simulada
        const k = 250 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(1, (1 - star.z / width) * 3 * gamma);
          
          ctx.fillStyle = star.baseColor;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 500;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [velocity, isRunning]);

  return (
    <div style={{ backgroundColor: '#030712', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#61dafb', marginBottom: '0.50rem' }}>
            Relativistic Starfield Simulator
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Interactive Special Relativity & Lorentz Factor Laboratory | Developed for MIT Portfolio
          </p>
        </header>

        <div style={{ backgroundColor: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>
              Velocity ($v/c$): <span style={{ color: '#61dafb' }}>{velocity.toFixed(2)}c</span>
            </label>
            <div style={{ display: 'gap: 1rem' }}>
              <button 
                onClick={() => setIsRunning(!isRunning)}
                style={{ backgroundColor: isRunning ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginRight: '0.5rem' }}
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          <input 
            type="range" 
            min="0.01" 
            max="0.99" 
            step="0.01" 
            value={velocity} 
            onChange={(e) => setVelocity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#61dafb', cursor: 'pointer' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Lorentz Factor ($\gamma$)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#61dafb' }}>{gamma.toFixed(3)}</div>
            </div>
            <div style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Time Dilation Ratio</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>1s = {gamma.toFixed(2)}s (Ship)</div>
            </div>
          </div>
        </div>

        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
