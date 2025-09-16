import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameProvider } from './contexts/GameContext';
import SupabaseStatus from './components/dev/SupabaseStatus';
import AuthContainer from './components/auth/AuthContainer';
import { LearningHub } from './pages/LearningHub';
import AboutUs from './pages/AboutUs';
import { GameCenter } from './pages/GameCenter';

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

// LoginForm component has been moved to components/auth/LoginForm.tsx
// and is now part of AuthContainer

// Navigation Component
const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/learning', label: 'Learning Hub', icon: '🎓' },
    { path: '/games', label: 'Game Center', icon: '🎮' },
    { path: '/about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <nav className="bg-gray-900 border-b border-green-500 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-green-500 font-bold text-xl">
            🔒 Goonee Security
          </Link>
          <div className="hidden md:flex space-x-4">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded transition-colors ${
                  location.pathname === item.path
                    ? 'bg-green-600 text-white'
                    : 'text-green-400 hover:bg-green-900'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-green-400 text-sm">
                👤 {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Not authenticated</span>
          )}
        </div>
      </div>
    </nav>
  );
};

const WelcomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [typedText, setTypedText] = useState('');
  const fullText = 'HACKER ACCESS TERMINAL';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, []);

  return (
    <div className="content-container min-h-screen w-full text-hacker-green font-terminal">
      {/* Scan Line Effect */}
      <div className="scan-line"></div>

      {/* Content Layer */}
      <div className="w-full flex flex-col items-center justify-start pt-5 p-4 sm:p-6 lg:p-8">
        <div className="text-center space-y-4 sm:space-y-6 max-w-4xl w-full">
          {/* ASCII Art Header */}
          <div className="hidden sm:block">
            <pre className="text-xs lg:text-sm text-hacker-green leading-tight">
              {`
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████║███████║██║     █████╔╝ █████╗  ██████╔╝
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

██████╗ ███████╗ ██████╗ ██╗███████╗████████╗██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
██████╔╝█████╗  ██║  ███╗██║███████╗   ██║   ██████╔╝███████║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██╗██╔══╝  ██║   ██║██║╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
██║  ██║███████╗╚██████╔╝██║███████║   ██║   ██║  ██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`}
            </pre>
          </div>

          {/* Mobile Header */}
          <div className="block sm:hidden">
            <div className="text-2xl font-bold text-hacker-green mb-4">
              <div>HACKER</div>
              <div>REGISTRATION</div>
              <div className="text-terminal-green">SYSTEM</div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold text-terminal-green">
              {typedText}
              <span className="terminal-cursor ml-1"></span>
            </h1>

            {/* System Status */}
            <div className="output-area bg-opacity-20 p-3 sm:p-4 text-left text-xs sm:text-sm space-y-1 sm:space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">SYSTEM STATUS:</span>
                <span className="text-hacker-green font-mono">{user ? 'AUTHENTICATED' : 'UNAUTHENTICATED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CONNECTION:</span>
                <span className="text-hacker-green font-mono">SECURE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TIME:</span>
                <span className="text-hacker-green font-mono">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </span>
              </div>
            </div>

            {user ? (
              <div className="mt-8 text-center">
                <p className="text-hacker-green mb-4">Welcome back, {user.email}!</p>
                <button 
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-900 text-white hover:bg-red-700 transition-colors"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <div className="mt-8 sm:mt-12">
                <div className="border border-hacker-green p-4 sm:p-6 bg-black bg-opacity-70">
                  <AuthContainer />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-xs text-gray-600 opacity-50">
              <span className="opacity-30">v1.0.0 | {process.env.NODE_ENV === 'development' ? 'DEVELOPMENT' : 'PRODUCTION'}</span>
            </div>
            
            <div className="border border-hacker-green p-3 hover:bg-hacker-green hover:bg-opacity-10 transition-colors cursor-pointer">
              <div className="text-xs sm:text-sm">
                <div className="text-hacker-green">{'>'} REGISTER MODULE</div>
                <div className="text-gray-400 mt-1">Status: Development</div>
              </div>
            </div>

            {/* Quick Access Menu */}
            {user && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link 
                  to="/learning"
                  className="border border-green-500 p-4 hover:bg-green-900 hover:bg-opacity-20 transition-colors cursor-pointer group"
                >
                  <div className="text-sm">
                    <div className="text-green-400 group-hover:text-green-300">🎓 Learning Hub</div>
                    <div className="text-gray-400 mt-1 text-xs">Interactive coding playground</div>
                  </div>
                </Link>
                
                <Link 
                  to="/games"
                  className="border border-green-500 p-4 hover:bg-green-900 hover:bg-opacity-20 transition-colors cursor-pointer group"
                >
                  <div className="text-sm">
                    <div className="text-green-400 group-hover:text-green-300">🎮 Game Center</div>
                    <div className="text-gray-400 mt-1 text-xs">Learn through fun games</div>
                  </div>
                </Link>
                
                <Link 
                  to="/about"
                  className="border border-green-500 p-4 hover:bg-green-900 hover:bg-opacity-20 transition-colors cursor-pointer group"
                >
                  <div className="text-sm">
                    <div className="text-green-400 group-hover:text-green-300">ℹ️ About Goonee</div>
                    <div className="text-gray-400 mt-1 text-xs">Learn about our mission</div>
                  </div>
                </Link>
              </div>
            )}

            {/* Command Prompt */}
            <div className="flex items-center justify-center mt-6 sm:mt-8 text-sm sm:text-base">
              <span className="text-hacker-green mr-2">root@hacker-system:~$</span>
              <span className="terminal-cursor"></span>
            </div>

            {/* Hidden Easter Egg Hint */}
            <div className="text-xs text-gray-600 mt-4 opacity-50">
              <span className="opacity-30">Hint: Try the Konami Code ↑↑↓↓←→←→BA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="App relative min-h-screen w-full bg-black">
      {isHomePage && <MatrixRain />}
      <Navigation />
      
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/learning" element={<LearningHub />} />
        <Route path="/games" element={<GameCenter />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
      
      <SupabaseStatus showDetails={true} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GameProvider>
  );
};

export default App;
