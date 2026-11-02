import React, { useState, useEffect, useRef } from 'react';

export default function RelativisticSimulator() {
  const canvasRef = useRef(null);
  const [velocity, setVelocity] = useState(0.5); // Fracción de c (v/c)
  const [isRunning, setIsRunning] = useState(true);
  const [dopplerEnabled, setDopplerEnabled] = useState(true);

  // Cálculo del Factor de Lorentz y Factor Doppler Relativista
  const v = Math.min(Math.max(velocity, 0.001), 0.9999);
  const gamma = 1.0 / Math.sqrt(1.0 - v * v);
  const dopplerFactor = Math.sqrt((1 + v) / (1 - v));

  const presets = [
    { label: 'Orbital (Sub-Relativistic)', v: 0.1, desc: '10% c - Minimal Lorentz effects' },
    { label: 'Moderate Relativistic', v: 0.5, desc: '50% c - Noticeable Time Dilation' },
    { label: 'High Relativistic', v: 0.9, desc: '90% c - Extreme Relativistic Shift' },
    { label: 'Ultra Light-Speed', v: 0.999, desc: '99.9% c - Extreme Blueshift & Aberration' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 520);

    // Inicializar campo de estrellas
    const numStars = 750;
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2.5,
        y: (Math.random() - 0.5) * height * 2.5,
        z: Math.random() * width,
        wavelength: 500 + (Math.random() - 0.5) * 200 // Longitud de onda base en nm (espectro visible)
      });
    }

    // Función para mapear desplazamiento Doppler a colores HSL/Hex
    const getShiftedColor = (baseWavelength) => {
      if (!dopplerEnabled) return '#ffffff';
      
      // Blueshift al aproximarse (longitud de onda comprimida)
      const shiftedWavelength = baseWavelength / dopplerFactor;

      if (shiftedWavelength < 380) return '#a855f7'; // Ultravioleta / Violeta extremo
      if (shiftedWavelength < 450) return '#3b82f6'; // Azul
      if (shiftedWavelength < 495) return '#06b6d4'; // Cian
      if (shiftedWavelength < 570) return '#22c55e'; // Verde
      if (shiftedWavelength < 620) return '#eab308'; // Amarillo
      if (shiftedWavelength < 750) return '#ef4444'; // Rojo (Redshift)
      return '#6b7280'; // Infrarrojo
    };

    const render = () => {
      // Fondo de espacio profundo
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const speedFactor = velocity * 22;

      stars.forEach(star => {
        if (isRunning) {
          star.z -= speedFactor;
          if (star.z <= 0) {
            star.z = width;
            star.x = (Math.random() - 0.5) * width * 2.5;
            star.y = (Math.random() - 0.5) * height * 2.5;
          }
        }

        // Aberración estelar y proyección
        const k = 260 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(1, (1 - star.z / width) * 3.5 * (gamma * 0.4 + 0.6));
          const color = getShiftedColor(star.wavelength);

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();

          // Trazado de estela relativista a altas velocidades
          if (velocity > 0.65 && isRunning) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = Math.min(0.6, (velocity - 0.5) * 1.2);
            ctx.lineWidth = size * 0.6;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(width / 2 + (px - width / 2) * (1 + velocity * 0.15), height / 2 + (py - height / 2) * (1 + velocity * 0.15));
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      });

      // Overlay HUD (Cabina de la nave)
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;

      // Retícula central de observación
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.moveTo(cx - 50, cy); ctx.lineTo(cx - 15, cy);
      ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 50, cy);
      ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy - 15);
      ctx.moveTo(cx, cy + 15); ctx.lineTo(cx, cy + 50);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 520;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [velocity, isRunning, dopplerEnabled, dopplerFactor, gamma]);

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        
        {/* Encabezado Principal */}
        <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              Relativistic Starfield Simulator 
              <span style={{ fontSize: '0.75rem', backgroundColor: '#0369a1', color: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>HUD v3.0 Pro</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem', margin: 0 }}>
              Special Relativity Laboratory: Lorentz Factor & Doppler Blueshift | MIT Admission Portfolio
            </p>
          </div>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            style={{ backgroundColor: isRunning ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isRunning ? 'PAUSE' : 'RESUME'}
          </button>
        </header>

        {/* Seleccionador de Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {presets.map((p) => (
            <button
              key={p.v}
              onClick={() => setVelocity(p.v)}
              style={{
                backgroundColor: velocity === p.v ? '#0284c7' : '#0f172a',
                border: velocity === p.v ? '1px solid #38bdf8' : '1px solid #1e293b',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: velocity === p.v ? '#fff' : '#38bdf8' }}>{p.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.v}c</div>
            </button>
          ))}
        </div>

        {/* Panel de Controles y Métricas */}
        <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>
              Target Velocity ($v/c$): <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1.1rem' }}>{velocity.toFixed(3)}c</span>
            </label>
            <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
              <input type="checkbox" checked={dopplerEnabled} onChange={(e) => setDopplerEnabled(e.target.checked)} />
              Enable Relativistic Doppler Shift
            </label>
          </div>

          <input 
            type="range" 
            min="0.001" 
            max="0.999" 
            step="0.001" 
            value={velocity} 
            onChange={(e) => setVelocity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />

          {/* Telemetría Relativista */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Lorentz Factor ($\gamma$)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>{gamma.toFixed(4)}</div>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Time Dilation Ratio</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4ade80', fontFamily: 'monospace' }}>1s Ship = {gamma.toFixed(2)}s Earth</div>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '0.85rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Doppler Shift Factor</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#a855f7', fontFamily: 'monospace' }}>{dopplerFactor.toFixed(3)}x</div>
            </div>
          </div>
        </div>

        {/* Viewport de la Nave */}
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
