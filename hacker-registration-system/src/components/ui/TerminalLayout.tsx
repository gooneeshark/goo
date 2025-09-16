import React, { useEffect } from 'react';

interface TerminalLayoutProps {
  children: React.ReactNode;
  showMatrixRain?: boolean;
  showScanLine?: boolean;
  className?: string;
}

const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  children,
  showMatrixRain = true,
  showScanLine = true,
  className = '',
}) => {
  return (
    <div className={`relative min-h-screen w-full bg-hacker-dark text-hacker-green font-terminal ${className}`}>
      {/* Matrix Rain Background */}
      {showMatrixRain && <MatrixRain />}
      
      {/* Scan Line Effect */}
      {showScanLine && <ScanLine />}
      
      {/* Content Container */}
      <div className="content-container relative z-10 bg-black bg-opacity-70 min-h-screen">
        {children}
      </div>
    </div>
  );
};

// Matrix Rain Component
const MatrixRain: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full viewport
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();

    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?กขคงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      updateCanvasSize();
      // Recalculate columns when window is resized
      const newColumns = Math.floor(canvas.width / fontSize);
      while (drops.length < newColumns) {
        drops.push(1);
      }
      while (drops.length > newColumns) {
        drops.pop();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full -z-10 opacity-50" />;
};

// Scan Line Effect Component
const ScanLine: React.FC = () => {
  return (
    <div className="scan-line fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-hacker-green to-transparent opacity-70 pointer-events-none animate-scan-line z-20" />
  );
};

export default TerminalLayout;