'use client';

import { useEffect, useRef } from 'react';

interface Props { active: boolean; color: string; }

interface Particle { x: number; y: number; r: number; d: number; color: string; angle: number; spin: number; }

export default function Confetti({ active, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);
  const partsRef  = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      partsRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;
    const palette = [color, '#ffd60a', '#ffffff', '#2dc653', '#ff9f43'];

    partsRef.current = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 220,
      r: 4 + Math.random() * 6,
      d: 1.5 + Math.random() * 2.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      partsRef.current.forEach(p => {
        p.angle += p.spin;
        p.y += p.d;
        p.x += Math.sin(p.angle) * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      partsRef.current = partsRef.current.filter(p => p.y < canvas!.height + 20);
      if (partsRef.current.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, color]);

  return <canvas ref={canvasRef} className="cf-canvas" />;
}
