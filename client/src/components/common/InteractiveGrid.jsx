import { useEffect, useRef } from 'react';

const InteractiveGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    // Pengaturan bentuk & jarak bintik (Polkadot pattern)
    const spacing = 35; // Jarak antar titik layar
    const baseRadius = 1.2; // Ukuran standar titik
    
    // Jejak pointer
    let mouse = { x: -1000, y: -1000 };
    // Tambah sedikit lerping/inertia pada partikel
    let smoothMouse = { x: -1000, y: -1000 };
    
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    
    let animationFrameId;
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.1;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.1;

      // Kalkulasi jumlah baris x kolom untuk memenuhi dimensi browser
      const cols = Math.floor(width / spacing) + 2;
      const rows = Math.floor(height / spacing) + 2;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          
          // Hitung jarak bintik tersebut dari titik kursor mouse
          const dx = smoothMouse.x - x;
          const dy = smoothMouse.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          let radius = baseRadius;
          
          // Zona interaktif (150px memancar)
          if (distance < 150) {
            const factor = (150 - distance) / 150; // nilai 0 sampai 1
            radius = baseRadius + (factor * 2.5); // Kalau dilintasi kursor, bintik membesar
            
            // Titik yang terkena radiasi kursor kita ubah ber-Glow warna biru
            ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + factor * 0.6})`;
          } else {
            // Titik diam di sekitar (Warna abu-abu debu / slate pudar)
            ctx.fillStyle = `rgba(148, 163, 184, 0.3)`;
          }
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};

export default InteractiveGrid;
