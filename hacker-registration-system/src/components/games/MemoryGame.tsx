import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const symbols = ['🔒', '🔑', '💻', '🛡️', '⚡', '🎯', '🔍', '🚀'];

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const initializeGame = () => {
    const gameCards: Card[] = [];
    let id = 0;

    // Create pairs of cards
    symbols.forEach(symbol => {
      gameCards.push({
        id: id++,
        symbol,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: id++,
        symbol,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(true);
    setGameCompleted(false);
    setStartTime(new Date());
    setEndTime(null);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || gameCompleted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is completed
          if (matches + 1 === symbols.length) {
            setGameCompleted(true);
            setEndTime(new Date());
          }
        }, 500);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const getGameTime = () => {
    if (!startTime) return 0;
    const end = endTime || new Date();
    return Math.floor((end.getTime() - startTime.getTime()) / 1000);
  };

  const getScore = () => {
    if (!gameCompleted) return 0;
    const time = getGameTime();
    const efficiency = Math.max(0, 100 - moves * 2);
    const timeBonus = Math.max(0, 300 - time);
    return efficiency + timeBonus;
  };

  return (
    <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-400">
          🧠 Memory Challenge
        </h2>
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          {gameStarted ? 'Restart' : 'Start Game'}
        </button>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Moves</div>
          <div className="text-lg font-bold text-green-400">{moves}</div>
        </div>
        <div className="bg-black p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Matches</div>
          <div className="text-lg font-bold text-green-400">{matches}/{symbols.length}</div>
        </div>
        <div className="bg-black p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Time</div>
          <div className="text-lg font-bold text-green-400">{getGameTime()}s</div>
        </div>
        <div className="bg-black p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Score</div>
          <div className="text-lg font-bold text-green-400">{getScore()}</div>
        </div>
      </div>

      {/* Game Board */}
      {gameStarted ? (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-lg border-2 text-2xl font-bold transition-all duration-300 ${
                card.isMatched
                  ? 'bg-green-600 border-green-400 text-white'
                  : card.isFlipped
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-gray-700 border-gray-500 hover:border-green-400 text-transparent'
              }`}
              disabled={card.isMatched || card.isFlipped}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-400 mb-4">
            Test your memory by matching pairs of security symbols!
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors"
          >
            🚀 Start Memory Challenge
          </button>
        </div>
      )}

      {/* Game Completed */}
      {gameCompleted && (
        <div className="p-4 bg-green-900 border border-green-500 rounded mb-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-400 mb-2">
              🎉 Congratulations!
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-400">Total Moves:</span>
                <span className="ml-2 font-bold text-green-400">{moves}</span>
              </div>
              <div>
                <span className="text-gray-400">Time:</span>
                <span className="ml-2 font-bold text-green-400">{getGameTime()}s</span>
              </div>
            </div>
            <div className="text-lg">
              <span className="text-gray-400">Final Score:</span>
              <span className="ml-2 font-bold text-yellow-400">{getScore()} points</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 bg-gray-800 rounded border border-gray-600">
        <h4 className="text-sm font-semibold text-green-400 mb-2">🎯 How to Play:</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Click on cards to flip them and reveal symbols</li>
          <li>• Find matching pairs of security symbols</li>
          <li>• Complete the game in as few moves as possible</li>
          <li>• Faster completion gives bonus points</li>
        </ul>
      </div>
    </div>
  );
};