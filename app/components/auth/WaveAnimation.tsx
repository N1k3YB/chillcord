'use client';

import React, { useEffect, useRef } from 'react';

const WaveAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Устанавливаем размеры холста
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Параметры анимации
    const waveColor = '#5865F2'; // Discord blurple
    const backgroundColor = '#404EED'; // Discord background color
    
    // Создаем несколько волн с разными параметрами
    const waves = [
      { frequency: 0.003, amplitude: 50, speed: 0.03, offset: 0 },
      { frequency: 0.006, amplitude: 30, speed: 0.05, offset: 4 },
      { frequency: 0.009, amplitude: 15, speed: 0.07, offset: 8 }
    ];
    
    // Функция анимации
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Заливаем фон градиентом
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, backgroundColor);
      bgGradient.addColorStop(1, '#2F3136');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем все волны
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.6);
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = Math.sin(x * wave.frequency + wave.offset) * wave.amplitude + canvas.height * 0.6;
          ctx.lineTo(x, y);
        }
        
        // Замыкаем путь
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Прозрачность зависит от индекса волны
        const alpha = 0.6 - index * 0.2;
        
        // Заливаем градиентом
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
        gradient.addColorStop(0, `rgba(88, 101, 242, ${alpha})`); // Discord blurple с прозрачностью
        gradient.addColorStop(1, 'rgba(54, 57, 63, 0)'); // Прозрачный фон
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Обновляем смещение для анимации
        wave.offset += wave.speed;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

export default WaveAnimation; 