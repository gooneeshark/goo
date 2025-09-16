import React, { useState } from 'react';
import TerminalLayout from '../components/ui/TerminalLayout';
import { HackerTypingGame } from '../components/games/HackerTypingGame';
import { MemoryGame } from '../components/games/MemoryGame';

interface GameStats {
  typingWPM: number;
  typingAccuracy: number;
  memoryBestScore: number;
  gamesPlayed: number;
}

export const GameCenter: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'typing' | 'memory' | 'none'>('none');
  const [stats, setStats] = useState<GameStats>({
    typingWPM: 0,
    typingAccuracy: 0,
    memoryBestScore: 0,
    gamesPlayed: 0
  });

  const games = [
    {
      id: 'typing',
      title: 'Hacker Typing Challenge',
      description: 'Improve your coding speed by typing security-related code snippets',
      icon: '⌨️',
      difficulty: 'Intermediate',
      category: 'Skill Building'
    },
    {
      id: 'memory',
      title: 'Security Memory Game',
      description: 'Test your memory with cybersecurity symbols and icons',
      icon: '🧠',
      difficulty: 'Beginner',
      category: 'Brain Training'
    }
  ];

  const handleTypingComplete = (wpm: number, accuracy: number) => {
    setStats(prev => ({
      ...prev,
      typingWPM: Math.max(prev.typingWPM, wpm),
      typingAccuracy: Math.max(prev.typingAccuracy, accuracy),
      gamesPlayed: prev.gamesPlayed + 1
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-900';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900';
      case 'advanced': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  return (
    <TerminalLayout>
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-green-500">
              🎮 Game Center - Learn Through Play
            </h1>
            <p className="text-green-300">
              Sharpen your hacking skills through interactive games and challenges
            </p>
          </div>

          {activeGame === 'none' && (
            <>
              {/* Stats Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                  <div className="text-2xl mb-2">⌨️</div>
                  <div className="text-sm text-gray-400">Best WPM</div>
                  <div className="text-xl font-bold text-green-400">{stats.typingWPM}</div>
                </div>
                <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm text-gray-400">Best Accuracy</div>
                  <div className="text-xl font-bold text-green-400">{stats.typingAccuracy}%</div>
                </div>
                <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="text-sm text-gray-400">Memory Score</div>
                  <div className="text-xl font-bold text-green-400">{stats.memoryBestScore}</div>
                </div>
                <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm text-gray-400">Games Played</div>
                  <div className="text-xl font-bold text-green-400">{stats.gamesPlayed}</div>
                </div>
              </div>

              {/* Game Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {games.map(game => (
                  <div
                    key={game.id}
                    className="bg-gray-900 border border-green-500 rounded-lg p-6 hover:border-green-400 transition-colors cursor-pointer group"
                    onClick={() => setActiveGame(game.id as any)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{game.icon}</div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </span>
                        <span className="text-xs text-gray-400">{game.category}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-green-400 mb-2 group-hover:text-green-300">
                      {game.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4">
                      {game.description}
                    </p>
                    
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition-colors">
                      Play Now
                    </button>
                  </div>
                ))}
              </div>

              {/* Learning Benefits */}
              <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                  🎓 Learning Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-300 mb-2">⌨️ Typing Challenge</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Improve coding speed and accuracy</li>
                      <li>• Learn security-related code patterns</li>
                      <li>• Practice proper typing technique</li>
                      <li>• Build muscle memory for common syntax</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-300 mb-2">🧠 Memory Game</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Enhance visual memory skills</li>
                      <li>• Learn cybersecurity symbols</li>
                      <li>• Improve concentration and focus</li>
                      <li>• Develop pattern recognition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Game Content */}
          {activeGame === 'typing' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-500">
                  ⌨️ Hacker Typing Challenge
                </h2>
                <button
                  onClick={() => setActiveGame('none')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  ← Back to Games
                </button>
              </div>
              <HackerTypingGame onComplete={handleTypingComplete} />
            </div>
          )}

          {activeGame === 'memory' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-500">
                  🧠 Security Memory Game
                </h2>
                <button
                  onClick={() => setActiveGame('none')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  ← Back to Games
                </button>
              </div>
              <MemoryGame />
            </div>
          )}

          {/* Achievement System */}
          {activeGame === 'none' && (
            <div className="mt-8 bg-gray-900 border border-green-500 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-green-400">
                🏆 Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded border ${stats.typingWPM >= 30 ? 'border-yellow-500 bg-yellow-900' : 'border-gray-600 bg-gray-800'}`}>
                  <div className="text-2xl mb-2">🥉</div>
                  <h3 className="font-semibold">Speed Demon</h3>
                  <p className="text-sm text-gray-400">Type 30+ WPM</p>
                  <p className="text-xs mt-1">{stats.typingWPM}/30 WPM</p>
                </div>
                <div className={`p-4 rounded border ${stats.typingAccuracy >= 95 ? 'border-yellow-500 bg-yellow-900' : 'border-gray-600 bg-gray-800'}`}>
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold">Precision Master</h3>
                  <p className="text-sm text-gray-400">95%+ Accuracy</p>
                  <p className="text-xs mt-1">{stats.typingAccuracy}/95%</p>
                </div>
                <div className={`p-4 rounded border ${stats.gamesPlayed >= 10 ? 'border-yellow-500 bg-yellow-900' : 'border-gray-600 bg-gray-800'}`}>
                  <div className="text-2xl mb-2">🎮</div>
                  <h3 className="font-semibold">Game Enthusiast</h3>
                  <p className="text-sm text-gray-400">Play 10 games</p>
                  <p className="text-xs mt-1">{stats.gamesPlayed}/10 games</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TerminalLayout>
  );
};